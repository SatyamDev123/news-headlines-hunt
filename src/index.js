import React from 'react';
import ReactDOM from 'react-dom';
import { Router, browserHistory } from 'react-router';

import rootRoute from './routes';
import './index.scss';

ReactDOM.render(
  <Router history={browserHistory} routes={rootRoute} />,
  document.getElementById('root')
);