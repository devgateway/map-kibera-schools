(function(app) {

  // get serious
  window.app = app;

  // module attachment points
  app.models = {};
  app.views = {};
  app.filterWidgets = {};
  app.mixins = {};

  // misc config and constants
  app.config = {
    map: {
      tiles: 'http://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
      centre: [-1.293, 36.817],
      zoom: 13,
      localZoom: 17
    },
    marker: {
      radius: 5
    },
    throttle: 85  // ms
  };

  // set up the views depending on the page
  app.pages = {};

  app.pages.home = function home() {
    var schools = new app.models.Schools();

    var mapfilters = this.mapfilters = (new app.views.MapFilters({
      el: $('#map .controls'),
      schools: schools
    })).render();
    new app.views.MapAllSchools({
      el: $('#map .map'),
      collection: schools
    }).render();
    new app.views.SchoolsStats({
      el: $('#stats .stats-container'),
      collection: schools
    }).render();

    u.eachNode(document.querySelectorAll('.action-school-search'), function(s) {
      s.addEventListener('click', function() {
        mapfilters.quickSearchWidget.model.set('expanded', true);
      });
    });
  };

  app.pages.schoolProfile = function schoolProfile() {
    var schoolModel = new app.models.School(school); // from global scope
    window.v = new app.views.MapOneSchool({
      el: $('#school-map-display'),
      model: schoolModel
    }).render();
    new app.views.ProfileData({
      el: $('#school-blurbs'),
      model: schoolModel
    });
  };

})(new (function App() {})());
