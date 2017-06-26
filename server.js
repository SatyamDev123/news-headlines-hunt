import path from 'path';
import { Server } from 'http';
import request from 'request';
import Express from 'express';
import React, { Component } from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { match, RouterContext } from 'react-router';
import routes from './src/routes';
// import NotFoundPage from './components/NotFoundPage';

// initialize the server and configure support for ejs templates
const app = new Express();
const server = new Server(app);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname , './build'));

// define the folder that will be used for static assets
// app.use(Express.static(path.join(__dirname, '/../build')));

// universal routing and rendering
app.get('*', (req, res) => {
  match(
    { routes, location: req.url },
    (err, redirectLocation, renderProps) => {
      console.log('renderProps', renderProps);
      console.log('redirectLocation', redirectLocation);
      console.log('err', err);
      // in case of error display the error message
      if (err) {
        return res.status(500).send(err.message);
      }

      // in case of redirect propagate the redirect to the browser
      if (redirectLocation) {
        return res.redirect(302, redirectLocation.pathname + redirectLocation.search);
      }

      // generate the React markup for the current route
      let markup;
      if (renderProps) {
        // if the current route matched we have renderProps
        // if params is not null
        // if(renderProps.params){

        // }
        const NewsApiHost = 'https://newsapi.org/v1/';
        const NewsSourceApiUrl = `${NewsApiHost}sources?language=en`;
        request(NewsSourceApiUrl, (error, response, body) => {
          const data = JSON.parse(body);
          Object.assign(renderProps.params, { data })
          markup = renderToString(React.createElement(RouterContext, renderProps, null));
          const indexFile = `${__dirname}/build/index.html`;
          return res.render('index', { markup, data: JSON.stringify(data) });
        });
      } else {
        // otherwise we can render a 404 page
        markup = '<h1>The</h1>';
        res.status(404);
      }

      // render the index template with the embedded React markup
      // return res.render('index', { markup });
    }
  );
});

// start the server
const port = process.env.PORT || 3000;
const env = process.env.NODE_ENV || 'production';
server.listen(port, err => {
  if (err) {
    return console.error(err);
  }
  console.info(`Server running on http://localhost:${port} [${env}]`);
});
