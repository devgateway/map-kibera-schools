app.models.SelectFilterOption = Backbone.Model.extend({
  defaults: {
    selected: false
  },

  initialize: function() {
    this.schools = new Backbone.Collection();
  },

  countNotExcluded: function() {
    return app.models.Schools.prototype.notExcluded.call(this.schools).length;
  }

});


app.models.SelectFilterOptions = Backbone.Collection.extend({

  model: app.models.SelectFilterOption,

  comparator: function(a, b) {
    return app.models.Schools.prototype.comparator.call(this, a, b);
  },

  initialize: function() {
    this.listenTo(this, 'selectme', this.updateSelected);
  },

  updateSelected: function(newOption) {
    var oldOption = this.find(function(o) { return o.get('selected'); });
    oldOption && oldOption.set('selected', false);
    newOption.set('selected', true);
  }

});


app.models.SelectFilter = app.models.Filter.extend({
  workToCompute: 1,

  initialize: function(options) {
    this.key = options.key;
    var schools = options.schools;

    this.options = new app.models.SelectFilterOptions();
    this.listenTo(this.options, 'change:selected', this.refilter);

    schools.each(this.addSchool);
    this.listenTo(schools, 'add', this.addSchool);
  },

  addSchool: function(school) {
    var rawValue = school.get(this.key);

    // TODO: accept actual JSON instead of ad-hoc splitting here
    var optionValues = (rawValue && rawValue.split(',') || [undefined]);

    _.each(optionValues, function(optionValue) {
      var selectOption = this.options.find(function(opt) {
        return opt.get('optionValue') === optionValue;
      });
      if (! selectOption) {
        selectOption = new app.models.SelectFilterOption({
          optionValue: optionValue
        });
        this.options.add(selectOption);
      }
      selectOption.schools.add(school);
    }, this);

  },

  refilter: function(option, selected) {
    if (selected === false) {
      // we just care about the new value
      return;
    }
    this.set('value', option.optionValue);
    // console.log('set filter value to ', option.get('optionValue'));
  }

});
