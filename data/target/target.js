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
  
    filter_date_year: function(key, value) {
      return value.substr(0,10);
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
      "osm:name" : { 
        "validation" : ["validate_present", "validate_capitalization"]
      },
      "osm:_timestamp" : {
        "validation" : ["validate_date_after"],
        "options" : {"date_after" : "2014-06-05T00:00:00Z"},
        "filter" : ["filter_date_year"]
      },

      "osm:official_name" : {
        "validation" : ["validate_present"],
        "group" : "basic"
      },
      "osm:education:type" : {
        "validation" : ["validate_allowed_list"],
        "options" : {"allowed_list" : ["pre_primary","primary","secondary","vocational"]},
        "group" : "basic"
      },
      "osm:_user": {
        "validation" : ["validate_present"],
        "group" : "basic"
      },
      "osm:operator:name": {
        "validation" : ["validate_present", "validate_capitalization"],
        "group" : "basic"
      },
      "osm:operator:description" : {
        "validation" : ["validate_present"],
        "group" : "basic"
      },
      "osm:education:boarding" : {
        "validation" : ["validate_check"],
        "group" : "basic"
      },
      "osm:place:village": {
        "validation" : ["validate_allowed_list"],
        "options" : {"allowed_list" : ["Lindi","Makina","Silanga","Karanja","Kisumu Ndogo","Kianda","Soweto West","Soweto East","Raila","Kambi Muru", "Gatwekera", "Olympic", "Mashimoni", "Ayany"]},
        "group" : "basic"
      },
      "osm:_user": {
        "validation" : ["validate_present"],
        "group" : "basic"
      },

      "osm:accessibility" : {
        "validation" : ["validate_allowed_list"],
        "options" : {"allowed_list": ["foot","small_cars","big_vehicles"]},
        "group" : "infrastructure"
      },
      "osm:building:material" : {
        "validation" : ["validate_multi_allowed_list"],
        "options" : {"allowed_list": ["mud","ironsheets","cement_block","wood", "concrete"]},
        "group" : "infrastructure"
      },
      "osm:building:roof" : {
        "validation" : ["validate_allowed_list"],
        "options" : {"allowed_list": ["ironsheets", "asbestos", "wood", "concrete"]},
        "group" : "infrastructure"
      },
      "osm:toilet:present": {
        "validation" : ["validate_allowed_list"],
        "options" : {"allowed_list": ["yes","no","outside_public","arranged"]},
        "group" : "infrastructure"
      },
      "osm:toilet:arranged_name": {
        "validation" : ["validate_none"],
        "group" : "infrastructure"
      },
      "osm:electricity:operational_status": {
        "validation" : ["validate_allowed_list"],
        "options" : {"allowed_list": ["often","always","sometimes","never"]},
        "group" : "infrastructure"
      },

      "osm:contact:address" : {
        "validation" : ["validate_address"],
        "group" : "infrastructure"
      },
      "osm:contact:email" : {
        "validation" : ["validate_present"],
        "group" : "infrastructure"
      },
      "osm:contact:phone" : {
        "validation" : ["validate_present"],
        "group" : "infrastructure"
      },

      "osm:education:students" : {
        "validation" : ["validate_numeric"],
        "group" : "population"
      },
      "osm:education:student_male" : {
        "validation" : ["validate_numeric"],
        "group" : "population"
      },
      "osm:education:student_female" : {
        "validation" : ["validate_numeric"],
        "group" : "population"
      },
      "osm:education:school_head" : {
        "validation" : ["validate_present"],
        "group" : "population"
      },
      "osm:education:teachers" : {
        "validation" : ["validate_numeric"],
        "group" : "population"
      },
      "osm:education:teachers_male" : {
        "validation" : ["validate_numeric"],
        "group" : "population"
      },
      "osm:education:teachers_female" : {
        "validation" : ["validate_numeric"],
        "group" : "population"
      },
      "osm:education:teachers_trained" : {
        "validation" : ["validate_numeric"],
        "group" : "population"
      },
      "osm:education:tsc_employed" : {
        "validation" : ["validate_numeric"],
        "group" : "population"
      },
      "osm:operator:type" : {
        "validation" : ["validate_allowed_list"],
        "options" : {"allowed_list" : ["ngo","cbo","private","religious","government"]},
        "group" : "operations"
      },
      "osm:education:exam_center" : {
        "validation" : ["validate_check"],
        "group" : "operations"
      },
      "osm:education:exam_affiliate" : {
        "validation" : ["validate_none"],
        "group" : "operations"
      },
      "osm:education:fees" : {
        "validation" : ["validate_numeric"],
        "group" : "fees"
      },
      "osm:education:fees_sponsored" : {
        "validation" : ["validate_check"],
        "group" : "fees"
      },
      "osm:education:fees_level1" : {
        "validation" : ["validate_numeric"],
        "group" : "fees"
      },
      "osm:education:fees_level2" : {
        "validation" : ["validate_numeric"],
        "group" : "fees"
      },
      "osm:education:fees_level3" : {
        "validation" : ["validate_numeric"],
        "group" : "fees"
      },
      "osm:education:fees_level4" : {
        "validation" : ["validate_numeric"],
        "group" : "fees"
      },
      "osm:education:fees_level5" : {
        "validation" : ["validate_numeric"],
        "group" : "fees"
      },
      "osm:education:fees_level6" : {
        "validation" : ["validate_numeric"],
        "group" : "fees"
      },
      "osm:education:fees_optional" : {
        "validation" : ["validate_none"],
        "group" : "fees"
      },
      "osm:education:gender_type" : {
        "validation" : ["validate_allowed_list"],
        "options" : {"allowed_list" : ["mixed","boys_only","girls_only"]},
        "group" : "operations"
      },
      "osm:education:government_registered" : {
        "validation" : ["validate_allowed_list"],
        "options" : {"allowed_list" : ["moe","mgcsd",""]},
        "group" : "operations"
      },
      "osm:education:management_committee" : {
        "validation" : ["validate_check"],
        "group" : "operations"
      },
      "osm:education:program_counselling" : {
        "validation" : ["validate_check"],
        "group" : "operations"
      },
      "osm:education:program_feeding" : {
        "validation" : ["validate_check"],
        "group" : "operations"
      },  
      "osm:education:program_sanitary_towel" : {
        "validation" : ["validate_check"],
        "group" : "operations"
      }

    }
  );
  target.load_geojson("../kibera-combined-schools.geojson");
});
