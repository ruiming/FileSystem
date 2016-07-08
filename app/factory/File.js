/**
 * File Factory
 * 提供Windows下文件或文件夹的一些操作
 */
routeApp.factory('File', $q => {
    const   fs = require("fs"),
            path = require('path'),
            exec = require('child_process').exec,
            dialog = require('electron').remote.dialog,
            base64Img = require('base64-img'),
            iconv = require('iconv-lite');
    const   buttons = ['OK', 'Cancel'];
    /**
     * 生成一个文件副本路径
     * @param to 目的路径
     * @returns {string}
     */
    function duplicate(to) {
        if(!fs.existsSync(to)) {
            return to;
        }
        let dist = to.split('.');
        let origin = dist[dist.length-2];
        for(let i of range(1, 100)) {
            dist[dist.length - 2] = origin;
            dist[dist.length - 2] += '[' + i + ']';
            let checkDist = dist.join('.');
            if(!fs.existsSync(checkDist)) {
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
        if(!fs.existsSync(to)) {
            return to;
        }
        for(let i of range(1,100)) {
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
        return $q((resolve, reject) => {
            if(src == dist) {
                copy(src, duplicate(dist)).then(result => {
                    resolve(result);
                }, err => {
                    reject(err);
                });
            }
            else {
                if(fs.existsSync(dist)) {
                    let title = '重名文件存在';
                    let message = '重名文件存在，继续粘贴将覆盖，是否继续?';
                    dialog.showMessageBox({type: 'question', title: title, buttons: buttons, message: message}, index => {
                        if(index == 0) {
                            copy(src, dist).then(result => {
                                resolve(result);
                            }, err => {
                                reject(err);
                            });
                        }
                    })
                }
                else {
                    copy(src, dist).then(result => {
                        resolve(result);
                    }, err => {
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
        return $q((resolve, reject) => {
            if(src == dist) {
                xcopy(src, duplicateFolder(dist)).then(result => {
                    resolve(result);
                }, err => {
                    reject(err);
                });
            }
            else {
                if(fs.existsSync(dist)) {
                    let title = '重名文件夹存在';
                    let message = '重名文件夹存在，继续粘贴将覆盖，是否继续?';
                    dialog.showMessageBox({type: 'question', title: title, buttons: buttons, message: message}, index => {
                        if(index == 0) {
                            xcopy(src, dist).then(result => {
                                resolve(result);
                            }, err => {
                                reject(err);
                            });
                        }
                        else {
                            resolve();
                        }
                    })
                }
                else {
                    xcopy(src, dist).then(result => {
                        resolve(result);
                    }, err => {
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
        return $q((resolve, reject) => {
            dialog.showMessageBox({type: 'question', title: title, buttons: buttons, message: message}, index => {
                if(index == 0) {
                    fs.unlink(src, err => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    })
                }
                else {
                    reject('cancel');
                }
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
        return $q((resolve, reject) => {
            dialog.showMessageBox({type: 'question', title: title, buttons: buttons, message: message}, index => {
                if(index == 0) {
                    exec(`rmdir "${src}" /S /Q`, {encoding: 'GB2312'}, (err, stdout, stderr) => {
                        if(err || iconv.decode(stderr, 'GB2312')) {
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
        return $q((resolve, reject) => {
            exec(`xcopy "${src}" "${dist}" /E /C /Y /H /I`, {encoding: 'GB2312'}, (err, stdout, stderr) => {
                if(err || iconv.decode(stderr, 'GB2312')) {
                    dialog.showErrorBox(iconv.decode(stderr, 'GB2312'), iconv.decode(stdout, 'GB2312'));
                    reject(iconv.decode(stderr, 'GB2312'));
                }
                else {
                    dialog.showMessageBox({type: 'info', title: 'Success', message: iconv.decode(stdout, 'GB2312'), buttons: ['OK']});
                    getFileInfo(dist).then(stat => {
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
        return $q((resolve, reject) => {
            exec(`copy "${src}" "${dist}" /Y`, {encoding: 'GB2312'}, (err, stdout, stderr) => {
                if(err || iconv.decode(stderr, 'GB2312')) {
                    dialog.showErrorBox(iconv.decode(stderr, 'GB2312'), iconv.decode(stdout, 'GB2312'));
                    reject(iconv.decode(stderr, 'GB2312'));
                }
                else {
                    dialog.showMessageBox({type: 'info', title: 'Success', message: iconv.decode(stdout, 'GB2312'), buttons: ['OK']});
                    getFileInfo(dist).then(stat => {
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
        return $q((resolve, reject) => {
            fs.stat(src, (err, stat) => {
                if(err || src.length <= 4) {
                    reject(err);
                }
                else {
                    let temp = src.split('\\\\');
                    let type = 'unknown';
                    let seq = temp[temp.length-1].split('.');
                    let mime = seq[seq.length - 1];
                    stat.name = temp[temp.length-1];
                    if(stat.isDirectory()) {
                        type = 'folder'
                    }
                    else if(FileTypeIcon.hasOwnProperty(mime)) {
                        type = mime;
                    }
                    stat.type = FileTypeIcon[type].type;
                    stat.src = FileTypeIcon[type].src;
                    stat.path = src;
                    stat.rename = false;
                    stat.hover = false;
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
        return $q((resolve, reject) => {
            fs.readdir(src, (err, files) => {
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
     * 创建新文件夹
     * @param src
     * @returns {*}
     */
    function createNewFolder(src) {
        return $q((resolve, reject) => {
            let dist = duplicateFolder(src + '新建文件夹');
            fs.mkdir(dist, 777, err => {
                if(err) {
                    reject(err);
                }
                else {
                    resolve(getFileInfo(dist));
                }
            })
        })
    }

    /**
     * 创建新文档
     * @param src
     * @returns {*}
     */
    function createNewTxt(src) {
        return $q((resolve, reject) => {
            let dist = duplicate(src + '新文档.txt');
            fs.appendFile(dist, '', err => {
                if(err) {
                    reject(err);
                }
                else {
                    resolve(getFileInfo(dist));
                }
            })
        })
    }

    /**
     * 重命名
     * @param src
     * @param dist
     * @returns {*}
     */
    function rename(src, dist) {
        return $q((resolve, reject) => {
            fs.rename(src, dist, err => {
                if(err) {
                    alert(err);
                    reject(err);
                }
                else {
                    resolve();
                }
            });
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
            .map((element, index) => {
                return index + start;
            });
    }

    /**
     * 搜索文件
     * todo [ ] 多种搜索模式
     * todo [ ] 貌似感觉哪里不太对...
     * todo [ ] 提前结束全部异步
     * @param src
     * @param wanted
     * @param result
     * @returns {*}
     */
    function search(src, wanted, result=[]) {
        return $q((resolve, reject) => {
            let path = src;
            readFolder(src).then(files => {
                files.forEach(file => {
                    fs.stat(path + file, (err, stat) => {
                        if(stat && stat.isDirectory()){
                            if(file.toLowerCase().includes(wanted.toLowerCase())) {
                                getFileInfo(path + file).then(stat => {
                                    result.push(stat);
                                });
                            }
                            search(path + file + "\\\\", wanted, result).then();
                        }
                        else if(stat && stat.isFile()){
                            if(file.toLowerCase().includes(wanted.toLowerCase())) {
                                getFileInfo(path + file).then(stat => {
                                    result.push(stat);
                                });
                            }
                        }
                    })
                });
            });
            resolve(result);
        })
    }

    function readFile(stat) {
        let src = stat.path;
        let temp = src.split('.');
        if( temp[temp.length - 1].toLowerCase() == 'jpg'  ||
            temp[temp.length - 1].toLowerCase() == 'jpeg' ||
            temp[temp.length - 1].toLowerCase() == 'png'  ||
            temp[temp.length - 1].toLowerCase() == 'bmg'  ||
            temp[temp.length - 1].toLowerCase() == 'gif'  ||
            temp[temp.length - 1].toLowerCase() == 'svg'  ||
            temp[temp.length - 1].toLowerCase() == 'psd'  ||
            temp[temp.length - 1].toLowerCase() == 'ico' ) {
            return $q((resolve, reject) => {
                base64Img.base64(src, (err, data) => {
                    if(err) reject(err);
                    else resolve(data);
                })
            })
        }
        else {
            return $q((resolve, reject) => {
                // 只256KB以下文件的显示
                if(stat.size > 256*1024)    reject();
                fs.readFile(src, 'utf-8', (err, data) => {
                    if(err) {
                        reject(err);
                    }
                    else {
                        resolve(data);
                    }
                });
            })
        }
    }

    return {
        copyFile: copyFile,
        copyFolder: copyFolder,
        deleteFile: deleteFile,
        deleteFolder: deleteFolder,
        readFolder: readFolder,
        getFileInfo: getFileInfo,
        rename: rename,
        createNewFolder: createNewFolder,
        createNewTxt: createNewTxt,
        search: search,
        readFile: readFile
    };

});
