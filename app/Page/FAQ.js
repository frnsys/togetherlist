import _ from 'underscore';
import util from '../Util';
import sheet from '../Sheet';
import Header from '../Header';
import React, {Component} from 'react';

const SPREADSHEET_ID = '1ZbpkjdrrAH95xHWKxjp-bb6nvoKZIZLhXrDwBREa_PA';

function renderQuestion(f) {
  return _.map(util.trim(f.question).split('\n'), line => `${line}<br />`).join('');
}

class FAQ extends Component {
  componentWillMount() {
    this.setState({
      introHeader: '',
      sideColumn: '',
      questions: '',
      answers: ''
    });

    // setup faq
    sheet.load(SPREADSHEET_ID, 3, rows => {
      var faq = _.map(rows, row => {
        return sheet.parseRow(row);
      }),
        introHeader = faq[0].introheader,
        sideColumn = _.map(faq[0].sidecolumn.split('\n'), l => `<li>${l}</li>`);

      this.setState({
        introHeader: introHeader,
        sideColumn: sideColumn,
        questions: _.map(faq, (f, i) => `<li><a href="#q${i}">- ${renderQuestion(f)}</a></li>`).join(''),
        answers: _.map(faq, (f, i) => `<li>
          <a name="q${i}" class="faq-answer-question">${renderQuestion(f)}</a>
          <p>${f.answer}</p>
          <a href="#top" class="back-to-top">back to top</a>`).join('')
      });
    });
  }

  render() {
    var header = <h1 className="title about-title">togetherlist FAQ</h1>;
    return (
      <div>
        <Header content={header} />
        <section className="content faq">
          <article>
            <h1 className="faq-intro" dangerouslySetInnerHTML={{__html: this.state.introHeader}}></h1>
            <ul className="faq-questions" dangerouslySetInnerHTML={{__html: this.state.questions}}></ul>
            <ul className="faq-answers" dangerouslySetInnerHTML={{__html: this.state.answers}}></ul>
          </article>
          <aside>
            <ul className="faq-aside" dangerouslySetInnerHTML={{__html: this.state.sideColumn}}></ul>
          </aside>
      </section>
      </div>
    );
  }
}

export default FAQ;
