routeApp.controller('indexCtrl', function($http, $scope, $interval){
    
    const os = require('os');
    const wmic = require('node-wmic');
    $scope.bios = [];

    function getOS(){
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
    getOS();
    $interval(function(){
        getOS();
        wmic.cpu().then(result => {
            $scope.cpu = result;
        });
    }, 1000);

    wmic.cpu().then(result => {
        $scope.cpu = result;
    });
    wmic.bios().then(result => {
        $scope.bios = result;
    });
    wmic.baseboard().then(result => {
        $scope.baseboard = result;
    });
    wmic.os().then(result => {
        $scope.os = result;
    });
    wmic.memorychip().then(result => {
        $scope.memorychip = result;
    })
});
