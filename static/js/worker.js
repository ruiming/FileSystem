var fs = require('fs');

(function() {
    var startTime = null;
    var wanted = null;
    var src = null;
    var icon = null;
    var length = 0;

    var caps = false;
    var fileOnly = false;
    var folderOnly = false;

    let check = setInterval(() => {
        let before = length;
        let after = null;
        Promise.resolve(setTimeout(() => {
            after = length;
            if(before === after) {
                process.send('over');
                clearInterval(check);
            }
        }, 250));
    }, 300);


    process.on('message', data => {
        startTime = new Date().getTime();
        wanted = data.wanted;
        icon = data.icon;
        caps = data.caps;
        fileOnly = data.fileOnly;
        folderOnly = data.folderOnly;
        src = data.src;
        let path = data.src;
        search(path).then();
    });

    function search(path) {
        return readdir(path).then(files => {
            return Promise.all(files.map(fileName =>
                detail(path + fileName).then(stat => {
                    length++;
                    if(name(fileName).includes(name(wanted))) {
                        if(fileOnly && stat.isFile()) {
                            process.send(stat);
                        } else if (folderOnly && stat.isDirectory()) {
                            process.send(stat);
                        } else if (!folderOnly && !fileOnly){
                            process.send(stat);
                        }
                    }
                    if(stat && stat.isDirectory()) {
                        return search(path + fileName + '\\\\')
                    } else {
                        return stat;
                    }
                })
            )).catch(err => {
                console.log(err);
            });
        });
    }


    function detail(src) {
        return new Promise((resolve, reject) => {
            fs.stat(src, (err, stat) => {
                if(err) {
                    console.log(err);
                    reject(err);
                } else {
                    let temp = src.split('\\\\');
                    let type = 'unknown';
                    let seq = temp[temp.length-1].split('.');
                    let mime = seq[seq.length - 1];
                    stat.name = temp[temp.length-1];
                    if(stat.isDirectory()) {
                        type = 'folder'
                    } else if(icon.hasOwnProperty(mime.toLowerCase())) {
                        type = mime.toLowerCase();
                    }
                    stat.type = icon[type].type;
                    console.log(stat.type);
                    stat.src = icon[type].src;
                    stat.path = src;
                    stat.rename = false;
                    stat.hover = false;
                    stat.location = stat.path.slice(0, stat.path.indexOf(stat.name));
                    resolve(stat);
                }
            })
        })
    }

    function name(fileName) {
        return caps ? fileName : fileName.toLowerCase();
    }

    function readdir(src) {
        return new Promise((resolve, reject) => {
            fs.readdir(src, (err, files) => {
                if(err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(files);
                }
            })
        })
    }

}());
