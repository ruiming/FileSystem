import os from 'os'
import wmic from 'node-wmic'

(function() {
    'use strict';

    angular
        .module('app')
        .controller('IndexCtrl', IndexCtrl);

    IndexCtrl.$inject = ['$scope', '$interval'];

    function IndexCtrl($scope, $interval) {
        $scope.bios = [];

        getOS();
        wmic.cpu().then(result => { $scope.cpu = result; });
        wmic.bios().then(result => { $scope.bios = result; });
        wmic.baseboard().then(result => { $scope.baseboard = result; });
        wmic.os().then(result => { $scope.os = result; });
        wmic.memorychip().then(result => { $scope.memorychip = result; });

        $interval(() => {
            getOS();
            wmic.cpu().then(result => { $scope.cpu = result; });
        }, 1000);

        function getOS() {
            $scope.system = {
                arch: os.arch(),                                    // 处理器架构
                endianness: os.endianness(),                        // 字节顺序 高位优先返回BE,低位优先的返回LE
                freemen: os.freemem(),                              // 空闲内存字节
                totalmem: os.totalmem(),                            // 系统总内存
                platform: os.platform(),                            // 操作系统类型
                release: os.release(),                              // 操作系统版本
                type: os.type(),                                    // 操作系统名称
                uptime: os.uptime()                                 // 计算机正常运行时间
            };
        }
    }
}());
