angular.module('mean', ['ngCookies', 'ngResource', 'ngRoute', 'ngAnimate',
  'ui.bootstrap', 'ui.route', 'ngTouch',
  'mean.system',
  'mean.chart', 
  ]);

angular.module('mean.system', []);
angular.module('mean.chart', ['ajoslin.promise-tracker', 'cgBusy']);
