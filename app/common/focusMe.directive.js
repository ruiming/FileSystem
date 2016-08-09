(function() {
    'use strict';

    let focusMe = () => {
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

    angular
        .module('app')
        .directive('focusMe', focusMe);
}());
