


app.models.Filter = Backbone.Model.extend({
  // has a ref to the FilterMatchCollection
  //  -> creates an array of things to exclude
  //  -> matchCollection.remove that array
  defaults: {
    value: undefined,
  },

  setMatchables: function(matchCollection) {
    this.matchCollection = matchCollection;
  },

  clear: function() {
    this.set('value', undefined);
  }
});


// var Filters = Backbone.Collection.extend({

//   comparator: 'workToCompute',  // so we can run the cheap filters first

//   setMatchables: function(matchCollection) {
//     this.each(function(filter) { filter.setMatchables(matchCollection); });
//   }

// });
