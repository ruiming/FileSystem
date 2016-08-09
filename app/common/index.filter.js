(function() {
    'use strict';

    let index = () => (array, index) => {
        if (!index) {
            index = 'index';
        }
        for (var i = 0; i < array.length; ++i) {
            array[i][index] = i;
        }
        return array;
    };

    angular
        .module('app')
        .filter('index', index);
}());
