// order the filters: cheapest -> most expensive
//  1. OSM/KOD toggle
//  2. select filters
//  3. fuzzy search


var filterMatchCollection = Backbone.Collection.extend({
  // model is the type we are filtering on
});


var filterEntry = Backbone.Model.extend({
  value: 'primary',  // auto-gen when loading from data
  things: []  // schools
});


var reverseMatch = Backbone.Model.extend({
  entries: ['primary']
});


var filters = Backbone.Collection.extend({
  comparator: 'cost'  // so we can run the cheap filters first
});
