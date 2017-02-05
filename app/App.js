import React, {Component} from 'react';
import {Router, Route, Link, IndexRoute, browserHistory} from 'react-router';
import List from './List';
import FAQ from './Page/FAQ';
import About from './Page/About';
import Resources from './Page/Resources';

const NotFound = () => <h1>404.. This page is not found!</h1>;

class App extends Component {
  render() {
    return (
      <main>
        <Router history={browserHistory}>
          <Route path='/' component={List} />
          <Route path='/about' component={About} />
          <Route path='/faq' component={FAQ} />
          <Route path='/resources' component={Resources} />
          <Route path='*' component={NotFound} />
        </Router>
      </main>
    )
  }
}

export default App;
