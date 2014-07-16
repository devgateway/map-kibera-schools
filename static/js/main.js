(function Launch(app) {
  var routes = [];

  routes.push({match: /^\/$/, init: function home() {
    console.log('routing: home');
    var schools = new app.models.Schools;
    new app.views.MapFilters({
      el: $('#map .controls'),
      schools: schools
    }).render();
    new app.views.MapAllSchools({
      el: $('#map .map'),
      collection: schools
    }).render();
    new app.views.SchoolsStats({
      el: $('#stats .stats-container'),
      collection: schools
    }).render();
  }});

  routes.push({match: /^\/schools\//, init: function schoolProfile() {
    console.log('routing: school');
  }});

  // init the view for the current page
  var loc = window.location.pathname;
  var view = _.find(routes, function(route) { return route.match.test(loc) });
  view && view.init();

})(window.app);
