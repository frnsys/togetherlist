import lunr from 'lunr';
import _ from 'underscore';

const search = {
  index: function(items) {
    this._index = lunr(function() {
      this.field('name', {boost: 10});
      this.field('body');
      this.field('state');
      this.field('categories');
      this.ref('id');
    });

    _.each(items, (item, i) => {
      this._index.add({
        id: i,
        name: item.name,
        body: item.description,
        categories: item.categories.join(', '),
        state: item.state
      });
    });
  },

  // TODO does not filter services yet
  filter: function(items, filters) {
    return _.filter(items, item => {
      return item.rating >= filters.rating &&
        _.every(filters.categories, cat => _.contains(item.categories, cat)) &&
        _.every(filters.flags, flag => item[flag]);
    });
  },

  search: function(query) {
    return this._index.search(query);
  }
};

export default search;
