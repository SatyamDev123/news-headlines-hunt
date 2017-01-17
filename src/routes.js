import App from './containers/App';

export default {
  component: App,
  childRoutes: [
    {
      path: '',
      getComponent(location, cb) {
        require.ensure([], require => {
            // default import is not supported in CommonJS standard
            cb(null, require('./containers/Home').default) 
        });
      },
      childRoutes: [
        {
          path: '/(:source_id)(/:source_sortBy)',
          getComponent(location, cb) {
            require.ensure([], require => {
                // default import is not supported in CommonJS standard
                cb(null, require('./containers/News').default) 
            });
          }
        }
      ]
    }
  ]
};