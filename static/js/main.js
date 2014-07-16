(function Launch(app) {

  var routes = [
    { match: /^\/$/,
      page: app.pages.home },
    { match: /^\/schools\//,
      page: app.pages.schoolProfile }
  ];

  // init the view for the current page
  var loc = window.location.pathname;
  var view = _.find(routes, function(route) { return route.match.test(loc) });
  console.info('routing: ', view.page.name);
  view && view.page();

})(window.app);
