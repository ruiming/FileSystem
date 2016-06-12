routeApp.controller('fileCtrl', ['$scope', function($scope){
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

    // Win32 API测试
    


    // 获取Windows的盘符
    function showLetter(callback) {
        exec('wmic LOGICALDISK get name, filesystem, size, freespace', function(err, stdout, stderr) {
            if(err || stderr) {
                console.log("root path open failed" + err + stderr);
                return;
            }
            callback(stdout);
        })
    }
    showLetter(function(stdout){
        $scope.disk = [];
        var letter = stdout.replace(/(FileSystem)|(FreeSpace)|(Name)|(Size)|(:)/g, '').replace(/(\s+)/g, '#').trim().split('#');
        console.log(letter);
    });
}]);
