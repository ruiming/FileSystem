(function() {
    'use strict';

    let size = () => (size) => {
        let kb = 1024;
        let mb = 1024 * 1024;
        let gb = mb * 1024;
        if(size === void 0) return;
        if(size > gb) return (size / gb).toFixed(2) + "GB";
        else if(size > mb) return (size / mb).toFixed(2) + "MB";
        else if(size > kb) return (size / kb).toFixed(2) + "KB";
        else return size.toFixed(2) + "B";
    };

    angular
        .module('app')
        .filter('size', size);
}());
