#/usr/bin/python
import urllib, urllib2
import csv
import os
import geojson
from geojson import MultiPoint
import string
import Image

north = -1.3000
south = -1.3232
east = 36.8079
west = 36.7663

def readfile(filename):
  with open(filename, 'r') as f:
    read_data = f.read()
  f.closed
  return read_data

def writefile(file_name, buf):
  myFile = open(file_name, 'w')
  myFile.write(buf)
  myFile.close()

def url2file(url,file_name):
  req = urllib2.Request(url)
  try:
    rsp = urllib2.urlopen(req)
  except urllib2.HTTPError, err:
    print str(err.code) + " " + url
    return
  myFile = open(file_name, 'w')
  myFile.write(rsp.read())
  myFile.close()

def sync_osm():
  #url = 'http://overpass-api.de/api/interpreter'
  file_name = 'kibera-schools-osm.xml'
  bbox = "36.7651,-1.3211,36.8178,-1.3009"
  url = "http://overpass-api.de/api/interpreter?data=[bbox];node['education:type'];out%20meta;&bbox=" + bbox
  #values = dict(data='<osm-script><osm-script output="json" timeout="25"><union><query type="node"><has-kv k="amenity" v="school"/><bbox-query e="36.8079" n="-1.3000" s="-1.3232" w="36.7663"/></query></union><print mode="body"/><recurse type="down"/><print mode="meta"/></osm-script></osm-script>')  
  #data = urllib.urlencode(values)
  #req = urllib2.Request(url, data)
  req = urllib2.Request(url)
  rsp = urllib2.urlopen(req)
  myFile = open(file_name, 'w')
  myFile.write(rsp.read())
  myFile.close()

def kenyaopendata():
  #https://www.opendata.go.ke/Education/Kenya-Secondary-Schools-2007/i6vz-a543
  url2file('https://www.opendata.go.ke/api/views/i6vz-a543/rows.csv?accessType=DOWNLOAD','kenya-secondary-schools.csv')
  #https://www.opendata.go.ke/Education/Kenya-Primary-Schools-2007/p452-xb7c
  url2file('https://www.opendata.go.ke/api/views/p452-xb7c/rows.csv?accessType=DOWNLOAD','kenya-primary-schools.csv')

def filter_data(input_file,output_file,division_column,location_column,write_id,other_columns):
  f = open(input_file)
  #header = f.readline()
  #header_list = f.readline.replace("\n","").split(',')
  reader = csv.DictReader(f)

  column_list = ['official_name', 'lat', 'lon']
  column_list.extend(other_columns)
  writer = csv.DictWriter(open(output_file,'w'),column_list)

  header = dict()
  for item in column_list:
    header[ item ] = item
  writer.writerow(header)

  for row in reader:
    [lat,lon] = row[location_column].replace('(','').replace(')','').split(',')
    # TODO check if we really need all of "KIBERA"
    if (row[division_column] == 'GOLF COURSE' or row[division_column] == "KENYATTA/GOLF COURSE" or row[division_column] == "KIBERA" or row[division_column] == "LAINI SABA" or row[division_column] == "MAKINA" or row[division_column] == "MUGUMOINI" or row[division_column] == "OLYMPIC" or row[division_column] == "SARANGOMBE" or row[division_column] == "SERA NGOMBE") or ((float(lat) <= north and float(lat) >= south) and (float(lon) <= east and float(lon) >= west)):
      out_row = dict()
      out_row['official_name'] = row[write_id]
      out_row['lat'] = lat
      out_row['lon'] = lon
      for h in other_columns:
        out_row[h] = row[h]
      writer.writerow(out_row)

def filter_kenyaopendata():
  other_columns = ['Level of Education', 'Status of School','Sponsor of School','School Institution Type_1','School Institution Type_2','School Institution Type_3','Pupil Teacher Ratio','Pupil Classroom Ratio','Pupil Toilet Ratio','Total Number of Classrooms','Boys Toilets','Girls Toilets','Teachers Toilets','Total Toilets','Total Boys','Total Girls','Total Enrolment','GOK TSC Male','GOK TSC Female','Local Authority Male','Local Authority Female','PTA BOG Male','PTA BOG Female','Others Male','Others Female','Non-Teaching Staff Male','Non-Teaching Staff Female','Province','District','Division','Location','Costituency']
  filter_data('kenya-primary-schools.csv','kibera-primary-schools.csv','Location','Geolocation','Name of School', other_columns)

  other_columns = ['Code','School Address','Public or Private','School Sponsor','Girls/Boys/Mixed','Day or Boarding','Ordinary or Special','Total Enrolment 2007','Total Teaching staff','Pupil Teacher Ratio','Acreage per enrolment','TSC Male Teachers','TSC Female Teachers','Local Authority Male Teachers','Local Authority Female Teachers','PTA Board of Governors Male Teacher','PTA Board of Governors Female Teacher','Other Male Teachers','Other Female Teachers','Non Teaching Staff Male','Non Teaching Staff Female','Acreage','District','Location','Sublocation','School Zone','Costituency','Province']
  filter_data('kenya-secondary-schools.csv','kibera-secondary-schools.csv','Location','Location 1','Name of School', other_columns) #Code??

