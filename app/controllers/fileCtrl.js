routeApp.controller('fileCtrl', ['$scope', '$interval', '$q', 'File', function($scope, $interval, $q, File) {

    ///////////////////////////////////////
    // @引入模块
    const   fs = require("fs"),
            path = require('path'),
            mmm = require('mmmagic'),
            exec = require('child_process').exec,
            Magic = mmm.Magic,
            magic = new Magic(mmm.MAGIC_MIME_TYPE),
            remote = require('electron').remote,
            dialog = require('electron').remote.dialog,
            Menu = remote.Menu,
            MenuItem = remote.MenuItem,
            iconv = require('iconv-lite');


    ///////////////////////////////////////
    // @文件右键菜单
    let rightClickPosition = null;
    var selectedIndex = 0;             // 记录此时选中的ID
    const menu = new Menu();

    // 删除文件或文件夹
    menu.append(new MenuItem({
        label: 'Delete',
        click: () => {
            let selectedElement = document.elementFromPoint(rightClickPosition.x, rightClickPosition.y).parentNode;
            let id = JSON.parse(selectedElement.attributes.id.nodeValue);
            let path = $scope.path + $scope.files[id].name;
            if($scope.files[id].isFile()){
                let buttons = ['OK', 'Cancel'];
                dialog.showMessageBox({type: 'question', title: '删除文件', buttons: buttons, message: '确认要删除吗? 此操作不可逆!'}, (index) => {
                    if(index == 0){
                        fs.unlink(path, (err) => {
                            if (err) {
                                throw err;
                            }
                            $scope.files.splice($scope.files.indexOf($scope.files[id]), 1);
                        })
                    }
                });
            }
            else {
                let buttons = ['OK', 'Cancel'];
                dialog.showMessageBox({type: 'question', title: '删除文件夹', buttons: buttons, message: '确认要删除吗? 此操作不可逆!'}, (index) => {
                    if(index == 0){
                        console.log(`rmdir ${path} /S /Q`);
                        exec(`rmdir "${path}" /S /Q`, {encoding: 'GB2312'}, (err, stdout, stderr) => {
                            if(err || iconv.decode(stderr, 'GB2312')){
                                dialog.showErrorBox(iconv.decode(stderr, 'GB2312'),  iconv.decode(stdout, 'GB2312'));
                                return;
                            }
                            $scope.files.splice($scope.files.indexOf($scope.files[id]), 1);
                        });
                    }
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

    // 粘贴文件或文件夹到里面，由于可能返回上层，当前文件列表可能变化，所以不能使用index操控
    menu.append(new MenuItem({
        label: 'Paste Into',
        click: ()=>{
            let selectedElement = document.elementFromPoint(rightClickPosition.x, rightClickPosition.y).parentNode;
            let id = JSON.parse(selectedElement.attributes.id.nodeValue);
            let buttons = ['OK', 'Cancel'];
            $scope.dist = $scope.path + $scope.files[id].name;          // 要粘贴的路径
            // 粘贴文件夹到某个文件夹里面
            if($scope.srcType == 'Folder'){
                // 具体参数配置，重名文件夹覆盖提示
                if(fs.existsSync($scope.dist + "\\\\" + $scope.srcName)){
                    dialog.showMessageBox({type: 'question', title: '重名文件夹存在', buttons: buttons, message: '重名文件夹存在，继续复制会对重名文件覆盖，是否继续?'}, index => {
                        if(index == 0){
                            exec(`xcopy "${$scope.src}" "${$scope.dist}\\\\${$scope.srcName}" /E /C /Y /H /I`, {encoding: 'GB2312'}, (err, stdout, stderr)=>{
                                if(err || iconv.decode(stderr, 'GB2312')) {
                                    dialog.showErrorBox(iconv.decode(stderr, 'GB2312'), iconv.decode(stdout, 'GB2312'));
                                    return;
                                }
                                if(iconv.decode(stdout, 'GB2312')) {
                                    dialog.showMessageBox({type: 'info', title: 'Success', message: iconv.decode(stdout, 'GB2312'), buttons: ['OK']});
                                }
                            });
                        }
                    });
                }
                else {
                    exec(`xcopy "${$scope.src}" "${$scope.dist}\\\\${$scope.srcName}" /E /C /Y /H /I`, {encoding: 'GB2312'}, (err, stdout, stderr)=>{
                        if(err || iconv.decode(stderr, 'GB2312')) {
                            dialog.showErrorBox(iconv.decode(stderr, 'GB2312'), iconv.decode(stdout, 'GB2312'));
                            return;
                        }
                        if(iconv.decode(stdout, 'GB2312')) {
                            dialog.showMessageBox({type: 'info', title: 'Success', message: iconv.decode(stdout, 'GB2312'), buttons: ['OK']});
                        }
                    });
                }

            }
            // 粘贴文件到某个文件夹里面
            else {
                if(fs.existsSync($scope.dist + "\\\\" + $scope.srcName)){           // 存在重名文件，提示覆盖
                    dialog.showMessageBox({type: 'question', title: '重名文件存在', buttons: buttons, message: '重名文件已存在，是否覆盖?'}, index => {
                        if(index == 0) {
                            exec(`copy "${$scope.src}" "${$scope.dist}" /Y`, {encoding: 'GB2312'}, (err, stdout, stderr)=>{
                                if(err || iconv.decode(stderr, 'GB2312')) {
                                    dialog.showErrorBox(iconv.decode(stderr, 'GB2312'), iconv.decode(stdout, 'GB2312'));
                                    return;
                                }
                                if(iconv.decode(stdout, 'GB2312')) {
                                    dialog.showMessageBox({type: 'info', title: 'Success', message: iconv.decode(stdout, 'GB2312'), buttons: ['OK']});
                                }
                            });
                        }
                    })
                }
                else {
                    exec(`copy "${$scope.src}" "${$scope.dist}" /Y`, {encoding: 'GB2312'}, (err, stdout, stderr)=>{
                        if(err || iconv.decode(stderr, 'GB2312')) {
                            dialog.showErrorBox(iconv.decode(stderr, 'GB2312'), iconv.decode(stdout, 'GB2312'));
                            return;
                        }
                        if(iconv.decode(stdout, 'GB2312')) {
                            dialog.showMessageBox({type: 'info', title: 'Success', message: iconv.decode(stdout, 'GB2312'), buttons: ['OK']});
                        }
                    });
                }
            }
        }
    }));

    // todo 检查paste into 问题，修复paste here问题
    // 粘贴文件或文件夹到此处  // fixme 判断文件已存在和覆盖的问题
    menu.append(new MenuItem({
        label: 'Paste Here',
        click: () => {
            // 粘贴文件夹
            let buttons = ['OK', 'Cancel'];
            console.log($scope.srcType);
            if($scope.srcType == 'Folder') {
                // 具体参数配置 fixme 重名文件夹，覆盖问题
                if($scope.src == $scope.path + $scope.srcName) {                 // 同路径下粘贴，改名创建新文件夹
                    exec(`xcopy "${$scope.src}" "${$scope.path}${$scope.srcName}-${Date.parse(new Date())}" /E /C /Y /H /I`, {encoding: 'GB2312'}, (err, stdout, stderr)=>{
                        if(err || iconv.decode(stderr, 'GB2312')) {
                            dialog.showErrorBox(iconv.decode(stderr, 'GB2312'), iconv.decode(stdout, 'GB2312'));
                            return;
                        }
                        if(iconv.decode(stdout, 'GB2312')) {
                            let promise = getFileInfo($scope.srcName + '-' + Date.parse(new Date()));           // fixme 时间戳作为重命名
                            promise.then(function(stat){
                                $scope.files.push(stat);
                            });
                            dialog.showMessageBox({type: 'info', title: 'Success', message: iconv.decode(stdout, 'GB2312'), buttons: ['OK']});
                        }
                    });
                }
                else {                                          // 不同路径下粘贴，判断是否有重名文件夹名存在
                    console.log(`${$scope.path}${$scope.srcName}`);
                    if(fs.existsSync($scope.path + $scope.srcName)) {           // 存在同名文件夹
                        dialog.showMessageBox({type: 'question', title: '重名文件夹存在', buttons: buttons, message: '重名文件夹存在，继续复制会对重名文件覆盖，是否继续?'}, index => {
                            if(index == 0) {                    // 粘贴到不同路径下，进行覆盖
                                exec(`xcopy "${$scope.src}" "${$scope.path}${$scope.srcName}" /E /C /Y /H /I`, {encoding: 'GB2312'}, (err, stdout, stderr)=>{
                                    if(err || iconv.decode(stderr, 'GB2312')) {
                                        dialog.showErrorBox(iconv.decode(stderr, 'GB2312'), iconv.decode(stdout, 'GB2312'));
                                        return;
                                    }
                                    if(iconv.decode(stdout, 'GB2312')) {
                                        dialog.showMessageBox({type: 'info', title: 'Success', message: iconv.decode(stdout, 'GB2312'), buttons: ['OK']});
                                    }
                                });
                            }
                        });
                    }
                    else {          // 不存在同名文件夹
                        exec(`xcopy "${$scope.src}" "${$scope.path}${$scope.srcName}" /E /C /Y /H /I`, {encoding: 'GB2312'}, (err, stdout, stderr)=>{
                            if(err || iconv.decode(stderr, 'GB2312')) {
                                dialog.showErrorBox(iconv.decode(stderr, 'GB2312'), iconv.decode(stdout, 'GB2312'));
                                return;
                            }
                            if(iconv.decode(stdout, 'GB2312')) {
                                let promise = getFileInfo($scope.srcName);
                                promise.then(function(stat){
                                    $scope.files.push(stat);
                                });
                                dialog.showMessageBox({type: 'info', title: 'Success', message: iconv.decode(stdout, 'GB2312'), buttons: ['OK']});
                            }
                        });
                    }
                }
            }
            // 粘贴文件 todo 以上均处理，待验证
            else {
                let promise = File.copyFile($scope.src, $scope.path + $scope.srcName);
                promise.then(function(result){
                    console.log(result);
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
