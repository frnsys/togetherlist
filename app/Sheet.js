import $ from 'jquery';
import _ from 'underscore';

const SPREADSHEET_ID = '1kq6z9cEeqqGL5R5mdclkj5HjD-w9dvL8xCYmhG1UziQ';

const spreadsheet = {
  load: function(num, onLoad) {
    var url = `https://spreadsheets.google.com/feeds/list/${SPREADSHEET_ID}/${num}/public/full?alt=json`;
    $.ajax({
      url: url,
      success: data => onLoad(data.feed.entry)
    });
  },

  parseRow: function(row) {
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
  }
}

export default spreadsheet;
