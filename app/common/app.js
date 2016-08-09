(function() {
    'use strict';

    angular
        .module('app', [
            'ui.router',
            'ui.bootstrap',
            'angularBootstrapMaterial',
            'ngAnimate'
        ])
        .config(config);

    config.$inject = ['$stateProvider', '$urlRouterProvider'];

    function config($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/");
        $stateProvider
            .state('index', {
                url: '/',
                views: {
                    'system': {
                        templateUrl: 'app/templates/index.html',
                        controller: 'IndexCtrl',
                        controllerUrl: 'app/controllers/IndexCtrl.js'
                    },
                    'files': {
                        templateUrl: 'app/templates/file.html',
                        controller: 'FileCtrl',
                        controllerUrl: 'app/controllers/fileCtrl.js'
                    }
                }
            });
    }
}());
