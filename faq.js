import $ from 'jquery';
import _ from 'underscore';
import util from './app/Util';
import sheet from './app/Sheet';

function renderQuestion(f) {
  return _.map(util.trim(f.question).split('\n'), line => `${line}<br />`).join('');
}

// setup faq
sheet.load(7, rows => {
  var faq = _.map(rows, row => {
    return sheet.parseRow(row);
  });
  $('.faq-questions').html(
    _.map(faq, (f, i) => `<li><a href="#q${i}">- ${renderQuestion(f)}</a></li>`).join(''));

  $('.faq-answers').html(
    _.map(faq, (f, i) => `<li>
      <a name="q${i}" class="faq-answer-question">${renderQuestion(f)}</a>
      <p>${f.answer}</p>
      <a href="#top" class="back-to-top">back to top</a>`).join(''));
});
