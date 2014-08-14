app.views.SchoolsStats = Backbone.View.extend({

  template: _.template('<h3>Schools: <%= schools %></h3>' +
                       '<h3>Teachers: <%= teachers %></h3>' +
                       '<h3>Students: <%= students %></h3>'),

  initialize: function() {
    this.listenTo(this.collection, 'add change:excluded', this.render);
  },

  render: function() {
    var filteredSchools = this.collection.notExcluded(),
        teachersAndStudents = this.countPeople(filteredSchools);
    this.$el.html(this.template({
      schools: filteredSchools.length,
      teachers: teachersAndStudents.teachers,
      students: teachersAndStudents.students
    }));
    return this;
  },

  countPeople: function(schools) {
    var totalTeachers = 0,
        totalStudents = 0;
    _.each(schools, function(school) {
      if (school.has('osm:education:teachers')) {
        totalTeachers += +school.get('osm:education:teachers');
      }
      if (school.has('osm:education:students')) {
        totalStudents += +school.get('osm:education:students');
      }
    });
    return {
      teachers: totalTeachers,
      students: totalStudents
    };
  }

});
