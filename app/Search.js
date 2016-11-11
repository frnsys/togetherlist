import _ from 'underscore';

const search = {
  filter: function(items, flags) {
    return _.filter(items, item => {
      return _.every(flags, flag => item[flag]);
    });
  }
};

export default search;
