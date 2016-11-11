import _ from 'underscore';

const search = {
  // TODO does not filter services yet
  filter: function(items, filters) {
    return _.filter(items, item => {
      return item.rating >= filters.rating &&
        _.every(filters.categories, cat => _.contains(item.categories, cat)) &&
        _.every(filters.flags, flag => item[flag]);
    });
  }
};

export default search;
