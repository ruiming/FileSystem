var routeApp = angular.module('asd',['ui.router','ui.bootstrap', 'angularBootstrapMaterial']);

routeApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){

    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('index', {
            url: '/',
            views: {
                'system': {
                    templateUrl: 'app/templates/index.html',
                    controller: 'indexCtrl',
                    controllerUrl: 'app/controllers/indexCtrl.js'
                },
                'files': {
                    templateUrl: 'app/templates/file.html',
                    controller: 'fileCtrl',
                    controllerUrl: 'app/controllers/fileCtrl.js'
                }
            }
        });

}]);
