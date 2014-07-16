(function() {

  app.filterWidgets.Select = Backbone.View.extend({

    template: _.template('<label>' +
                         '  <span class="visually-hidden"><%= name %></span>' +
                         '  <select>' +
                         '    <option name="unset"><%= name %></option>' +
                         '  </select>' +
                         '</label>'),

    events: {
      'change select': 'select'
    },

    initialize: function(opts) {
      _.extend(this, opts);
      this.options = {
        osm: [],
        kenyaopendata: []
      };
      this.schools.each(this.updateOptions);
      this.listenTo(this.schools, 'add', this.updateOptions);
    },

    render: function() {
      this.$el.html(this.template(this.model.attributes));
      var optionSelect = this.$('select');
      this.model.get('options').each(function(option) {
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
