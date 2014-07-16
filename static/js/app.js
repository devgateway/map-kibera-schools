(function(app) {

  // module attachment points
  app.models = {};
  app.views = {};
  app.filterWidgets = {};

  // app-wide constants
  app.THROTTLE = 85;  // ms

  // get serious
  window.app = app;

})(new (function App() {}));
