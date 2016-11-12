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

  filter: function(items, filters) {
    return _.chain(items).filter(item => {
      return item.rating >= filters.rating &&
        _.every(filters.categories, cat => _.contains(item.categories, cat)) &&
        _.every(filters.services, service => _.contains(item.services, service)) &&
        _.every(filters.flags, flag => item[flag]) &&
        (!filters.state || item.state == filters.state);
    }).sortBy((item, i) => {
      return filters.sortByRating ? item.rating * -1 : i;
    }).value();
  },

  search: function(query) {
    return this._index.search(query);
  }
};

export default search;
