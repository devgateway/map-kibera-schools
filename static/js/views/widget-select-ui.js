app.filterWidgets.SelectUI = Backbone.View.extend({

  tagName: 'li',

  template: _.template('<a class="activate" href="#"><%= name %></a>' +
                       '<div class="map-control-dropdown">' +
                       '</div>'),

  dropDownTemplate: _.template('<ul></ul>'),

  optionTemplate: _.template('<li><a href="#">' +
                             '  <%= optionValue || "unknown" %> (<%= count %>)' +
                             '</a></li>'),

  events: {
    'click .activate': 'selectUIActivate',
    'keyup input': 'selectUIKeyboard',
    'change input': 'selectUINewInput',
    'keyup .school-list': 'selectUIKeyNav'
  },

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    this.$('.map-control-dropdown').html(this.dropDownTemplate());
    this.renderOptions();
    this.listenTo(this.model.options, 'add remove reset', this.renderOptions);
    return this;
  },

  renderOptions: _.debounce(function() {
    this.model.options.each(function(option) {
      var context = _.extend({count: option.countNotExcluded()}, option.attributes);
      this.$('.map-control-dropdown > ul').append(this.optionTemplate(context));
    }, this);
  }, app.config.throttle),

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
