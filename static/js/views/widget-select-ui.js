app.mixins.SelectUI = {

  events: {
    'click >a': 'selectUIActivate',
    'keyup input': 'selectUIKeyboard',
    'change input': 'selectUINewInput',
    'keyup .school-list': 'selectUIKeyNav'
  },

  selectUIActivate: function() {
    console.log('selectUIActivate');
  },

  selectUIKeyboard: function(e) {
    console.log('selectUIKeyboard');
  },

  selectUINewInput: function(e) {
    console.log('selectUINewInput');
  },

  selectUIKeyNav: function(e) {
    console.log('selectUIKeyNav');
  },


  selectOption = Backbone.View.extend({

    tagName: 'li',

    events: {
      'mouseover >a': 'optionHover',
      'mouseout >a': 'optionUnHover'
    },

    optionHover: function() {
      console.log('option over');
    },

    optionUnHover: function() {
      console.log('and option out');
    }

  });

};
