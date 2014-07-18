app.models.QuickSearchFilter = Backbone.Model.extend({
  initialize: function(options) {
    this.key = options.key;
    var schools = options.schools;

    // this.options = new app.models.SelectFilterOptions();
    // this.listenTo(this.options, 'change:selected', this.changeSelect);

    schools.each(this.addSchool);
    this.listenTo(schools, 'add', this.addSchool);
  },

  addSchool: function() {

  },

  scoreSchool: function() {
    return 0;
  }
});
