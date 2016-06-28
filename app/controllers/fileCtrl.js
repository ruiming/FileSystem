routeApp.controller('fileCtrl', function($scope, $interval, $q, File, System) {

    const   fs = require("fs"),
            path = require('path'),
            remote = require('electron').remote,
            Menu = remote.Menu,
            MenuItem = remote.MenuItem;
    
    $scope.path = "Computer";
    $scope.files = [];
    $scope.backwardStore = ["Computer"];         // 供后退用
    $scope.forwardStore = [];                    // 供前进用
    $scope.col = 'Name';
    $scope.desc = 0;
    $scope.disks = [];
    $scope.disk = {};
    
    let rightClickPosition = null;
    var selectedIndex = 0;
    const menu = new Menu();
    
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
            if(path == $scope.forwardStore[$scope.forwardStore.length-1] || path + "\\\\" == $scope.forwardStore[$scope.forwardStore.length-1]){
                $scope.forwardStore = [];
            }
        }
    }));
    menu.append(new MenuItem({
        label: 'Copy',
        click: ()=>{
            let selectedElement = document.elementFromPoint(rightClickPosition.x, rightClickPosition.y).parentNode;
            let id = JSON.parse(selectedElement.attributes.id.nodeValue);
            $scope.src = $scope.path + $scope.files[id].name;                   // 路径
            $scope.srcType = $scope.files[id].isFile();                             // 文件类别
            $scope.srcName = $scope.files[id].name;                             // 文件名称
            selectedIndex = id;                                                 // 选中的列表ID
        }
    }));
    menu.append(new MenuItem({
        label: 'Paste Into',
        click: ()=>{
            let selectedElement = document.elementFromPoint(rightClickPosition.x, rightClickPosition.y).parentNode;
            let id = JSON.parse(selectedElement.attributes.id.nodeValue);
            $scope.dist = $scope.path + $scope.files[id].name;
            if(!$scope.srcType) {
                let promise = File.copyFolder($scope.src, $scope.dist + "\\\\" + $scope.srcName);
                promise.then();
            }
            else {
                let promise = File.copyFile($scope.src, $scope.dist);
                promise.then();
            }
        }
    }));
    menu.append(new MenuItem({
        label: 'Paste Here',
        click: () => {
            if(!$scope.srcType) {
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
    menu.append(new MenuItem({
        'label': 'Rename',
        click: ()=>{
            let selectedElement = document.elementFromPoint(rightClickPosition.x, rightClickPosition.y).parentNode;
            let id = JSON.parse(selectedElement.attributes.id.nodeValue);
            $scope.files[id].rename = true;
            $scope.select(id);
            $scope.src = $scope.path + $scope.files[id].name;                   // 路径
            $scope.name = $scope.files[id].name;
        }
    }));
    let FILE = document.getElementById("file");
    FILE.addEventListener('contextmenu', e => {
        e.preventDefault();
        rightClickPosition = {x: e.x, y: e.y};
        menu.popup(remote.getCurrentWindow())
    }, false);

    /** enter键确认重命名 */
    $scope.listenEnter = function(e, index) {
        if(e.which === 13){
            $scope.rename(index);
        }
    };

    /** 点击高亮 */
    $scope.select = function(index) {
        let status = $scope.files[index].hover;
        $scope.files.forEach(function(file){
            file.hover = false;
        });
        $scope.files[index].hover = !status
    };

    /** 重命名 */
    $scope.rename = function(index) {
        $scope.files[index].rename = false;
        $scope.dist = $scope.path + $scope.files[index].name;
        File.rename($scope.src, $scope.dist).catch(function(){
            $scope.files[index].name = $scope.name;
        });
    };

    /** 跳转至相应磁盘 */
    $scope.forward = function(disk) {
        $scope.path = disk + "\\\\";
        $scope.backwardStore.push($scope.path);
        readFolder();
    };

    /** 跳转至相应文件夹 */
    $scope.forward_folder = function(x) {
        if(x.isFile())  return;
        $scope.path += x.name + "\\\\";
        $scope.backwardStore.push($scope.path);
        $scope.forwardStore = [];
        readFolder();
    };

    /** 导航栏跳转 */
    $scope.turnto = function(x) {
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
        $scope.backwardStore.push($scope.path);
        $scope.forwardStore = [];
        readFolder();
    };

    /** 跳到主页 */
    $scope.home = function() {
        $scope.path = "Computer";
        $scope.backwardStore.push($scope.path);
        $scope.files = [];
        getDisk();
    };

    /** 设置路径导航 */
    $scope.breadcrumb = function() {
        if($scope.path == "Computer"){
            $scope.breadcrumbs = [];
        }
        else{
            $scope.breadcrumbs = $scope.path.split("\\\\");
        }
    };

    /** 后退 */
    $scope.Hbackward = function() {
        if($scope.backwardStore == null || $scope.backwardStore.length == 1){
            return;
        }
        $scope.forwardStore.push($scope.path);
        $scope.backwardStore.pop();
        while($scope.backwardStore[$scope.backwardStore.length-1] != "Computer" &&!fs.existsSync($scope.backwardStore[$scope.backwardStore.length-1])){
            $scope.backwardStore.pop();
        }
        $scope.path = $scope.backwardStore[$scope.backwardStore.length - 1];
        $scope.files = [];
        if($scope.path == "Computer") {
            $scope.filename = null;
            getDisk();
        }
        else {
            readFolder();
        }
    };

    /** 前进 */
    $scope.Hforward = function() {
        if($scope.forwardStore == null || $scope.forwardStore.length < 1){
            return;
        }
        $scope.path = $scope.forwardStore[$scope.forwardStore.length - 1];
        $scope.backwardStore.push($scope.path);
        $scope.forwardStore.pop();
        if($scope.path == "Computer") {
            $scope.filename = null;
            getDisk();
        }
        else {
            readFolder();
        }
    };

    /** 获取目录里面的文件列表 */
    function readFolder() {
        let promise = File.readFolder($scope.path);
        promise.then(function(filenames){
            $scope.files = [];
            $scope.breadcrumb();
            filenames.map(filename => {
                let promise = File.getFileInfo($scope.path + filename);
                promise.then(function(stat){
                    $scope.files.push(stat);
                })
            });
        })
    }

    /** 获取固定磁盘分区信息 */
    function getDisk(){
        $scope.breadcrumb();
        let promise = System.getDisk();
        promise.then(function(disks){
            $scope.disks = disks;
        }, function(err){
            console.log(err);
        })
    }

    getDisk();

});
