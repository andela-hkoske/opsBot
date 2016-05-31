//
// import React from 'react';
// import { Router, Route, IndexRoute, browserHistory } from 'react-router';
// import { render } from 'react-dom';
// // import App from './components/main.jsx';
//
// render(<App />, document.getElementById('view'));
var React = require('react');
var ReactDOM = require('react-dom');

var App = React.createClass({
  render: function() {
    return (<h3>Hello world</h3>);
  }
});

ReactDOM.render(<App />, document.getElementById('view'));