def convert2geojson():
  os.system("rm kibera-primary-schools.geojson")
  os.system("ogr2ogr -f GeoJSON kibera-primary-schools.geojson kibera-primary-schools.vrt")
  os.system("rm kibera-secondary-schools.geojson")
  os.system("ogr2ogr -f GeoJSON kibera-secondary-schools.geojson kibera-secondary-schools.vrt")
  kod_primary = geojson.loads(readfile('kibera-primary-schools.geojson'))
  kod_secondary = geojson.loads(readfile('kibera-secondary-schools.geojson'))
  kod_primary.features.extend(kod_secondary.features)
  dump = geojson.dumps(kod_primary, sort_keys=True, indent=2)
  writefile('kibera-primary-secondary-schools.geojson',dump)
  os.system("osmtogeojson -e kibera-schools-osm.xml > kibera-schools-osm.geojson")

def compare_osm_kenyaopendata():
  osm = geojson.loads(readfile('kibera-schools-osm.geojson'))
  kod = geojson.loads(readfile('kibera-primary-secondary-schools.geojson'))
  result = {}
  result['type'] = 'FeatureCollection'
  result['features'] = []

  #TODO make sure all features in KOD are in OSM (through osmly)
  for feature in osm.features:
    points = [(feature.geometry.coordinates[0], feature.geometry.coordinates[1])]
    properties = {}
    #properties = feature.properties
    for osm_property in feature.properties['tags'].keys():
      properties[ "osm:" + osm_property ] = feature.properties['tags'][ osm_property ]
    properties[ "osm:_user" ] = feature.properties['meta']['user']
    properties[ "osm:_timestamp" ] = feature.properties['meta']['timestamp']
    properties[ "osm:id" ] = feature['id'] #TODO change to "_id"?

    if 'official_name' in feature.properties['tags']:
      for kod_feature in kod.features:
        if 'official_name' in kod_feature.properties and kod_feature.properties['official_name'] == feature.properties['tags']['official_name']:
          #print feature.properties['official_name']
          points.append((kod_feature.geometry.coordinates[0],  kod_feature.geometry.coordinates[1]))
          for kod_property in kod_feature.properties.keys():
            if kod_property != 'lat' and kod_property != 'lon':
              properties[ "kenyaopendata:" + kod_property] = kod_feature.properties[ kod_property ]

    geom = MultiPoint(points)
    result['features'].append( { "type": "Feature", "properties": properties, "geometry": geom })

  dump = geojson.dumps(result, sort_keys=True, indent=2)
  writefile('kibera-combined-schools.geojson',dump)

def slug_image(img_url):
  valid_chars = "%s%s" % (string.ascii_letters, string.digits)
  slug = ''.join(c for c in img_url if c in valid_chars)
  return slug

def cache_image(osm_id, osm_name, img_type, img_url):
  slug = slug_image(img_url)
  cache_dir = "../content/images/cache/" + osm_id + '/' + slug + '/'
  if not os.path.exists(cache_dir):
    os.makedirs(cache_dir)

  fileName, fileExtension = os.path.splitext(img_url)
  if not os.path.exists(cache_dir + 'orig' + fileExtension):
    url2file(img_url, cache_dir + 'orig' + fileExtension) 

  if os.path.exists(cache_dir + 'orig' + fileExtension):
    try:
      im = Image.open(cache_dir + 'orig' + fileExtension)
    except IOError:
      print "IMAGE ERROR," + osm_name + "," + osm_id + "," + img_type + "," + img_url
      print "orig image error " + cache_dir + 'orig' + fileExtension
      return
   
    size = 300, 225
    if not os.path.exists(cache_dir + 'med' + fileExtension):
      try:
        im.thumbnail(size)
        im.save(cache_dir + 'med' + fileExtension)
      except KeyError:
        print "IMAGE ERROR," + osm_name + "," + osm_id + "," + img_type + "," + img_url
        print "unknown extension error " + cache_dir + 'med' + fileExtension
        return
  else:
    print "IMAGE ERROR," + osm_name + "," + osm_id + "," + img_type + "," + img_url
    print "orig image missing " + cache_dir + 'orig' + fileExtension

def get_image_cache(osm_id, img_type, img_url, cache_size):
  slug = slug_image(img_url)
  cache_path = "/data/images/cache/" + osm_id + '/' + slug + '/'
  fileName, fileExtension = os.path.splitext(img_url)
  return cache_path + cache_size + fileExtension

def cache_images():
  combined = geojson.loads(readfile('kibera-combined-schools.geojson'))
  for index, feature in enumerate(combined.features):
    images = []
    for prop in ["osm:image:classroom","osm:image:compound","osm:image:other", "osm:image:outside"]:
      if prop in feature['properties']:
        cache_image(feature['properties']['osm:id'], feature['properties']['osm:name'], prop, feature['properties'][prop])
        image = get_image_cache(feature['properties']['osm:id'], prop, feature['properties'][prop], 'med')
        images.append(image)
    if len(images) > 0:
      combined.features[index]['properties']['osm:images'] = ','.join(images)
  dump = geojson.dumps(combined, sort_keys=True, indent=2)
  writefile('kibera-combined-schools.geojson',dump)

def deploy():
  os.system("cp kibera-combined-schools.geojson ../content/schools/")

#TODO make command line configurable .. Fabric?  
#kenyaopendata()
#filter_kenyaopendata()
sync_osm()
convert2geojson()
compare_osm_kenyaopendata()
#cache_images()
#deploy()

#TODO generate statistics on each run of comparison results
#TODO generate list of ODK schools unmapped
