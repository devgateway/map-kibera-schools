app.models.SelectFilterOption = Backbone.Model.extend({
  defaults: {
    cursored: false,
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
  cursoredOption: undefined,
  selectedOption: undefined,

  comparator: function(a, b) {
    var countA = a.countNotExcluded(),
        countB = b.countNotExcluded();
    return countA === countB ? 0 : (countA < countB ? 1 : -1);
  },

  initialize: function() {
    this.listenTo(this, 'cursorme', this.updateCursored);
    this.listenTo(this, 'selectme', this.updateSelected);
  },

  updateSelected: function(newOption) {
    this.selectedOption && this.selectedOption.set('selected', false);
    this.selectedOption = newOption;
    newOption.set('selected', true);
  },

  updateCursored: function(newOption) {
    this.cursoredOption && this.cursoredOption.set('cursored', false);
    this.cursoredOption = newOption;
    newOption.set('cursored', true);
  }

});


app.models.SelectFilter = Backbone.Model.extend({
  workToCompute: 1,

  defaults: {
    expanded: false,
    value: undefined
  },

  initialize: function(options) {
    this.key = options.key;
    var schools = options.schools;

    this.options = new app.models.SelectFilterOptions();
    this.listenTo(this.options, 'change:selected', this.changeSelect);

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

  changeSelect: function(option, selected) {
    if (selected === false) {  // we just care about the new value
      return;
    }
    this.set('value', option.get('optionValue'));
    this.trigger('filterchange');
  },

  scoreSchool: function(school) {
    if (this.options.selectedOption) {
      if (this.options.selectedOption.schools.contains(school)) {
        return 0;
      } else {
        return 1;
      }
    } else {
      return 0;
    }
  }

});
