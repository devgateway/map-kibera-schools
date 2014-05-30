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
        'Type of School': {
          type: 'select',
          keys: ['osm:operator:type', 'kenyaopendata:Sponsor of School'],
        },
        'Education Level': {
          type: 'select',
          keys: ['osm:education:type', 'kenyaopendata:Level of Education'],
        },
        'Male Students': {
          type: 'range',
          keys: ['osm:education:students_male', 'kenyaopendata:Total Boys'],
        },
        'Female Students': {
          type: 'range',
          keys: ['osm:education:students_female', 'kenyaopendata:Total Girls'],
        },
        'Teachers': {
          type: 'range',
          keys: ['osm:education:teachers', 'kenyaopendata:Total Teaching staff']
        }
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
      // get the filter type
      var filterType;
      for (filter in filters) {
        u.each(filters[filter].keys, function checkIfKeyFound(key) {
          if (key === propKey) {
            filterType = filters[filter].type;
          };
        })
      }
      if (filterType === 'select') {
        properties[propKey] = propKeyArray.sort(function sortProps(a, b) {
          return b[1] - a[1];  // sort by count desc
        });
      } else {
        properties[propKey] = propKeyArray.sort(function sortProps(a, b) {
          return a[0] - b[0];  // sort by val asc
        });
      }
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
      var osm_key = filters[filter].keys[0],
          kod_key = filters[filter].keys[1];
      html += '<div class="input-group filter">';
      html +=   '<label>' + filter + '</label>';

      if (filters[filter].type === 'select') {

        html +=   '<select class="filter-filter filter-select source-osm" data-key="' + osm_key + '">';
        html +=     '<option value="" selected="selected"> - filter - </option>';
        u.each(geoProperties[osm_key], function addFilterValue(value) {
          html += '<option value="' + value[0] + '">' + value[0] + '</option>';
        });
        html +=   '</select>';
        html +=   '<select class="filter-filter filter-select source-kod hidden" data-key="' + kod_key + '">';
        html +=     '<option value="" selected="selected"> - filter - </option>';
        u.each(geoProperties[kod_key], function addFilterValue(value) {
          html += '<option value="' + value[0] + '">' + value[0] + '</option>';
        });
        html +=   '</select>';

      } else if (filters[filter].type === 'range') {

        html += '<select class="filter-filter filter-range filter-range-min source-osm" data-range="min" data-key="' + osm_key + '">';
        html +=   '<option value="" selected="selected">min</option>';
        u.each(geoProperties[osm_key], function addSortFilterValue(value) {
          html += '<option value="' + value[0] + '">' + value[0] + '</option>';
        });
        html += '</select>';
        html += '<select class="filter-filter filter-range filter-range-max source-osm" data-range="max" data-key="' + osm_key + '">';
        html +=   '<option value="" selected="selected">max</option>';
        u.each(geoProperties[osm_key], function addSortFilterValue(value) {
          html += '<option value="' + value[0] + '">' + value[0] + '</option>';
        });
        html += '</select>';
        html += '<select class="filter-filter filter-range filter-range-min source-kod hidden" data-range="min" data-key="' + kod_key + '">';
        html +=   '<option value="" selected="selected">min</option>';
        u.each(geoProperties[kod_key], function addSortFilterValue(value) {
          html += '<option value="' + value[0] + '">' + value[0] + '</option>';
        });
        html += '</select>';
        html += '<select class="filter-filter filter-range filter-range-max source-kod hidden" data-range="max" data-key="' + kod_key + '">';
        html +=   '<option value="" selected="selected">max</option>';
        u.each(geoProperties[kod_key], function addSortFilterValue(value) {
          html += '<option value="' + value[0] + '">' + value[0] + '</option>';
        });
        html += '</select>';

      }

      html += '</div>'
    }
    filterContainer.innerHTML = html;


    var selectFilterEls = document.querySelectorAll('.filter-select');
    u.eachNode(selectFilterEls, function attachFilterHandler(filterEl) {
      u.on(filterEl, 'change', function changeFilter() {
        if (this.value !== '') {
          activeFilters[this.dataset.key] = ['select', this.value];
        } else if (this.dataset.key in activeFilters) {
          delete activeFilters[this.dataset.key];
        }
        refreshFilters();
      });
    });

    var rangeFilterEls = document.querySelectorAll('.filter-range');
    u.eachNode(rangeFilterEls, function attachFilterHandler(filterEl) {
      u.on(filterEl, 'change', function changeFilter() {
        if (this.value !== '') {
          if (! (this.dataset.key in activeFilters)) {
            activeFilters[this.dataset.key] = ['range', {}]
          }
          activeFilters[this.dataset.key][1][this.dataset.range] = parseInt(this.value);
        } else if (this.dataset.key in activeFilters &&
                   this.dataset.range in activeFilters[this.dataset.key][1]) {
          delete activeFilters[this.dataset.key][1][this.dataset.range];
        }
        console.log(activeFilters);
        refreshFilters();
      });
    });

    var allFilterEls = document.querySelectorAll('.filter-filter');
    var sourceSelectors = document.querySelectorAll('[name="source-select"]');
    u.eachNode(sourceSelectors, function attachSourceHandlers(sourceSelector) {
      u.on(sourceSelector, 'change', function changeSource() {
        var source = sourceSelector.id;
        u.eachNode(allFilterEls, function showHideFilter(filterEl) {
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
          if (activeFilters[filter][0] === 'select') {
            if (feature.properties[filter] !== activeFilters[filter][1]) {
              showing = false;
            }
          } else if (activeFilters[filter][0] === 'range') {
            if ('min' in activeFilters[filter][1]) {
              if (parseInt(feature.properties[filter]) < activeFilters[filter][1].min) {
                showing = false;
              }
            }
            if ('max' in activeFilters[filter][1]) {
              if (parseInt(feature.properties[filter]) > activeFilters[filter][1].max) {
                showing = false;
              }
            }
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
