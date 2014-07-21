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
    'change input': 'changeInput',
    'click input': 'noop'
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
    var notExcludedSchools = this.model.schools.notExcluded(),
        optionViews;
    if (notExcludedSchools.length > 0) {
      optionViews = _(notExcludedSchools).sortBy(function(school) {
        return -school.get('_filterScore');
      }).map(function(school) {
        return (new app.filterWidgets.SearchListingView({ model: school })).render().el;
      }, this);
    } else {
      optionViews = '<li><a href="#">No schools matched the filter criteria</a></li>';
    }
    this.$('.map-control-dropdown > ul').html(optionViews);
  }, app.config.throttle),

  clearFilter: function() {
    app.filterWidgets.Select.prototype.clearFilter.apply(this, arguments);
    this.$('input').val('');
    if (this.model.get('expanded')) {
      this.$('input').focus();
    }
  },

  moveCursor: function(changeIndex) {
    // todo -- factor out common code with superclass
    var notExcludedSchools = this.model.schools.notExcluded();
    var oldCursored = notExcludedSchools.find(function(option) {
      return option.get('cursored');
    });
    if (! oldCursored) {
      oldCursored = notExcludedSchools[0];
    }
    var oldIndex = notExcludedSchools.indexOf(oldCursored);

    var naiiveNextIndex = oldIndex + changeIndex;
    var lastIndex = notExcludedSchools.length - 1;
    var nextIndex = Math.max(0, Math.min(lastIndex, naiiveNextIndex));

    var nextCursored = notExcludedSchools[nextIndex];

    nextCursored.trigger('cursorme', nextCursored);
  },

  changeInput: function(e) {
    this.model.set('rawValue', e.target.value);
  },

  focusOnExpand: function(e) {
    this.$('input').focus();
  },

  setUIValue: function(myModel, newValue) {
    this.$el[newValue ? 'addClass' : 'removeClass']('filtering');
    this.$('>.activate').text(newValue || this.model.get('name'));
  },

  noop: function(e) {
    e.stopPropagation();
  }

});
