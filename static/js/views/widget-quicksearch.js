app.filterWidgets.SearchListingView = app.filterWidgets.OptionView.extend({
  template: _.template('<a href="#">' +
                       '  <%= name %>' +
                       '</a>')
});


app.filterWidgets.QuickSearch = app.filterWidgets.Select.extend({

  dropDownTemplate: _.template('<input type="text" name="quicksearch" ' +
                               '       placeholder="Quick Search" />' +
                               '<ul></ul>'),

  events: _.extend(app.filterWidgets.Select.prototype.events, {
    'keyup input': 'changeInput',
    'change input': 'changeInput'
  }),

  initialize: function() {
    this.rendered = false;
    this.listenTo(this.model.schools, 'add', this.reorderOptions);
    this.listenTo(this.model, 'change:value', this.setUIValue);
    this.listenTo(this.model, 'change:expanded', this.expandOptions);
    this.listenTo(this.model, 'change:expanded', this.focusOnExpand);
    this.listenTo(this.model, 'filtersupdated', this.reorderOptions);
  },

  reorderOptions: _.debounce(function() {
    if (! this.rendered) {
      return;
    }
    this.$('.map-control-dropdown > ul').html(
      _(this.model.schools.notExcluded()).sortBy(function(school) {
        return -school.get('_filterScore');
      }).map(function(school) {
        return (new app.filterWidgets.SearchListingView({ model: school })).render().el;
      }, this)
    );
  }, app.config.throttle),

  changeInput: function(e) {
    this.model.set('rawValue', e.target.value);
  },

  focusOnExpand: function(e) {
    this.$('input').focus();
  },

  setUIValue: function(myModel, newValue) {
    this.$('>a').text(newValue || this.model.get('name'));
  }

});
