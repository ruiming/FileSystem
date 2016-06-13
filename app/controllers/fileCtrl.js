routeApp.controller('fileCtrl', ['$scope', '$interval', function($scope, $interval){
    var fs = require("fs");
    $scope._index = true;
    $scope.path = null;
    $scope.history = ["index"];

    getDisk();

    // 跳进相应磁盘
    $scope.forward = function(disk) {
        $scope._index = false;
        $scope.path = disk + "\\\\";
        $scope.read_folder(1);
    };

    // 跳进相应文件夹
    $scope.forward_folder = function(path) {
        $scope.path += path + "\\\\";
        $scope.read_folder(1);
    };

    // 后退
    $scope.backward = function() {
        $scope.history.pop();
        $scope.path = $scope.history[$scope.history.length - 1];
        if($scope.path == "index") {
            $scope.files = null;
            getDisk();
            $scope._index = true;
        }
        else {
            $scope.read_folder(-1);
        }
    };

    // 读取路径下的所有文件
    $scope.read_folder = function(id){
        fs.readdir($scope.path,function(err, files){
            if (err) {
                return console.error(err);
            }
            else {
                if (id === 1)   $scope.history.push($scope.path);
                $scope.files = files;
            }
        });
    };







    exec = require('child_process').exec;

    $scope.disks = [];
    $scope.disk = {};

    // 获取固定分区盘符和基本信息
    function getDisk(){
        exec('wmic logicaldisk where "drivetype=3" get name,filesystem,freespace,size', function(err, stdout, stderr) {
            if(err || stderr){
                console.log("error: " + err + stderr);
                return;
            }
            $scope.diskStr = stdout.replace(/(FileSystem)|(FreeSpace)|(Name)|(Size)/g, '').replace(/(\s+)/g, '#').trim().split('#');
            $scope.diskStr.pop();
            $scope.diskStr.shift();
            $scope.disks = [];
            for(var i in $scope.diskStr){
                if($scope.diskStr.hasOwnProperty(i)){
                    if(i%4 == 0){
                        $scope.disk.FileSystem = $scope.diskStr[i];
                    }
                    else if(i%4 == 1){
                        $scope.disk.FreeSpace = $scope.diskStr[i];
                    }
                    else if(i%4 == 2){
                        $scope.disk.Name = $scope.diskStr[i];
                    }
                    else if(i%4 == 3){
                        $scope.disk.Size = $scope.diskStr[i];
                        $scope.disks.push($scope.disk);
                        $scope.disk = {};
                    }
                }
            }
        })};

}]);
