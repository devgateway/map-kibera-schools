;

// global leaflet config
L.Icon.Default.imagePath = WEB_ROOT + 'static/img/leaflet';

(function drawMaps() {

  var mapEl,
      data = { 'features': [] },
      iconDefaults = {
        iconUrl: '/static/img/icon-yellow.png',
        shadowUrl: '/static/img/leaflet/marker-shadow.png',
        iconSize: L.point(25, 39),
        iconAnchor: L.point(13, 39),
        popupAnchor: L.point(0, -24)
      },
      geoProperties = {},
      listProperties = {  // object so we can test for keys with 'in'
        'osm:education:type': true
      },
      filters = {
        'Type of School': ['osm:operator:type', 'kenyaopendata:Sponsor of School'],
        'Male Students': ['osm:education:students_male', 'kenyaopendata:Total Boys'],
        'Female Students': ['osm:education:students_female', 'kenyaopendata:Total Girls'],
        'Education Level': ['osm:education:type', 'kenyaopendata:Level of Education'],
        'Teachers': ['osm:education:teachers', 'kenyaopendata:Total Teaching staff']
      },
      activeFilters = {};

  if (mapEl = document.getElementById('main-map')) {
    map = drawMap(mapEl);
    domLoadSchoolDataAll();
    pinAllSchools(map);
    setupFilters();
  } else if (mapEl = document.getElementById('school-map-display')) {
    map = drawMap(mapEl);
    pinSchool(map);
  } else {
    return;
  }

  function getJSON(url, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = function gotGet() {
      if (request.status >= 200 && request.status < 400) {
        data = JSON.parse(request.responseText);
        callback(data);
      } else {
        console.error('GET failed for url ' + url +
                      '; not running callback ' + callback);
      }
    };
    request.send();
  }

  function drawMap(mapEl) {
    var mapOptions = {
      center: [-1.313, 36.788],
      zoom: 15,
      scrollWheelZoom: false
    };
    var map = L.map(mapEl, mapOptions);
    // todo: switch back to custom tile styles, but base them on HOT.
    L.tileLayer('http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png').addTo(map)
    return map;
  }

  function addPropertiesAndValues(properties, countedProperties) {
    // get all filters and possible values
    u.each(Object.keys(properties), function saveProperty(property) {
      if (! (property in countedProperties)) {
        countedProperties[property] = {};
      }
      var rawValue = properties[property];
      var values = property in listProperties ? rawValue.split(',') : [rawValue];
      u.each(values, function countValues(value) {
        if (! (value in countedProperties[property])) {
          countedProperties[property][value] = 1;
        } else {
          countedProperties[property][value] += 1;
        }
      });
    });
  }

  function fixProperties(propertiesWithCounts) {
    var properties = {};
    u.each(Object.keys(propertiesWithCounts), function collapseObj(propKey) {
      var propKeyArray = [];
      for (key in propertiesWithCounts[propKey]) {
        propKeyArray.push([key, propertiesWithCounts[propKey][key]]);
      }
      properties[propKey] = propKeyArray.sort(function sortProps(a, b) {
        return b[1] - a[1];  // sort desc
      });
    });
    return properties;
  }

  function domLoadSchoolDataAll() {
    var geoSchool,
        countedProperties = {},
        schoolEls = document.querySelectorAll('#schools .school-list > ul > li > a');
    u.eachNode(schoolEls, function loadSchoolData(node) {
      var schoolProperties = JSON.parse(decodeURIComponent(node.dataset.properties));
      addPropertiesAndValues(schoolProperties, countedProperties);
      schoolProperties.name = (node.textContent || el.innerText).trim();
      schoolProperties.href = node.getAttribute('href');
      geoSchool = {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': JSON.parse(node.dataset.latlng)
        },
        'properties': schoolProperties
      };
      data.features.push(geoSchool);
    });
    var niceProperties = fixProperties(countedProperties);
    u.extend(geoProperties, niceProperties);
  }

  function setupFilters() {

    var filterContainer = document.getElementById('filter-wrap');
    html = '';
    for (var filter in filters) {
      var osm_key = filters[filter][0],
          kod_key = filters[filter][1];
      html += '<div class="input-group filter">';
      html +=   '<label>' + filter + '</label>';
      html +=   '<select class="filter-filter source-osm" data-key="' + osm_key + '">';
      html +=     '<option value="" selected="selected"> - filter - </option>';
      u.each(geoProperties[osm_key], function addFilterValue(value) {
        html += '<option value="' + value[0] + '">' + value[0] + '</option>';
      });
      html +=   '</select>';
      html +=   '<select class="filter-filter source-kod hidden" data-key="' + kod_key + '">';
      html +=     '<option value="" selected="selected"> - filter - </option>';
      u.each(geoProperties[kod_key], function addFilterValue(value) {
        html += '<option value="' + value[0] + '">' + value[0] + '</option>';
      });
      html +=   '</select>';
      html += '</div>'
    }
    filterContainer.innerHTML = html;

    var filterEls = document.querySelectorAll('.filter-filter');
    u.eachNode(filterEls, function attachFilterHandler(filterEl) {
      u.on(filterEl, 'change', function changeFilter() {
        if (this.value !== '') {
          activeFilters[this.dataset.key] = this.value;
        } else if (this.dataset.key in activeFilters) {
          delete activeFilters[this.dataset.key];
        }
        refreshFilters();
      });
    });

    var sourceSelectors = document.querySelectorAll('[name="source-select"]');
    u.eachNode(sourceSelectors, function attachSourceHandlers(sourceSelector) {
      u.on(sourceSelector, 'change', function changeSource() {
        var source = sourceSelector.id;
        u.eachNode(filterEls, function showHideFilter(filterEl) {
          if (u.hasClass(filterEl, source)) {
            u.removeClass(filterEl, 'hidden');
          } else {
            u.addClass(filterEl, 'hidden');
            if (filterEl.value !== '') {
              filterEl.value = '';
              delete activeFilters[filterEl.dataset.key];
              refreshFilters();
            }
          }
        });
      });
    });
  }

  function refreshFilters() {
    u.each(data.features, function filterFeature(feature) {
      var showing = true;
      for (filter in activeFilters) {
        if (filter in feature.properties) {
          if (feature.properties[filter] !== activeFilters[filter]) {
            showing = false;
          }
        } else {
          showing = false;
        }
      }
      if (showing) {
        feature.properties.pin.addTo(map);
      } else {
        map.removeLayer(feature.properties.pin);
      }
    });
  }

  function schoolPopupContent(school) {
    var href = school.properties.href || "",
        name = school.properties.name;

    var edType = school.properties['osm:education:type'],
    opType = school.properties['osm:operator:type'],
    students = parseInt(school.properties['osm:education:students_male'] || 0) +
               parseInt(school.properties['osm:education:students_female'] || 0),
    teachers = parseInt(school.properties['osm:education:teachers'] || 0);

    var popupContent = '<h3><a href="' + href + '">' + name + '</a></h3>';

    if (edType || opType) {
      popupContent += '<p>';
      popupContent += edType || '';
      popupContent += (edType && opType) ? ' / ' : '';
      popupContent += opType || '';
      popupContent += '</p>';
    }

    if (students || teachers) {
      popupContent += '<p>';
      popupContent += students ? students + ' students' : '';
      popupContent += (students && teachers) ? ', ' : '';
      popupContent += teachers ? teachers + ' teacher' + (teachers > 1 ? 's' : '') : '';
      popupContent += '</p>';
    }
    return popupContent;
  }

  function pinAllSchools(map) {
    function pinPopup(school, marker) {
      var content = schoolPopupContent(school);
      marker.bindPopup(content);
      marker.setIcon(L.icon(iconDefaults));
      school.properties.pin = marker;
    }
    L.geoJson(data, {onEachFeature: pinPopup}).addTo(map);
  }

  function pinSchool(map) {
    var location = school.geometry.coordinates[0].reverse();
    map.setView([location[0] + 0.0003, location[1]], 18);
    var content = schoolPopupContent(school)
    var marker = L.marker(location).setIcon(L.icon(iconDefaults)).addTo(map);
    marker.bindPopup(content).openPopup();
  }

  // exports
  window.geoData = data,
  window.geoProperties = geoProperties;

})();
