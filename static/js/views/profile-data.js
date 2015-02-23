app.views.ProfileData = Backbone.View.extend({

  events: {
    'click [href^="#data-source-"]': 'changeSource'
  },

  changeSource: function(e) {
    $('.data-selectable').removeClass('selected');
    var source = e.currentTarget.getAttribute('href').split('-').slice(-1)[0];
    $('.data-' + source).addClass('selected');
    this.model.set('location', {osm: 0, kod:1, compare:2 }[source]);
    return false;
  }

});
