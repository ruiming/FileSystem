routeApp.controller('fileCtrl', function($scope, $interval, $q, File, System, $timeout) {

    const   fs = require("fs"),
            path = require('path'),
            remote = require('electron').remote,
            Menu = remote.Menu,
            MenuItem = remote.MenuItem,
            watch = require('watch');
    
    $scope.path = "Computer";
    $scope.files = [];
    $scope.backwardStore = ["Computer"];         // 供后退用
    $scope.forwardStore = [];                    // 供前进用
    $scope.col = 'Name';
    $scope.desc = 0;
    $scope.disks = [];
    $scope.disk = {};
    $scope.FileTypeIcon = FileTypeIcon;
    
    let rightClickPosition = null;
    var selectedIndex = 0;
    const menu = new Menu();

    menu.append(new MenuItem({
        label: '复制',
        click() {
            let selectedElement = document.elementFromPoint(rightClickPosition.x, rightClickPosition.y).parentNode;
            let id = JSON.parse(selectedElement.attributes.id.nodeValue);
            $scope.src = $scope.files[id].path;                                 // 路径
            $scope.srcType = $scope.files[id].isFile();                         // 文件类别
            $scope.srcName = $scope.files[id].name;                             // 文件名称
        }
    }));
    menu.append(new MenuItem({
        label: '粘贴到里面',
        click() {
            let selectedElement = document.elementFromPoint(rightClickPosition.x, rightClickPosition.y).parentNode;
            let id = JSON.parse(selectedElement.attributes.id.nodeValue);
            $scope.dist = $scope.path + $scope.files[id].name;
            if(!$scope.srcType) {
                File.copyFolder($scope.src, $scope.dist + "\\\\" + $scope.srcName).then();
            }
            else {
                File.copyFile($scope.src, $scope.dist + "\\\\" + $scope.srcName).then();
            }
        }
    }));
    menu.append(new MenuItem({
        label: '粘贴到此处',
        click() {
            if(!$scope.srcType) {
                File.copyFolder($scope.src, $scope.path + $scope.srcName).then((result) => {
                    for(let i in $scope.files) {
                        if($scope.files.hasOwnProperty(i)) {
                            if ($scope.files[i].name == result.name) {
                                $scope.files[i] = result;
                                return 1;
                            }
                        }
                    }
                    return result;
                }).then((result) => {
                    if(result !== 1) {
                        $scope.files.push(result);
                    }
                })
            }
            else {
                File.copyFile($scope.src, $scope.path + $scope.srcName).then((result) => {
                    for(let i in $scope.files) {
                        if($scope.files.hasOwnProperty(i)) {
                            if ($scope.files[i].name == result.name) {
                                $scope.files[i] = result;
                                return 1;
                            }
                        }
                    }
                    return result;
                }).then((result) => {
                    if(result !== 1) {
                        $scope.files.push(result);
                    }
                })
            }
        }
    }));
    menu.append(new MenuItem({
        label: '新建',
        submenu: [
            {
                label: '文件夹',
                click() {
                    File.createNewFolder($scope.path).then((stat) => {
                        $scope.files.push(stat);
                    });
                }
            },
            {
                label: '文件',
                click() {
                    File.createNewTxt($scope.path).then((stat) => {
                        $scope.files.push(stat);
                    })
                }
            }
        ]
    }));
    menu.append(new MenuItem({
        'label': '重命名',
        click() {
            let selectedElement = document.elementFromPoint(rightClickPosition.x, rightClickPosition.y).parentNode;
            let id = JSON.parse(selectedElement.attributes.id.nodeValue);
            $scope.files[id].rename = true;
            $scope.files[id].hover = false;
            $scope.select(id);
            $scope.src = $scope.path + $scope.files[id].name;                   // 路径
            $scope.name = $scope.files[id].name;
        }
    }));
    menu.append(new MenuItem({
        label: '删除',
        click() {
            let selectedElement = document.elementFromPoint(rightClickPosition.x, rightClickPosition.y).parentNode;
            let id = JSON.parse(selectedElement.attributes.id.nodeValue);
            let src = $scope.path + $scope.files[id].name;
            if($scope.files[id].isFile()) {
                File.deleteFile(src).then(() => {
                    $scope.files.splice($scope.files.indexOf($scope.files[id]), 1)
                }, err => {
                    log(err);
                })
            }
            else {
                File.deleteFolder(src).then(() => {
                    $scope.files.splice($scope.files.indexOf($scope.files[id]), 1)
                }, err => {
                    log(err);
                })
            }
            if(path == $scope.forwardStore[$scope.forwardStore.length-1] || path + "\\\\" == $scope.forwardStore[$scope.forwardStore.length-1]) {
                $scope.forwardStore = [];
            }
        }
    }));
    
    let FILE = document.getElementById("file");
    FILE.addEventListener('contextmenu', e => {
        e.preventDefault();
        rightClickPosition = {x: e.x, y: e.y};
        let selectedElement = document.elementFromPoint(rightClickPosition.x, rightClickPosition.y).parentNode;
        let id = JSON.parse(selectedElement.attributes.id.nodeValue);
        if($scope.files[id].isFile()) {
            menu.items[1].enabled = false;
            menu.items[2].enabled = true;
        }
        else {
            menu.items[1].enabled = true;
            menu.items[2].enabled = true;
        }
        if($scope.src == undefined) {
            menu.items[1].enabled = false;
            menu.items[2].enabled = false;
        }
        menu.popup(remote.getCurrentWindow());
    }, false);

    $scope.search = wanted => {
        $scope.backwardStore.push($scope.path);
        $scope.forwardStore = [];
        File.search($scope.path, wanted).then(function(result){
            $scope.files = result;
        });
    };

    /** enter键确认重命名 */
    $scope.listenEnter = (e, index) => {
        if(e.which === 13) {
            $scope.rename(index);
        }
    };

    /** 点击文件或文件夹高亮 */
    $scope.select = index => {
        let status = $scope.files[index].hover;
        $scope.files.forEach(function(file) {
            file.hover = false;
        });
        $scope.files[index].hover = !status;
        if($scope.files[index].hover){
            getSideBar($scope.path + $scope.files[index].name);
        }
    };
    /** 点击磁盘高亮 */
    $scope.selectDisk = index => {
        let status = $scope.disks[index].hover;
        $scope.disks.forEach(disk => {
            disk.hover = false;
        });
        $scope.disks[index].hover = !status;
        if($scope.disks[index].hover){
            $scope.diskDetail = $scope.disks[index];
        }
    };

    /** 重命名 */
    $scope.rename = index => {
        $scope.files[index].rename = false;
        $scope.dist = $scope.path + $scope.files[index].name;
        File.rename($scope.src, $scope.dist).catch(() =>{
            $scope.files[index].name = $scope.name;
        });
    };

    /** 跳转至相应磁盘 */
    $scope.forward = disk => {
        $scope.path = disk + "\\\\";
        $scope.backwardStore.push($scope.path);
        readFolder();
    };

    /** 跳转至相应文件夹 */
    $scope.forward_folder = x => {
        if(x.isFile())  return;
        $scope.path = x.path + "\\\\";
        $scope.backwardStore.push($scope.path);
        $scope.forwardStore = [];
        readFolder();
    };

    /** 导航栏跳转 */
    $scope.turnto = x => {
        let currentPath = $scope.path;
        if(x == "Computer" && currentPath != "Computer") {
            $scope.home();
            return;
        }
        else if(x == "Computer" && currentPath == "Computer") {
            return;
        }
        $scope.path = "";
        for(let i=0; i<$scope.breadcrumbs.length; i++) {
            if($scope.breadcrumbs[i] != x) {
                $scope.path += $scope.breadcrumbs[i] + "\\\\";
            }
            else {
                $scope.path += $scope.breadcrumbs[i] + "\\\\";
                break;
            }
        }
        if(currentPath == $scope.path) {
            return;
        }
        $scope.backwardStore.push($scope.path);
        $scope.forwardStore = [];
        readFolder();
    };

    /** 跳到主页 */
    $scope.home = () => {
        $scope.path = "Computer";
        $scope.backwardStore.push($scope.path);
        $scope.files = [];
        getDisk();
    };

    /** 设置路径导航 */
    $scope.breadcrumb = () => {
        if($scope.path == "Computer") {
            $scope.breadcrumbs = [];
        }
        else{
            $scope.breadcrumbs = $scope.path.split("\\\\");
        }
    };

    /** 后退 */
    $scope.Hbackward = () => {
        if($scope.backwardStore == null || $scope.backwardStore.length == 1) {
            return;
        }
        $scope.forwardStore.push($scope.path);
        $scope.backwardStore.pop();
        while($scope.backwardStore[$scope.backwardStore.length-1] != "Computer" &&!fs.existsSync($scope.backwardStore[$scope.backwardStore.length-1])) {
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
    $scope.Hforward = () => {
        if($scope.forwardStore == null || $scope.forwardStore.length < 1) {
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
        File.readFolder($scope.path).then(filenames => {
            $scope.files = [];
            $scope.breadcrumb();
            filenames.map(filename => {
                File.getFileInfo($scope.path + filename).then(stat => {
                    $scope.files.push(stat);
                });
            });
        });
        fs.watch($scope.path, (event, filename) => {
            filename = filename.replace(/(\\)/, '');
            $timeout.cancel($scope.alert);
            if (filename) {
                $scope.checked = true;
                $scope.message = `${event}: ${filename}`;
                $scope.alert = $timeout(()=>{
                    $scope.checked = false;
                }, 3000)
            } else {
                $scope.checked = true;
                $scope.message = '${event}: ${filename}';
                $scope.alert = $timeout(()=>{
                    $scope.checked = false;
                }, 3000)
            }
        });
        getSideBar($scope.path.slice(0, $scope.path.length-2));
    }

    function getSideBar(src) {
        File.getFileInfo(src).then(stat => {
            $scope.last = stat;
        });
        File.readFile(src).then(content => {
            $scope.content = content;
        }, err => {
            $scope.content = '';
        })
    }

    /** 获取固定磁盘分区信息 */
    function getDisk() {
        $scope.breadcrumb();
        let promise = System.getDisk();
        promise.then(disks => {
            $scope.disks = disks;
        }, err => {
            log(err);
        })
    }
    /** 获取硬盘信息 */
    System.getDiskDrive().then(result => {
        $scope.diskdrive = result;
    });

    getDisk();

});
