;(function(context) {
  var target = {
    global: function() {
      this.validate = {};
      this.results = {};
      this.groups = {};
    },

    validate_none: function(key, value, options) {
      return true;
    },
    validate_present: function(key, value, options) {
      return (typeof value !== "undefined");
    },
    validate_check: function(key, value, options) {
      return $.inArray(value, ["yes","no",undefined]) != -1;
    },
    validate_capitalization: function(key, value, options) {
      var test = true;
      if (value.indexOf("_") != -1) {
        test = false;
      }
      var words = value.split(" ");
      var lowers = ["and","of"];
      $.each( words , function( index, word ) {
        if (lowers.indexOf(word) == -1 && word.charAt(0) != word.charAt(0).toUpperCase()) {
          test = false;
        }
        if (word.indexOf(".") != -1 && word.indexOf(".") != (word.length - 1)) {
          test = false;
        }
      });

      return test;
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
    validate_multi_allowed_list: function(key, value, options) {
      var test = true;
      if (typeof value == "undefined") {
        return false;
      }
      var values = value.split(',');
      $.each( values, function( index, v) {
        if ($.inArray(value,options["allowed_list"]) == -1) {
          test = false;
        }
      });
      return true;
    },
    validate_date_after: function(key, value, options) {
      return value > options['date_after'];
    },
    validate_address: function(key, value, options) {
      return false;
    },
    validate_marker_color: function(key, value, options) {
      return value == "#fff";
    },
  
    filter_date_year: function(key, value) {
      return value.substr(0,10);
    },
    filter_id: function(key, value) {
      return "<a href='http://www.openstreetmap.org/" + value + "'>" + value + "</a>";
    },
    filter_marker_color: function(key, value) {
      if (value == "#f00") {
        return "unmatched";
      } else if (value == "#fc0") {
        return "issue";
      } else {
        return "ok";
      }
    },

    toggle_group: function(e) {
      var group = e.target.innerHTML;
      $(e.target).toggleClass('pure-button-active');
      $.each( $($('#target-head').children()[0]).children() , function(index, th) {
        var tag = $(th).children()[0].innerHTML;
        if ($.inArray(tag, target.groups[ group ]) != -1) {
          if ($('td:nth-child(' + (index+1) + ')')[0].style.display == "none") {
            $('td:nth-child(' + (index+1) + '),th:nth-child(' + (index+1) + ')').show();
          } else {
            $('td:nth-child(' + (index+1) + '),th:nth-child(' + (index+1) + ')').hide();
          }        
        }
      });    
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

      var group_control = "<div>Filters: ";
      $.each( target.validate, function (key, params) {
        if (params['group'] !== undefined) {
          if (target.groups[ params['group']] === undefined) {
            target.groups[ params['group'] ] = [];
            group_control += "<span class='groupBtn pure-button pure-button-active'>" + params['group'] + "</span> "; 
          }
          target.groups[ params['group'] ].push( key );
        }
      });
      group_control += "</div>";
      $( group_control ).appendTo('#controls');
      $(".groupBtn").click(target.toggle_group);
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
            //Validations
            var result = true;
            $.each( params['validation'], function(j, validation_callback) {
              result = result && (target[ validation_callback ])( key, feature['properties'][key], params['options'] );
            });
            var result_class = (result ? "valid" : "invalid");

            //Filters
            var filtered_item = (feature['properties'][key] !== undefined ? feature['properties'][key] : "");
            if (params['filter'] !== undefined) {
              filtered_item = target[ params['filter'][0] ]( key, feature['properties'][key] );
            }

            item += "<td class='" + result_class + "'>" + filtered_item + "</td>";
            target.results[ key ][result_class]++;
          });
          item += "</tr>";
          items.push(item);
        });
        $( items.join( "" ) ).appendTo( "#table-listing" );
        target.add_results();
        $('#target').tablesorter( { debug: true } );
        $(".groupBtn").trigger('click');   
      });
    }
  };
  window.target = target;

})(window);

$( function() {
  target.global();
  target.set_validation(
    {
      "official_name" : { 
        "validation" : ["validate_none"]
      },
      "marker-color" : {
        "validation" : ["validate_marker_color"],
        "filter" : ["filter_marker_color"]
      },
      "notes" : {
        "validation" : ["validate_present"]
      },

      "Constituency" : {
        "validation" : ["validate_none"]
      },
      "District" : {
        "validation" : ["validate_none"]
      },
      "Division" : {
        "validation" : ["validate_none"]
      },
      "Location" : {
        "validation" : ["validate_none"]
      }

    }
  );
  target.load_geojson("../matches.geojson");
});
