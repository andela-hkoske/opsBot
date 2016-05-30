import React from 'react';
import { Router, Route, IndexRoute, browserHistory } from 'react-router';
import { render } from 'react-dom';
import App from './components/main';

render((
  <Router history={browserHistory}>
    <Route path="/" component={App} >
      <IndexRoute component={App} />
    </Route>
  </Router>), document.getElementById('view'));
