app.filterWidgets.Select = app.filterWidgets.SelectUI.extend({

  select: function() {
    console.log('wooo selection ch-ch-changed', this);
  }
});


// var SelectOptionView = Backbone.View.extend({
//   tagName: 'option',
//   attributes: function() {
//     return {'value': this.model.get('id')};
//   },
//   render: function() {
//     this.$el.text(this.model.get('name'));
//     return this;
//   }
// });

