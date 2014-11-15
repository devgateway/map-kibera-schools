app.views.MapOneSchool = Backbone.View.extend({

  initialize: function() {
    this.map = new app.views.Map({ el: this.el });
    this.map.pinSchool(this.model, {feature: true});
    this.model.set('selected', true);
    this.map.map.setView(this.model.get('locations')[0], app.config.map.localZoom);
  }

});
