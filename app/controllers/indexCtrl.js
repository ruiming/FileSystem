routeApp.controller('indexCtrl', function($http, $scope, $interval, System){
    
    const os = require('os');
    $scope.bios = [];

    function getOS(){
        $scope.system = {
            arch: os.arch(),                                    // 处理器架构
            cpus: os.cpus(),                                    // 获取cpu信息
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

    function getCPU(){
        System.getCpuLoadPercentage(function(result){
            $scope.cpuload = result;
        });
        System.getCpuTemperature(function(result){
            $scope.cpuTemperature = result;
        })
    }

    getCPU();
    getOS();

    $interval(function(){
        getCPU();
        getOS();
    }, 1000);

    System.getBiosManufacturer(function(result){
        $scope.bios.manufacturer = result;
    });
    System.getBiosName(function(result){
        $scope.bios.name = result;
    });
    System.getCpuNumber(function(result){
        $scope.cpuCore = result;
    });
    System.getProduct(function(result){
        $scope.name = result;
    });
});
