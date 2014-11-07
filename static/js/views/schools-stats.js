app.views.SchoolsStats = Backbone.View.extend({

  template: _.template('<h3><span class="bignum"><%= schools %></span> schools</h3>' +
                       '<h3><span class="bignum"><%= teachers %></span> teachers</h3>' +
                       '<h3><span class="bignum"><%= students %></span> students</h3>'),

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
        var teachers = +school.get('osm:education:teachers');
        if (isNaN(teachers)) { teachers = 0; }
        totalTeachers += teachers;
      }
      if (school.has('osm:education:students')) {
        var students = +school.get('osm:education:students');
        if (isNaN(students)) { students = 0; }
        totalStudents += students;
      }
    });
    return {
      teachers: totalTeachers,
      students: totalStudents
    };
  }

});
