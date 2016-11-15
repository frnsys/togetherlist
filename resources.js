import $ from 'jquery';
import _ from 'underscore';
import util from './app/Util';
import sheet from './app/Sheet';

const SPREADSHEET_ID = '1ZbpkjdrrAH95xHWKxjp-bb6nvoKZIZLhXrDwBREa_PA';

function renderResource(f) {
  return _.map(util.trim(f.contentsection).split('\n'), line => `${line}<br />`).join('');
}

// setup resources
sheet.load(SPREADSHEET_ID, 4, rows => {
  var resources = _.map(rows, row => {
    return sheet.parseRow(row);
  }),
    introHeader = resources[0].introheader,
    sideColumn = _.map(resources[0].sidecolumn.split('\n'), l => `<li>${l}</li>`);

  $('.resources-intro').html(introHeader);
  $('.resources-aside').html(sideColumn);
  $('.resources-index').html(
    _.map(resources, (f, i) => `<li><a href="#q${i}">${f.contentheader.toUpperCase()}</a></li>`).join(''));

  $('.resources-resources').html(
    _.map(resources, (f, i) => `<li>
      <a name="q${i}" class="resources-resource">${f.contentheader.toUpperCase()}</a>
      <p>${renderResource(f)}</p>
      <a href="#top" class="back-to-top">back to top</a>`).join(''));
});

