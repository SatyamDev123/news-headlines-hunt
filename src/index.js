import React from 'react';
import ReactDOM from 'react-dom';
// import { Router, browserHistory } from 'react-router';

// import rootRoute from './routes';
import News from './containers/News';
import './index.scss';

ReactDOM.render(
  <News />,
  // <Router history={browserHistory} routes={rootRoute} />,
  document.getElementById('root')
);