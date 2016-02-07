var LinkModel = Backbone.Model.extend({
  defaults: function() {
    return {
      title: null,
      desc: null,
      url: null
    }
  },
});

var LinkCollection = Backbone.Collection.extend({
  model: LinkModel,
  url: 'links.json'
})

var Links = new LinkCollection();

var LinkView = Backbone.View.extend({
  tagName: 'li',
  template: _.template($('#item-template').html()),

  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
  },

  render: function() {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  }
});

var LinksView = Backbone.View.extend({
  el: "#link-list",
  initialize: function() {
    this.listenTo(Links, 'add', this.addOne);
    Links.fetch();
  },
  addOne: function(linkModel) {
    var view = new LinkView({model: linkModel});
    this.$el.append(view.render().el);
  }
});

var listView = new LinksView();
