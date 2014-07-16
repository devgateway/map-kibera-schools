(function() {

  app.filterWidgets.QuickSearch = Backbone.View.extend({

    template: _.template('<a href="#schools">Schools List</a>' +
                         '<div class="map-inputs school-list">' +
                         '  <input id="school-dir-search" type="text" ' +
                         '         name="school-dir-search" placeholder="Quick Search" />' +
                         '  <ul></ul>' +
                         '</div>'),

    events: {
      'click >a': 'activate',
      'keyup input': 'fuzzySearch',
      'change input': 'fuzzySearch',
      // 'keyup .school-list': 'keyNav',
    },

    initialize: function(opts) {
      _.extend(this, opts);
      // this.schoolNames = [];
      // this.schoolItemEls = {};  // model.cid: ListedSchool(model).el
      // this.collection.each(this.schoolAdded, this);
      // this.listenTo(this.collection, 'add', this.schoolAdded);
      // this.listenTo(this.collection, 'sort', this.renderList);
    },

    render: function() {
      this.$el.html(this.template());
      this.renderList();
      return this;
    },

    renderList: _.throttle(function() {
      var schoolItemEls = this.schoolItemEls,
          sortedSchools = [];
      this.collection.each(function(school) {
        var schoolListItemViewEl = schoolItemEls[school.cid];
        sortedSchools.push(schoolListItemViewEl);
      });
      this.$('ul').html(sortedSchools);
    }, app.throttle),

    schoolAdded: function(school) {
      // map simplified names to models for quick fuzzy matching
      var schoolSimpleName = this._simplify(school.get('name'));
      this.schoolNames.push({name: schoolSimpleName,
                             school: school});
      // map model ids to view els for quick reordering
      var schoolListItemViewEl = new ListedSchool({model: school}).render().el;
      this.schoolItemEls[school.cid] = schoolListItemViewEl;
    },

    _simplify: function(str) {
      lowered = str.toLowerCase();
      unspecialed = lowered.replace(/[^a-z]/g, '');
      return unspecialed;
    },

    fuzzySearch: _.debounce(function() {
      var key = this._simplify(this.$('input').val());
      var simplify = this._simplify;  // ref for the loop

      _.each(this.schoolNames, function(simpleName) {

        if (simpleName.name.length - key.length < 0) {
          key = key.slice(0, simpleName.name.length);
        }
        var nameSubstr = simpleName.name.slice(0, key.length);

        var score = Levenshtein.get(nameSubstr, key);

        // prefer names that start with the first letter of the key
        var score = score - u.startsWith(simpleName.name, key.slice(0, 1));

        simpleName.school.set('fuzzyScore', score);
      });

      this.collection.sort();

    }, app.throttle),

    activate: function(e) {
      e.preventDefault();
      this.$el.toggleClass('active');
      if (this.$el.hasClass('active')) {
        this.$('input').focus();
      };
    },

    keyNav: function() {
      console.log('nav nav nav');
    }
  });


  var ListedSchool = Backbone.View.extend({

    tagName: 'li',
    template: _.template('<a href="/schools/<%= slug %>"><%= name %></a>'),

    events: {
      'mouseover >a': 'hover',
      'mouseout >a': 'unhover'
    },

    initialize: function() {
      this.listenTo(this.model, 'change:fuzzyScore', this.updatedScore);
    },

    render: function() {
      this.$el.html(this.template(this.model.attributes));
      return this;
    },

    updatedScore: function() {
      var excluded = this.model.get('fuzzyScore') > 3;
      this.model.set('excluded', excluded);
      if (excluded) {
        this.$el.addClass('hidden');
      } else {
        this.$el.removeClass('hidden');
      }
    },

    hover: function() {
      console.log('over');
    },

    unhover: function() {
      console.log('and out');
    }

  });

})();
