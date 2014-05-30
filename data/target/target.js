;(function(context) {
  var target = {
    global: function() {
      this.validate = {};
      this.results = {};
    },

    validate_present: function(key, value, options) {
      return (typeof value !== "undefined");
    },
    validate_numeric: function(key, value, options) {
      if (typeof value !== "undefined") {
        return $.isNumeric(value);
      }
      return false;
    },
    validate_allowed_list: function(key, value, options) {
      return $.inArray(value,options["allowed_list"]) != -1;
    },
    validate_date_after: function(key, value, options) {
      return value > options['date_after'];
    },

    set_validation: function(setting) {
      this.validate = setting;
      var header = "<tr>";
      $.each( target.validate , function (key, params) {
        header += "<th><span>" + key + "</span></th>";
        target.results[ key ] = { "valid" : 0, "invalid" : 0 };
      });
      header += "</tr>";
      $( header ).appendTo("#target-head");   
    },

    add_results: function() {
      var result_row = "<tr>";
      $.each( target.validate, function (key, params) {
        var total = target.results[ key ][ 'valid' ] + target.results[ key ][ 'invalid' ];
        result_row += "<th>" + (100 * target.results[ key ][ 'valid' ] / total).toPrecision(4) + "%</th>";
      });
      result_row += "</tr>";
     $( result_row ).appendTo("#target-head");
    },

    load_geojson: function(url) {
      $.getJSON( url, function( data ) {
        var items = [];
        $.each( data['features'], function( i, feature ) {
          var item = "<tr>";  
          $.each( target.validate , function (key, params) {
            var result_class = (target[ params['validation'][0] ]( key, feature['properties'][key], params['options'] ) ? "valid" : "invalid");
            item += "<td class='" + result_class + "'>" + feature['properties'][key] + "</td>";
            target.results[ key ][result_class]++;

          //items.push( "<tr><td>" + feature['properties']['osm:name'] + "</td><td>" + Object.keys(feature.properties).length + "</td></tr>" );
          });
          item += "</tr>";
          items.push(item);
        });
        $( items.join( "" ) ).appendTo( "#table-listing" );
        target.add_results();
        $('#target').tablesorter();   
      });
    }
  };
  window.target = target;

})(window);

$( function() {
  target.global();
  target.set_validation(
    {
      "osm:name" : { 
        "validation" : ["validate_present"]
      },
      "osm:official_name" : {
        "validation" : ["validate_present"]
      },
      "osm:education:students" : {
        "validation" : ["validate_numeric"]
      },
      "osm:operator:type" : {
        "validation" : ["validate_allowed_list"],
        "options" : {"allowed_list" : ["ngo_cbo","private"]}
      },
      "osm:_timestamp" : {
        "validation" : ["validate_date_after"],
        "options" : {"date_after" : "2014-01-01T00:00:00Z"}
      }
    }
  );
  target.load_geojson("../kibera-combined-schools.geojson");
});
