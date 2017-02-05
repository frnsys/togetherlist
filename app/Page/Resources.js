import _ from 'underscore';
import util from '../Util';
import sheet from '../Sheet';
import Header from '../Header';
import Footer from '../Footer';
import React, {Component} from 'react';

const SPREADSHEET_ID = '1ZbpkjdrrAH95xHWKxjp-bb6nvoKZIZLhXrDwBREa_PA';

function renderResource(f) {
  return _.map(util.trim(f.contentsection).replace(/[\u201C\u201D]/g, '"').split('\n'), line => `${line}<br />`).join('');
}

class Resources extends Component {
  componentWillMount() {
    this.setState({
      introHeader: '',
      sideColumn: '',
      resources: '',
      index: ''
    });

    // setup resources
    sheet.load(SPREADSHEET_ID, 4, rows => {
      var resources = _.map(rows, row => {
        return sheet.parseRow(row);
      }),
        introHeader = resources[0].introheader,
        sideColumn = _.map(resources[0].sidecolumn.split('\n'), l => `<li>${l}</li>`);

      this.setState({
        introHeader: introHeader,
        sideColumn: sideColumn,
        index: _.map(resources, (f, i) => `<li><a href="#q${i}">${f.contentheader.toUpperCase()}</a></li>`).join(''),
        resources: _.map(resources, (f, i) => `<li>
          <a name="q${i}" class="resources-resource">${f.contentheader.toUpperCase()}</a>
          <p>${renderResource(f)}</p>
          <a href="#top" class="back-to-top">back to top</a>`).join('')
      });
    });
  }

  render() {
    var header = <h1 className="title about-title">togetherlist Resources</h1>;
    return (
      <div>
        <Header content={header} />
        <section className="content resources">
          <article>
            <h1 className="resources-intro" dangerouslySetInnerHTML={{__html: this.state.introHeader}}></h1>
            <ul className="resources-index" dangerouslySetInnerHTML={{__html: this.state.index}}></ul>
            <ul className="resources-resources" dangerouslySetInnerHTML={{__html: this.state.resources}}></ul>
          </article>
          <aside>
            <ul className="resources-aside" dangerouslySetInnerHTML={{__html: this.state.sideColumn}}></ul>
          </aside>
        </section>
        <Footer />
      </div>
    );
  }
}

export default Resources;
