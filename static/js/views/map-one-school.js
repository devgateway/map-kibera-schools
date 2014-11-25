app.views.MapOneSchool = Backbone.View.extend({

  initialize: function() {
    this.map = new app.views.Map({ el: this.el });
    this.pin = this.map.pinSchool(this.model, {feature: true});
    this.map.map.setView(
      this.model.get('locations')[this.model.get('location')],
      app.config.map.localZoom);
    this.model.set('selected', true);
  },

});
