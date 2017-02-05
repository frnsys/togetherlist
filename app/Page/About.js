import _ from 'underscore';
import util from '../Util';
import sheet from '../Sheet';
import Header from '../Header';
import React, {Component} from 'react';

const SPREADSHEET_ID = '1ZbpkjdrrAH95xHWKxjp-bb6nvoKZIZLhXrDwBREa_PA';

class About extends Component {
  componentWillMount() {
    this.setState({
      topText: '',
      introText: '',
      bodyText: '',
      core: [],
      nonCore: []
    });

    // setup about text
    sheet.load(SPREADSHEET_ID, 2, rows => {
      var topText = sheet.parseRow(rows[0]).text,
          introText = sheet.parseRow(rows[1]).text,
          bodyText = sheet.parseRow(rows[2]).text;
      this.setState({
        topText: topText,
        introText: introText,
        bodyText: bodyText
      });
    });

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

      this.setState({
        core: core,
        nonCore: nonCore
      });
    });
  }

  render() {
    var header = <h1 className="title about-title">About togetherlist</h1>;
    var core = util.joinAnd(this.state.core.map((c, i) => {
      return c.url ? <a key={i} href={c.url} target="_blank">{c.name}</a> : c.name;
    }));
    var nonCore = util.joinAnd(this.state.nonCore.map((c, i) => {
      return c.url ? <a key={i} href={c.url} target="_blank">{c.name}</a> : c.name;
    }));
    return (
      <div>
        <Header content={header} />
        <section className="content about-intro">
          <article>
            <div className="about-body">
              <p><b>{this.state.topText}</b></p>
              {this.state.introText.split('\n').map((line, i) => <p key={i} dangerouslySetInnerHTML={{__html: line}}></p>)}
            </div>
              <ul>
                <li><a href="https://docs.google.com/forms/d/e/1FAIpQLScS3scl2_LiNyDk0jf1CCPF9qsZlmrlvTWW_ckMlhGeEL0OXw/viewform?c=0&w=1" target="_blank">Submit</a> your organization</li>
                <li>Follow us on <a href="https://twitter.com/thetogetherlist" target="_blank">Twitter</a></li>
              </ul>
          </article>
          <aside>
            <p><b>The Togetherlist Project</b> is a collaborative initiative with outstanding efforts of contributors and volunteers.</p>
            <p className="contributors-core"><b>Core</b><br/>{core}</p>
            <p className="contributors-more"><b>Contributors & Volunteers</b><br/>{nonCore}</p>
            <p><b>Interested in joining us?</b><br />Please let us know <a href="https://goo.gl/forms/4IWT4csOb6MgtyVf1">here</a>.</p>
          </aside>
        </section>
        <section className="content about-letter">
          {this.state.bodyText.split('\n').map((line, i) => <p key={i} dangerouslySetInnerHTML={{__html: line}}></p>)}
        </section>
      </div>
    );
  }
}

export default About;
