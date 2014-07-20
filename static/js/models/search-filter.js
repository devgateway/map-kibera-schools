app.models.QuickSearchFilter = Backbone.Model.extend({

  defaults: {
    value: undefined,
    rawValue: undefined
  },

  initialize: function(options) {
    this.key = options.key;
    this.schools = options.schools;
    this.options = this.schools;  // alias for some default UI stuff
    this.normalizedKeyRefs = {};  // {cid, simplified}

    this.listenTo(this, 'change:rawValue', this.inputChanged);

    this.schools.each(this.addSchool);
    this.listenTo(this.schools, 'add', this.addSchool);
  },

  addSchool: function(school) {
    var simpleKey = this._simplify(school.get(this.key));
    if (_.has(this.normalizedKeyRefs, school.cid)) {
      throw new Error('School registred twice:', school);
    }
    this.normalizedKeyRefs[school.cid] = simpleKey;
  },

  inputChanged: function(self, newInput) {
    if (! newInput) {
      this.set('value', undefined);
    } else {
      var simplified = this._simplify(newInput);
      this.set('value', simplified);
      this.trigger('filterchange');
    }
  },

  scoreSchool: function(school) {
    var searchKey = this.get('value'),
        schoolKey = this.normalizedKeyRefs[school.cid],
        score,
        normalized;

    if (! searchKey) {
      return 0;
    }

    schoolKey = schoolKey.slice(0, searchKey.length);
    score = Levenshtein.get(schoolKey, searchKey);
    score += +!u.startsWith(schoolKey, searchKey.slice(0, 1));
    score = score / 4.0;  // normalized
    return score;
  },

  _simplify: function(string) {
    var lowered = string.toLowerCase();
    var unspecialed = lowered.replace(/[^a-z]/g, '');
    return unspecialed;
  }

});
