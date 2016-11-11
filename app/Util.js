import _ from 'underscore';


const util = {
  truncate: function(str, len) {
    if (str.length > len) {
      str = str.slice(0, len-3) + '...';
    }
    return str;
  },

  parseGSXRow: function(row) {
    // parse a GSX (Google Spreadsheet)
    // row into something nicer
    var obj = {};
    _.each(row, (v, k) => {
      if (k.startsWith('gsx$')) {
        var field = k.replace('gsx$', '');
        obj[field] = v.$t;
      }
    });
    return obj;
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
    return isNaN(rating) ? false : rating;
  }
};

export default util;
