import nodeos from 'os'
import wmic from 'node-wmic'

(function() {
    'use strict';

    angular
        .module('app')
        .controller('IndexCtrl', IndexCtrl);

    IndexCtrl.$inject = ['$scope', '$interval', 'cpu', 'bios', 'baseboard', 'os', 'memorychip'];

    function IndexCtrl($scope, $interval, cpu, bios, baseboard, os, memorychip) {
        $scope.bios = bios;
        $scope.cpu = cpu;
        $scope.baseboard = baseboard;
        $scope.os = os;
        $scope.memorychip = memorychip;

        getOS();

        $interval(() => {
            getOS();
            wmic.cpu().then(result => { $scope.cpu = result; });
        }, 1000);

        function getOS() {
            $scope.system = {
                arch: nodeos.arch(),                                    // 处理器架构
                endianness: nodeos.endianness(),                        // 字节顺序 高位优先返回BE,低位优先的返回LE
                freemen: nodeos.freemem(),                              // 空闲内存字节
                totalmem: nodeos.totalmem(),                            // 系统总内存
                platform: nodeos.platform(),                            // 操作系统类型
                release: nodeos.release(),                              // 操作系统版本
                type: nodeos.type(),                                    // 操作系统名称
                uptime: nodeos.uptime()                                 // 计算机正常运行时间
            };
        }
    }
}());
