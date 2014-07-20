app.filterWidgets.OptionView = Backbone.View.extend({

  tagName: 'li',

  template: _.template('<a href="#">' +
                       '  <%= optionValue || "unknown" %>' +
                       '</a>'),

  events: {
    'mouseover': 'cursorMePlease',
    'click': 'selectMePlease'
  },

  initialize: function() {
    this.listenTo(this.model, 'change:cursored', this.changeCursored);
    this.listenTo(this.model, 'change:selected', this.changeSelected);
  },

  render: function() {
    this.$el.html(this.template(this.getRenderContext()));
    return this;
  },

  getRenderContext: function() {
    return this.model.attributes;
  },

  cursorMePlease: function() {
    this.model.trigger('cursorme', this.model);
  },

  selectMePlease: function() {
    this.model.trigger('selectme', this.model);
    this.$('a').focus();  // damn chromium...
  },

  changeCursored: function(myModel, cursored) {
    this.$el[cursored? 'addClass' : 'removeClass']('cursored');
  },

  changeSelected: function(myModel, selected) {
    this.$el[selected? 'addClass' : 'removeClass']('selected');
  }

});


app.filterWidgets.Select = Backbone.View.extend({

  tagName: 'li',

  template: _.template('<a class="activate" href="#"><%= name %></a>' +
                       '<div class="map-control-dropdown">' +
                       '</div>'),

  dropDownTemplate: _.template('<ul></ul>'),  // broken out to easily override

  events: {
    'click >.activate': 'selectUIActivate',
    'keydown': 'selectUIKeyNav',
    'click .map-control-dropdown': 'clickedToSelect'
  },

  initialize: function() {
    this.rendered = false;
    this.model.options.each(this.addOption);
    this.listenTo(this.model, 'change:expanded', this.expandOptions);
    this.listenTo(this.model, 'change:value', this.setSelect);
    this.listenTo(this.model.options, 'add', this.reorderOptions);
    this.listenTo(this.model.options, 'sort', this.reorderOptions);
  },

  render: function() {
    this.$el.html(this.template(this.model.attributes));
    this.$('.map-control-dropdown').html(this.dropDownTemplate());
    if (! this.rendered) {
      this.reorderOptions();
      this.rendered = true;
    }
    return this;
  },

  reorderOptions: function() {
    if (! this.rendered) {
      return;
    }
    this.$('.map-control-dropdown > ul').html(this.model.options.map(function(option) {
      return (new app.filterWidgets.OptionView({ model: option })).render().el;
    }, this));
    this.moveCursor(0);
  },

  setSelect: function(model, newValue) {
    this.$('> .activate').text(newValue || 'unknown');
  },

  expandOptions: function(myModel, expanded) {
    this.$el[expanded ? 'addClass' : 'removeClass']('active');
    this.$('> a').focus();  // chrome sucks
  },

  selectUIActivate: function(e) {
    e.preventDefault();
    this.model.set('expanded', !this.model.get('expanded'));
  },

  selectCursored: function() {
    var cursored = this.model.options.find(function(option) {
      return option.get('cursored');
    });
    if (! cursored) {
      cursored = this.model.options.at(0);
    }
    cursored.trigger('selectme', cursored);
  },

  moveCursor: function(changeIndex) {
    var oldCursored = this.model.options.find(function(option) {
      return option.get('cursored');
    });
    if (! oldCursored) {
      oldCursored = this.model.options.at(0);
    }
    var oldIndex = this.model.options.indexOf(oldCursored);

    var naiiveNextIndex = oldIndex + changeIndex;
    var lastIndex = this.model.options.length - 1;
    var nextIndex = Math.max(0, Math.min(lastIndex, naiiveNextIndex));

    var nextCursored = this.model.options.at(nextIndex);

    nextCursored.trigger('cursorme', nextCursored);
  },

  selectUIKeyNav: function(e) {
    var keyNameMap = {
      ESCAPE:   function() { this.model.set('expanded', false); },
      SPACE:    function() { this.selectCursored(); },
      ENTER:    function() { this.selectCursored();
                             this.model.set('expanded', false) },
      UP:       function() { this.moveCursor(-1); },
      DOWN:     function() { this.moveCursor(+1); },
      PAGEUP:   function() { this.moveCursor(-7); },
      PAGEDOWN: function() { this.moveCursor(+7); },
      HOME:     function() { this.moveCursor(-Infinity); },
      END:      function() { this.moveCursor(+Infinity); }
    };
    var keyName = u.key[e.keyCode];
    var keyAction = keyNameMap[keyName];
    if (keyAction) {
      e.preventDefault();
      keyAction.call(this);
      if (! this.model.get('expanded')) {
        this.selectCursored();
      }
    }
  },

  clickedToSelect: function(e) {
    // selection handled in the option's view,
    // we just need to prevent the page jumping to the top
    // and close the menu
    e.preventDefault();
    this.model.set('expanded', false);
  }

});
