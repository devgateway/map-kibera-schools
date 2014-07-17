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
    this.model.trigger('selectme', this.model);
  }

});


app.filterWidgets.Select = Backbone.View.extend({

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
    this.rendered = false;
    // this.optionViews = {};  // {cid: el}
    this.model.options.each(this.addOption);
    this.listenTo(this.model, 'change:value', this.setSelect);
    this.listenTo(this.model.options, 'add', this.addOption);
    this.listenTo(this.model.options, 'sort', this.reorderOptions);
  },

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    this.$('.map-control-dropdown').html(this.dropDownTemplate());
    if (! this.rendered) {
      this.reorderOptions();
      this.rendered = true;
    }
    return this;
  },

  addOption: function(option) {
    // var view = new app.filterWidgets.OptionView({ model: option });
    // this.optionViews[option.cid] = view;
    this.reorderOptions();
  },

  reorderOptions: function() {
    if (! this.rendered) {
      return;
    }
    this.$('.map-control-dropdown > ul').html(this.model.options.map(function(option) {
      return (new app.filterWidgets.OptionView({ model: option })).render().el;
    }, this));
  },

  setSelect: function(model, newValue) {
    this.$('> .activate').text(newValue || 'unknown');
  },

  selectUIActivate: function(e) {
    e.preventDefault();
    this.$el.toggleClass('active');
  },

  selectUIKeyNav: function(e) {
    console.log('selectUIKeyNav');
  }

});
