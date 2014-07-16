(function() {

  app.filterWidgets.Select = Backbone.View.extend({

    // template: _.template('<label>' +
    //                      '  <span class="visually-hidden"><%= name %></span>' +
    //                      '  <select>' +
    //                      '    <option name="unset"><%= name %></option>' +
    //                      '  </select>' +
    //                      '</label>'),

    template: _.template('<a href="#schools"><%= name %></a>' +
                         '<div class="map-control-dropdown">' +
                         '  <ul></ul>' +
                         '</div>'),

    events: {
      'change select': 'select'
    },

    initialize: function(opts) {
      this.name = opts.name;
      this.things = opts.things;

      this.filterOptions = {
        osm: [],
        kenyaopendata: []
      };

      this.things.each(this.updateOptions);
      this.listenTo(this.things, 'add', this.updateOptions);
    },

    render: function() {
      this.$el.html(this.template(this));
      var optionSelect = this.$('select');
      _.each(this.filterOptions.osm, function(option) {
        var optionView = new SelectOptionView({model: option});
        optionSelect.append(optionView.render().el);
      });
      return this;
    },

    updateOptions: function(school) {

    },

    select: function() {
      console.log('wooo selection ch-ch-changed', this);
    }
  });


  var SelectOptionView = Backbone.View.extend({
    tagName: 'option',
    attributes: function() {
      return {'value': this.model.get('id')};
    },
    render: function() {
      this.$el.text(this.model.get('name'));
      return this;
    }
  });

})();
