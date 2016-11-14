import _ from 'underscore';


const util = {
  truncate: function(str, len) {
    if (str.length > len) {
      str = str.slice(0, len-3) + '...';
    }
    return str;
  },

  trim: function(str) {
    return str.replace(/^\s+|\s+$/g, '');
  },

  slugify: function(str) {
    return str.replace(' ', '').replace('-', '');
  },

  joinAnd: function(arr) {
    if (arr.length <= 2) {
      return arr.join(' & ');
    }
    var acc = arr.slice(0, arr.length - 1).join(', ');
    return [acc, arr[arr.length - 1]].join(' & ');
  },

  parseBool: function(str) {
    return str.toLowerCase().startsWith('y');
  },

  parseRating: function(str) {
    var rating;
    if (str.includes('/')) {
      var parts = str.split('/');
      rating = parseInt(parts[0]) + 0.5;
    } else {
      rating = parseInt(str);
    }
    return isNaN(rating) ? -1 : rating;
  },

  parseNumber: function(str) {
    // this grabs the first number only
    return str.split(',')[0].replace(/\D+/g, '');
  }
};

export default util;
