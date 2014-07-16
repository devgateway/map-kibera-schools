(function(app) {

  // get serious
  window.app = app;

  // module attachment points
  app.models = {};
  app.views = {};
  app.filterWidgets = {};

  // misc config and constants
  app.config = {
    map: {
      tiles: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      centre: [-1.313, 36.788],
      zoom: 15
    },
    marker: {
      radius: 18 // metres
    },
    throttle: 85  // ms
  }

  // set up the views depending on the page
  app.pages = {};

  app.pages.home = function home() {
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
  };

  app.pages.schoolProfile = function schoolProfile() {
  };

})(new (function App() {}));
