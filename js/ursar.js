var LinkModel = Backbone.Model.extend({
  defaults: function() {
    return {
      title: null,
      desc: null,
      url: null
    };
  }
});

var LinkCollection = Backbone.Collection.extend({
  model: LinkModel,
  url: 'links.json'
});

var LinkView = Backbone.View.extend({
  tagName: 'li',
  template: _.template($('#item-template').html()),

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});

var LinksView = Backbone.View.extend({
  el: "#link-list",
  wasSearching: false,
  initialize: function() {
    this.listenTo(Links, 'add', this.addOne);
    this.listenTo(Links, 'reset', this.displaySearch);
    Links.fetch();
  },
  addOne: function(linkModel) {
    if(this.wasSearching === true) {
      this.clearView();
      this.wasSearching = false;
    }

    var view = new LinkView({model: linkModel});
    this.$el.append(view.render().el);
  },
  displaySearch: function(newModel) {
    var _this = this;

    this.clearView();
    newModel.models.forEach(function(model) {
      _this.addOne(model);
    });
    this.wasSearching = true;
  },

  clearView: function() {
    this.$el.children().remove();
    this.$el.empty();
  }
});

var Links = new LinkCollection();
var searching = null;

$('#search').keyup(function(ev) {
  if(searching !== null) {
    clearTimeout(searching);
  }
  var textToFind = ev.target.value;
  if(textToFind.trim().length === 0) {
    Links.fetch();
  } else {
    searching = startSearch(textToFind);
  }
});

function startSearch(word) {
  return setTimeout(function () {
    var filtered = Links.filter(function (elem) {
      var searchInTitle = elem.get('title') === null ? -1 : elem.get('title').toLowerCase().indexOf(word);
      var searchInDesc = elem.get('desc') === null ? -1 : elem.get('desc').toLowerCase().indexOf(word);
      var searchInUrl = elem.get('url') === null ? -1 : elem.get('url').toLowerCase().indexOf(word);

      return searchInTitle > -1 ||
          searchInUrl > -1 ||
          searchInDesc > -1;
    });
    Links.reset(filtered);
  }, 1000);
}

new LinksView();