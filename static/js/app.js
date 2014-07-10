(function(App) {

  // module attachment points
  App.models = {};
  App.views = {};
  App.filterWidgets = {};

  // app-wide constants
  App.THROTTLE = 85;  // ms

  // get serious
  window.App = App;

})(function App() { this.autoInit() });
