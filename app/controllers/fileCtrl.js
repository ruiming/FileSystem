routeApp.controller('fileCtrl', ['$scope', '$interval', function($scope, $interval){
    var fs = require("fs");
    $scope.file = [];
    fs.readdir("/",function(err, files){
        if (err) {
            return console.error(err);
        }
        files.forEach( function (file){
            $scope.file.push(file);
        });
    });
    exec = require('child_process').exec;

    $scope.disks = [];
    $scope.disk = {};
    // 获取固定分区盘符和基本信息
    //$interval(
    (function(stdout){
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
        })})();
    //}, 1000);

}]);
