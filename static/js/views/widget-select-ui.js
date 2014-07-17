app.filterWidgets.SelectUI = Backbone.View.extend({

  template: _.template('<a class="activate" href="#schools"><%= name %></a>' +
                       '<div class="map-control-dropdown">' +
                       '</div>'),

  dropDownTemplate: _.template('<ul></ul>'),

  events: {
    'click .activate': 'selectUIActivate',
    'keyup input': 'selectUIKeyboard',
    'change input': 'selectUINewInput',
    'keyup .school-list': 'selectUIKeyNav'
  },

  initialize: function(opts) {
    this.name = opts.name;
    this.things = opts.things;
    this.filterOptions = [];

    this.things.each(this.updateOptions);
    this.listenTo(this.things, 'add', this.updateOptions);
  },

  render: function() {
    this.$el.html(this.template(this));
    this.$('.map-control-dropdown').html(this.dropDownTemplate());
    // _.each(this.filterOptions.osm, function(option) {
    //   var optionView = new SelectOptionView({model: option});
    //   optionSelect.append(optionView.render().el);
    // });
    return this;
  },

  renderOptions: function() {
    this.$('.map-control-dropdown > ul').append('<li>hello</li>');
  },

  updateOptions: function() {
    // console.log('updating options...');
  },

  selectUIActivate: function() {
    this.$el.toggleClass('active');
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


  selectOptionView: Backbone.View.extend({

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

  })

});
