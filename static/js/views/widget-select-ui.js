app.filterWidgets.OptionView = Backbone.View.extend({

  tagName: 'li',

  template: _.template('<a href="#">' +
                       '  <%= optionValue || "unknown" %> (<%= count %>)' +
                       '</a>'),

  events: {
    'click': 'select'
  },

  render: function() {
    var context = _.extend({count: this.model.countNotExcluded()}, this.model.attributes);
    this.$el.html(this.template(context));
    return this;
  },

  select: function() {
    console.log('selecting', this.model.get('optionValue'));
    this.model.trigger('selectme', this.model);
  }

});


app.filterWidgets.SelectUI = Backbone.View.extend({

  tagName: 'li',

  template: _.template('<a class="activate" href="#"><%= name %></a>' +
                       '<div class="map-control-dropdown">' +
                       '</div>'),

  dropDownTemplate: _.template('<ul></ul>'),  // broken out to easily override

  events: {
    'click >.activate': 'selectUIActivate',
    'keyup': 'selectUIKeyNav'
  },

  initialize: function() {
    this.optionViews = {};  // {cid: el}
    this.model.options.each(this.addOption);
    this.listenTo(this.model.options, 'add', this.addOption);
    this.listenTo(this.model.options, 'sort', this.reorderOptions);
    this.rendered = false;
  },

  render: function() {
    this.rendered = true;
    this.$el.html(this.template(this.model.attributes));
    this.$('.map-control-dropdown').html(this.dropDownTemplate());
    return this;
  },

  addOption: function(option) {
    var view = new app.filterWidgets.OptionView({ model: option });
    this.optionViews[option.cid] = view;
  },

  reorderOptions: _.debounce(function() {
    // WTF: this does not work at all without the debounce.
    var sortedEls = this.model.options.map(function(option) {
      return this.optionViews[option.cid].render().el;
    }, this);
    this.$('.map-control-dropdown > ul').html(sortedEls);
  }, app.config.throttle),

  selectUIActivate: function() {
    this.$el.toggleClass('active');
  },

  selectUIKeyNav: function(e) {
    console.log('selectUIKeyNav');
  }

});
