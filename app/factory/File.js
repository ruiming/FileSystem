/**
 * File Factory
 * 提供Windows下文件或文件夹的一些操作
 */
routeApp.factory('File', ($q) => {
    const   fs = require("fs"),
            path = require('path'),
            exec = require('child_process').exec,
            dialog = require('electron').remote.dialog,
            iconv = require('iconv-lite');
    const   buttons = ['OK', 'Cancel'];

    /**
     * 生成一个文件副本路径
     * @param to 目的路径
     * @returns {string}
     */
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
    
    /**
     * 生成一个目录副本路径
     * @param to
     * @returns {string}
     */
    function duplicateFolder(to) {
        for(let i of range(1,100)){
            if(!fs.existsSync(to + '[' + i + ']')) {
                return to + '[' + i + ']';
            }
        }
    }
    
    /**
     * 粘贴文件
     * @param src   源路径
     * @param dist  目的路径
     * @returns {*}
     */
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
    
    /**
     * 粘贴文件夹
     * @param src   源路径
     * @param dist  目的路径
     * @returns {*}
     */
    function copyFolder(src, dist) {
        return $q(function(resolve, reject) {
            if(src == dist) {
                let promise = xcopy(src, duplicateFolder(dist));
                promise.then(function(result){
                    resolve(result);
                }, function(err){
                    reject(err);
                });
            }
            else {
                if(fs.existsSync(dist)){
                    let title = '重名文件夹存在';
                    let message = '重名文件夹存在，继续粘贴将覆盖，是否继续?';
                    dialog.showMessageBox({type: 'question', title: title, buttons: buttons, message: message}, index => {
                        if(index == 0) {
                            let promise = xcopy(src, dist);
                            promise.then(function(result){
                                resolve(result);
                            }, function(err){
                                reject(err);
                            });
                        }
                        else {
                            resolve();
                        }
                    })
                }
                else {
                    let promise = xcopy(src, dist);
                    promise.then(function(result){
                        resolve(result);
                    }, function(err){
                        reject(err);
                    });
                }
            }
        })
    }

    /**
     * 删除文件
     * @param src
     * @returns {*}
     */
    function deleteFile(src) {
        let buttons = ['OK', 'Cancel'];
        let title = '删除文件';
        let message = '确认要删除吗? 此操作不可逆!';
        return $q(function(resolve, reject){
            dialog.showMessageBox({type: 'question', title: title, buttons: buttons, message: message}, index => {
                if(index == 0){
                    fs.unlink(src, (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    })
                }
                resolve();
            });
        });
    }

    /**
     * 删除文件夹
     * @param src   路径
     * @returns {*}
     */
    function deleteFolder(src) {
        let buttons = ['OK', 'Cancel'];
        let title = '删除文件夹';
        let message = '确认要删除吗? 此操作不可逆!';
        return $q(function(resolve, reject){
            dialog.showMessageBox({type: 'question', title: title, buttons: buttons, message: message}, index => {
                if(index == 0){
                    exec(`rmdir "${src}" /S /Q`, {encoding: 'GB2312'}, (err, stdout, stderr) => {
                        if(err || iconv.decode(stderr, 'GB2312')){
                            dialog.showErrorBox(iconv.decode(stderr, 'GB2312'),  iconv.decode(stdout, 'GB2312'));
                            reject(iconv.decode(stderr, 'GB2312'));
                        }
                        else {
                            resolve();
                        }
                    });
                }
            });
        });
    }
    
    /**
     * 调用xcopy来拷贝文件夹
     * @param src   源路径
     * @param dist  目的路径
     * @returns {*}
     */
    function xcopy(src, dist) {
        return $q(function(resolve, reject) {
            exec(`xcopy "${src}" "${dist}" /E /C /Y /H /I`, {encoding: 'GB2312'}, (err, stdout, stderr)=>{
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

    /**
     * 调用copy来拷贝文件
     * @param src   源路径
     * @param dist  目的路径
     * @returns {*}
     */
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

    /**
     * 获取文件或文件夹的信息
     * @param src  文件或文件夹的路径
     * @returns {*}
     */
    function getFileInfo(src) {
        return $q(function(resolve, reject) {
            fs.stat(src, function(err, stat){
                if(err){
                    reject(err);
                }
                else {
                    let temp = src.split('\\\\');
                    let type = 'unknown';
                    let seq = temp[temp.length-1].split('.');
                    let mime = seq[seq.length - 1];
                    stat.name = temp[temp.length-1];
                    if(stat.isDirectory()){
                        type = 'folder'
                    }
                    else if(FileTypeIcon.hasOwnProperty(mime)){
                        type = mime;
                    }
                    stat.type = FileTypeIcon[type].type;
                    stat.src = FileTypeIcon[type].src;
                    resolve(stat);
                }
            });
        });
    }

    /**
     * 读取文件夹列表
     * @param src
     * @returns {*}
     */
    function readFolder(src) {
        return $q(function(resolve, reject){
            fs.readdir(src, function(err, files){
                if(err) {
                    reject(err);
                }
                else {
                    resolve(files);
                }
            })
        })
    }

    /**
     * 生成可遍历的连续数字
     * @param start
     * @param count
     * @returns {*|Array|{}}
     */
    function range(start, count) {
        return Array.apply(0, Array(count))
            .map(function (element, index) {
                return index + start;
            });
    }

    return {
        copyFile: copyFile,
        copyFolder: copyFolder,
        deleteFile: deleteFile,
        deleteFolder: deleteFolder,
        readFolder: readFolder,
        getFileInfo: getFileInfo
    };

});