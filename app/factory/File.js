routeApp.factory('File', ($q) => {

    // 文件操作函数封装
    // src  是要拷贝的文件的具体路径（包含文件名）
    // dist 是要粘贴的具体路径（包含文件名）

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

    let buttons = ['OK', 'Cancel'];

    // 副本添加后缀
    function duplicate(to) {
        let dist = to.split('.');
        let origin = dist[dist.length-2];
        for(let i of range(1, 100)){
            dist[dist.length - 2] = origin;
            dist[dist.length - 2] += '[' + i + ']';
            let checkDist = dist.join('.');
            if(!fs.existsSync(checkDist)){
                return checkDist;
            }
        }
    }

    // 复制粘贴文件
    function copyFile(src, dist) {
        return $q(function(resolve, reject) {
            if(src == dist) {
                let promise = copy(src, duplicate(dist));
                promise.then(function(result){
                    resolve(result);
                }, function(err){
                    reject(err);
                })
            }
            else {
                if(fs.existsSync(dist)){
                    let title = '重名文件存在';
                    let message = '重名文件存在，继续粘贴将覆盖，是否继续?';
                    dialog.showMessageBox({type: 'question', title: title, buttons: buttons, message: message}, index => {
                        let promise = copy(src, dist);
                        promise.then(function(result){
                            resolve(result);
                        }, function(err){
                            reject(err);
                        });
                    })
                }
                else {
                    let promise = copy(src, dist);
                    promise.then(function(result){
                        resolve(result);
                    }, function(err){
                        reject(err);
                    });
                }
            }
        })
    }

    // 执行拷贝文件
    function copy(src, dist) {
        return $q(function(resolve, reject) {
            exec(`copy "${src}" "${dist}" /Y`, {encoding: 'GB2312'}, (err, stdout, stderr)=>{
                if(err || iconv.decode(stderr, 'GB2312')) {
                    dialog.showErrorBox(iconv.decode(stderr, 'GB2312'), iconv.decode(stdout, 'GB2312'));
                    reject(iconv.decode(stderr, 'GB2312'));
                }
                else {
                    dialog.showMessageBox({type: 'info', title: 'Success', message: iconv.decode(stdout, 'GB2312'), buttons: ['OK']});
                    let promise = getFileInfo(dist);
                    promise.then(function(stat){
                        resolve(stat);
                    });
                }
            });
        })
    }

    // 获取文件信息
    function getFileInfo(dist) {
        return $q(function(resolve, reject) {
            fs.stat(dist, function(err, stat){
                if(err){
                    reject(err);
                }
                else {
                    let temp = dist.split('\\\\');
                    stat.name = temp[temp.length-1];
                    resolve(stat);
                }
            });
        });
    }

    // 辅助函数
    function range(start, count) {
        return Array.apply(0, Array(count))
            .map(function (element, index) {
                return index + start;
            });
    }

    return {
        copyFile: copyFile
    };

});