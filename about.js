import $ from 'jquery';
import _ from 'underscore';
import util from './app/Util';
import sheet from './app/Sheet';

const SPREADSHEET_ID = '1ZbpkjdrrAH95xHWKxjp-bb6nvoKZIZLhXrDwBREa_PA';

// setup contributors
sheet.load(SPREADSHEET_ID, 1, rows => {
  var core = [],
      nonCore = [];
  _.each(rows, row => {
    var obj = sheet.parseRow(row);
    obj.core = util.parseBool(obj.core);
    if (obj.core) {
      core.push(obj);
    } else {
      nonCore.push(obj);
    }
  });

  $('.contributors-core').append(util.joinAnd(_.map(core, c => {
    if (c.url) {
      return `<a href="${c.url}" target="_blank">${c.name}</a>`;
    } else {
      return c.name;
    }
  })));

  $('.contributors-more').append(util.joinAnd(_.map(nonCore, c => {
    if (c.url) {
      return `<a href="${c.url}" target="_blank">${c.name}</a>`;
    } else {
      return c.name;
    }
  })));
});

// setup about text
sheet.load(SPREADSHEET_ID, 2, rows => {
  var topText = sheet.parseRow(rows[0]).text,
      introText = sheet.parseRow(rows[1]).text,
      bodyText = sheet.parseRow(rows[2]).text;
  $('.about-intro .about-body').html(`<p><b>${topText}</b></p>`);
  $('.about-intro .about-body').append(
    _.map(introText.split('\n'), line => `<p>${line}</p>`));
  $('.about-letter').html(
    _.map(bodyText.split('\n'), line => `<p>${line}</p>`));
});
