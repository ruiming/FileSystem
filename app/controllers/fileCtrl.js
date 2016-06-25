routeApp.controller('fileCtrl', ['$scope', '$interval', '$q', 'File', function($scope, $interval, $q, File) {

    const   fs = require("fs"),
            path = require('path'),
            mmm = require('mmmagic'),
            exec = require('child_process').exec,
            Magic = mmm.Magic,
            magic = new Magic(mmm.MAGIC_MIME_TYPE),
            remote = require('electron').remote,
            Menu = remote.Menu,
            MenuItem = remote.MenuItem,
            iconv = require('iconv-lite');
    
    let rightClickPosition = null;
    var selectedIndex = 0;             // 记录此时选中的ID
    const menu = new Menu();

    // 删除文件或文件夹
    menu.append(new MenuItem({
        label: 'Delete',
        click: () => {
            let selectedElement = document.elementFromPoint(rightClickPosition.x, rightClickPosition.y).parentNode;
            let id = JSON.parse(selectedElement.attributes.id.nodeValue);
            let src = $scope.path + $scope.files[id].name;
            if($scope.files[id].isFile()){
                let promise = File.deleteFile(src);
                promise.then(function(){
                    $scope.files.splice($scope.files.indexOf($scope.files[id]), 1)
                }, function(err){
                    console.log(err);
                })
            }
            else {
               let promise = File.deleteFolder(src);
                promise.then(function(){
                    $scope.files.splice($scope.files.indexOf($scope.files[id]), 1)
                }, function(err){
                    console.log(err);
                })
            }
            if(path == $scope.temp[$scope.temp.length-1] || path + "\\\\" == $scope.temp[$scope.temp.length-1]){
                $scope.temp = [];
            }
        }
    }));

    // 复制文件或文件夹
    menu.append(new MenuItem({
        label: 'Copy',
        click: ()=>{
            let selectedElement = document.elementFromPoint(rightClickPosition.x, rightClickPosition.y).parentNode;
            let id = JSON.parse(selectedElement.attributes.id.nodeValue);
            $scope.src = $scope.path + $scope.files[id].name;                   // 路径
            $scope.srcType = $scope.files[id].type;                             // 文件类别
            $scope.srcName = $scope.files[id].name;                             // 文件名称
            selectedIndex = id;                                                 // 选中的列表ID
        }
    }));

    // 粘贴文件或文件夹到里面
    menu.append(new MenuItem({
        label: 'Paste Into',
        click: ()=>{
            let selectedElement = document.elementFromPoint(rightClickPosition.x, rightClickPosition.y).parentNode;
            let id = JSON.parse(selectedElement.attributes.id.nodeValue);
            $scope.dist = $scope.path + $scope.files[id].name;
            if($scope.srcType == 'Folder') {
                let promise = File.copyFolder($scope.src, $scope.dist + "\\\\" + $scope.srcName);
                promise.then();
            }
            else {
                let promise = File.copyFile($scope.src, $scope.dist);
                promise.then();
            }
        }
    }));

    // 粘贴文件或文件夹到此处
    menu.append(new MenuItem({
        label: 'Paste Here',
        click: () => {
            if($scope.srcType == 'Folder') {
                let promise = File.copyFolder($scope.src, $scope.path + $scope.srcName);
                promise.then(function(result){
                    for(let i in $scope.files) {
                        if($scope.files.hasOwnProperty(i)){
                            if ($scope.files[i].name == result.name) {
                                $scope.files[i] = result;
                                return 1;
                            }
                        }
                    }
                    return result;
                }).then(function(result){
                    if(result !== 1) {
                        $scope.files.push(result);
                    }
                })
            }
            else {
                let promise = File.copyFile($scope.src, $scope.path + $scope.srcName);
                promise.then(function(result){
                    for(let i in $scope.files) {
                        if($scope.files.hasOwnProperty(i)){
                            if ($scope.files[i].name == result.name) {
                                $scope.files[i] = result;
                                return 1;
                            }
                        }
                    }
                    return result;
                }).then(function(result){
                    if(result !== 1) {
                        $scope.files.push(result);
                    }
                })
            }
        }
    }));

    let FILE = document.getElementById("file");
    FILE.addEventListener('contextmenu', e => {
        e.preventDefault();
        rightClickPosition = {x: e.x, y: e.y};
        menu.popup(remote.getCurrentWindow())
    }, false);

    ///////////////////////////////////////
    // @全局变量
    $scope._index = true;
    $scope.path = "Computer";
    $scope.files = [];
    $scope.history = ["Computer"];       // 记录访问的页面，默认在Computer页面
    $scope.temp = [];                    // 保存后退记录
    $scope.col = 'Name';
    $scope.desc = 0;

    ///////////////////////////////////////
    // @功能函数
    // 跳进相应磁盘
    $scope.forward = (disk) => {
        $scope.path = disk + "\\\\";
        $scope.history.push($scope.path);        // 每次跳转前记录要访问的路径
        $scope._index = false;
        $scope.read_folder();
    };

    // 跳进相应文件夹
    $scope.forward_folder = (x) => {
        if(x.isFile())  return;                 // 若是文件，则直接返回
        $scope.path += x.name + "\\\\";
        $scope.history.push($scope.path);       // 每次跳转前记录要访问的路径
        $scope.temp = [];                       // 点击进入文件夹会破坏后退记录
        $scope.read_folder();
    };

    // 导航栏跳转
    $scope.turnto = (x) => {
        let currentPath = $scope.path;
        if(x == "Computer" && currentPath != "Computer") {
            $scope.home();
            return;
        }
        else if(x == "Computer" && currentPath == "Computer") {
            return;
        }
        $scope.path = "";
        for(let i=0; i<$scope.breadcrumbs.length; i++){
            if($scope.breadcrumbs[i] != x){
                $scope.path += $scope.breadcrumbs[i] + "\\\\";
            }
            else {
                $scope.path += $scope.breadcrumbs[i] + "\\\\";
                break;
            }
        }
        if(currentPath == $scope.path){
            return;
        }
        $scope.history.push($scope.path);
        $scope.temp = [];
        $scope.read_folder();
    };

    // 跳到主页
    $scope.home = () => {
        $scope.path = "Computer";
        $scope.history.push($scope.path);        // 每次跳转前记录要访问的路径
        $scope._index = true;
        $scope.files = [];
        getDisk();
    };

    // 设置路径导航
    $scope.breadcrumb = () => {
        if($scope.path == "Computer"){
            $scope.breadcrumbs = [];
        }
        else{
            $scope.breadcrumbs = $scope.path.split("\\\\");
        }
    };

    // 后退
    $scope.Hbackward = () => {
        if($scope.history == null || $scope.history.length == 1){
            return;
        }
        $scope.temp.push($scope.path);                                      // 记录当前的路径
        $scope.history.pop();                                               // 从历史记录中移除目前路径
        while($scope.history[$scope.history.length-1] != "Computer" &&!fs.existsSync($scope.history[$scope.history.length-1])){
            $scope.history.pop();
        }
        $scope.path = $scope.history[$scope.history.length - 1];            // 取出要后退到的路径
        $scope.files = [];
        if($scope.path == "Computer") {
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
    $scope.Hforward = () => {
        if($scope.temp == null || $scope.temp.length < 1){
            return;
        }
        $scope.path = $scope.temp[$scope.temp.length - 1];  // 获取前进的路径
        $scope.history.push($scope.path);                   // 每次跳转前记录要访问的路径
        $scope.temp.pop();                                  // 前进记录出栈
        if($scope.path == "Computer") {
            $scope.filename = null;
            getDisk();
            $scope._index = true;
        }
        else {
            $scope.read_folder();
            $scope._index = false;
        }
    };

    function getFileInfo(filename) {
        return $q(function(resolve, reject) {
            let path = $scope.path + "////" + filename;
            fs.stat(path, function(err, stat){
                if(err){
                    reject(err);
                }
                else {
                    stat.name = filename;
                    resolve(getFileType(stat));
                }
            });
        });
    }

    function getFileType(stat) {
        return $q(function(resolve, reject) {
            let path = $scope.path + "////" + stat.name;
            magic.detectFile(path, function(err, result) {
                if (err){
                    stat.type = "Folder";
                    resolve(stat);
                }
                else {
                    stat.type = result;
                    resolve(stat);
                }
            });
        })
    }

    // 异步读取路径下的所有文件并获取文件信息
    $scope.read_folder = () => {
        fs.readdir($scope.path,function(err, files){
            if (err) {
                console.log(err);
            }
            else {
                $scope.filenames = files;
                $scope.files = [];
                $scope.breadcrumb();
                // fixme 读取文件过慢
                $scope.filenames.map((filename) => {
                    let promise = getFileInfo(filename);
                    promise.then(function(stat){
                        $scope.files.push(stat);
                    });
                });
            }
        });
    };

    // 获取固定分区盘符和基本信息
    function getDisk(){
        $scope.breadcrumb();
        exec('wmic logicaldisk where "drivetype=3" get name,filesystem,freespace,size', (err, stdout, stderr) => {
            if(err || stderr){
                console.log("error: " + err + stderr);
                return;
            }
            $scope.diskStr = stdout.replace(/(FileSystem)|(FreeSpace)|(Name)|(Size)/g, '').replace(/(\s+)/g, '#').trim().split('#');
            $scope.diskStr.pop();
            $scope.diskStr.shift();
            $scope.disks = [];
            for(let i in $scope.diskStr){
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

    ///////////////////////////////////////
    // @初始执行
    $scope.disks = [];
    $scope.disk = {};
    getDisk();

}]);
