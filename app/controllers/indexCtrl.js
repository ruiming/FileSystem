routeApp.controller('indexCtrl', function($http, $scope, $interval, System){
    
    const os = require('os');
    $scope.bios = [];

    function getOS(){
        $scope.system = {
            arch: os.arch(),                                    // 处理器架构
            endianness: os.endianness(),                        // 字节顺序 高位优先返回BE,低位优先的返回LE
            freemen: os.freemem(),                              // 空闲内存字节
            totalmem: os.totalmem(),                            // 系统总内存
            homedir: os.homedir(),                              // 当前登录用户的根目录
            hostname: os.hostname(),                            // 操作系统主机名
            platform: os.platform(),                            // 操作系统类型
            release: os.release(),                              // 操作系统版本
            type: os.type(),                                    // 操作系统名称
            uptime: os.uptime()                                 // 计算机正常运行时间
        };
    }
    getOS();
    $interval(function(){
        getOS();
        System.getCpu().then(result => {
            $scope.cpu = result;
        });
    }, 1000);

    System.getCpu().then(result => {
        $scope.cpu = result;
    });
    System.getBios().then(result => {
        $scope.bios = result;
    });
    System.getBaseboard().then(result => {
        $scope.baseboard = result;
    });
    System.getOs().then(result => {
        $scope.os = result;
    });
    System.getMemorychip().then(result => {
        $scope.memorychip = result;
    })
});
