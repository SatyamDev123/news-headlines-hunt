// import React from 'react';
// import App from './containers/App';

// function errorLoading(err) {
//   console.error('Dynamic page loading failed', err);

// }

// function loadRoute(cb) {
//   return (module) => cb(null, module.default);
// }

// export default {
//   component: App,
//   childRoutes: [
//     {
//       path: '',
//       getComponent(location, cb) {
//         require.ensure([], require => {
//             // default import is not supported in CommonJS standard
//             cb(null, require('./containers/Home').default) 
//         });
//       },
//       childRoutes: [
//         {
//           path: '/',
//           getComponent(location, cb) {
//             require.ensure([], require => {
//                 // default import is not supported in CommonJS standard
//                 cb(null, require('./containers/News').default) 
//             });
//             // System.import('containers/NewsTab')
//             //   .then(loadRoute(cb))
//             //   .catch(errorLoading);
//           }
//         }
//       ]
//     }
//   ]
// };