import wmic from 'node-wmic'

(function() {
    'use strict';

    angular
        .module('app', [
            'ui.router',
            'ui.bootstrap',
            'angularBootstrapMaterial',
            'ngAnimate',
            'infinite-scroll'
        ])
        .config(config)
        .run(function ($rootScope) {
            $rootScope.$on("$stateChangeStart", function (event, toState, toStateParams, fromState, fromStateParams) {
                var isLoading = toState.resolve;
                if(!isLoading) {
                    for (var prop in toState.views) {
                        if (toState.views.hasOwnProperty(prop)) {
                            if(toState.views[prop].resolve) {
                                isLoading = true;
                                break;
                            }
                        }
                    }
                }
                if (isLoading) {
                    $rootScope.loading = true;
                }
            });
            $rootScope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {
                $rootScope.loading = false;
            });
            $rootScope.$on("$stateChangeError", function (event, toState, toParams, fromState, fromParams, error) {
                $rootScope.loading = false;
            });
        });

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
                        controllerUrl: 'app/controllers/IndexCtrl.js',
                        resolve: {
                            cpu: function() {
                                return wmic.cpu().then(r => r);
                            },
                            bios: function() {
                                return wmic.bios().then(r => r);
                            },
                            baseboard: function() {
                                return wmic.baseboard().then(r => r);
                            },
                            os: function() {
                                return wmic.os().then(r => r);
                            },
                            memorychip: function() {
                                return wmic.memorychip().then(r => r);
                            }
                        }
                    },
                    'files': {
                        templateUrl: 'app/templates/file.html',
                        controller: 'FileCtrl',
                        controllerUrl: 'app/controllers/fileCtrl.js',
                        resolve: {
                            diskdrive: function() {
                                return wmic.diskdrive().then(diskdrive => diskdrive);
                            },
                            disks: function() {
                                return wmic.disk().then(disks => disks)
                            }
                        }
                    }
                }
            });
    }
}());
