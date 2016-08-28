(function() {
    'use strict';

    angular
        .module('app')
        .directive('focusMe', focusMe);

    focusMe.$inject = ['$timeout'];

    function focusMe($timeout) {
        return {
            scope: { trigger: '@focusMe' },
            link(scope, element) {
                scope.$watch('trigger', value => {
                    if(value === 'true') {
                        $timeout(() => {
                            element[0].focus();
                        });
                    }
                });
            }
        };
    };

}());
