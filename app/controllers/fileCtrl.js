routeApp.controller('fileCtrl', ['$scope', '$interval', function($scope, $interval){
    var fs = require("fs"),
        path = require('path');
    $scope._index = true;
    $scope.path = null;
    $scope.files = [];
    $scope.history = ["index"];     // 记录访问的页面，默认在index页面
    $scope.temp = [];               // 保存后退记录
    $scope.col = 'Name';
    $scope.desc = 0;

    getDisk();

    // 跳进相应磁盘
    $scope.forward = function(disk) {
        $scope.path = disk + "\\\\";
        $scope.history.push($scope.path);        // 每次跳转前记录要访问的路径
        $scope._index = false;
        $scope.read_folder();
    };

    // 跳进相应文件夹
    $scope.forward_folder = function(path) {
        $scope.path += path + "\\\\";
        $scope.history.push($scope.path);   // 每次跳转前记录要访问的路径
        $scope.temp = [];                   // 点击进入文件夹会破坏后退记录
        $scope.read_folder();
    };

    // 跳到主页
    $scope.home = function() {
        $scope.path = "index";
        $scope.history.push($scope.path);        // 每次跳转前记录要访问的路径
        console.log($scope.history);
        $scope._index = true;
        $scope.files = [];
        getDisk();
    };

    // 后退
    $scope.Hbackward = function() {
        if($scope.history == null || $scope.history.length == 1){
            return;
        }
        $scope.temp.push($scope.path);          // 记录当前的路径
        $scope.history.pop();                   // 从历史记录中移除目前路径
        $scope.path = $scope.history[$scope.history.length - 1];          // 取出要后退到的路径
        $scope.files = [];
        if($scope.path == "index") {
            $scope.filename = null;
            getDisk();
            $scope._index = true;
        }
        else {
            $scope.read_folder();
            $scope._index = false;
        }
    };

    // 前进
    $scope.Hforward = function(){
        if($scope.temp == null || $scope.temp.length < 1){
            return;
        }
        $scope.path = $scope.temp[$scope.temp.length - 1];  // 获取前进的路径
        $scope.history.push($scope.path);                   // 每次跳转前记录要访问的路径
        $scope.temp.pop();                                  // 前进记录出栈
        if($scope.path == "index") {
            $scope.filename = null;
            getDisk();
            $scope._index = true;
        }
        else {
            $scope.read_folder();
            $scope._index = false;
        }
    };

    // 读取路径下的所有文件
    $scope.read_folder = function(){
        fs.readdir($scope.path,function(err, files){
            if (err) {
                console.error(err);
            }
            else {
                $scope.filename = files;
                $scope.files = [];
                for(var i in $scope.filename){
                    if($scope.filename.hasOwnProperty(i)){         // fixme 改成异步方式
                        try{
                            $scope.file = fs.statSync($scope.path + "////" + $scope.filename[i]);
                        }catch(err){
                            continue;
                        }
                        $scope.file.name = $scope.filename[i];
                        $scope.files.push($scope.file);
                    }
                }
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
        })}

}]);
