routeApp.controller('indexCtrl', ['$http', '$scope', '$interval', function($http, $scope, $interval){
    var os = require('os');
    exec = require('child_process').exec;
    $interval(function() {
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
            uptime: os.uptime(),                                // 计算机正常运行时间
            username: os.userInfo().username
        };
    }, 1000);                                                   // 每隔1秒自动重新获取

    // 获取windows CPU使用率和CPU温度
    $interval(function(){
        exec('wmic cpu get loadpercentage', function(err, stdout, stderr) {
            if(err || stderr){
                console.log("error: " + err + stderr);
                return;
            }
            $scope.cpuload = parseInt(stdout.replace(/(LoadPercentage)/, '').trim());
        });
        exec('wmic /namespace:\\\\root\\WMI path MSAcpi_ThermalZoneTemperature GET CriticalTripPoint,CurrentTemperature', function(err, stdout, stderr) {
            if(err || stderr){
               console.log("error: " + err + stderr);
                   return;
            }
            var out = stdout.replace(/(CriticalTripPoint)|(CurrentTemperature)/g, '').replace(/(\s+)/g, '#').trim().split('#');
            out.pop();
            out.shift();
            $scope.cpuTemperature = out;
        })
    }, 1000);

    // 获取BIOS制造商和版本
    $scope.bios = [];
    (function(){
        exec('wmic bios get Manufacturer', function(err, stdout, stderr) {
            if(err || stderr){
                console.log("error: " + err + stderr);
                return;
            }
            $scope.bios.manufacturer = stdout.replace(/(Manufacturer)|(s+)/g, '').replace(/(\s+)/g, '').trim();
        });
        exec('wmic bios get Name', function(err, stdout, stderr) {
            if(err || stderr){
                console.log("error: " + err + stderr);
                return;
            }
            $scope.bios.name = stdout.replace(/(Name)|(s+)/g, '').replace(/(\s+)/g, '').trim();
        })
    })();
}]);