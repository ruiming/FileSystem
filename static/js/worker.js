var fs = require('fs');

(function() {
    var startTime = null;
    var result = [];
    var wanted = null;
    var caps = false;
    var icon = null;

    process.on('message', data => {
        startTime = new Date().getTime();
        wanted = data.wanted;
        icon = data.icon;
        if(data.caps) caps = data.caps;
        let path = data.src;
        search(path).then();
    });

    function search(path) {
        return readdir(path).then(files => {
            files.forEach(fileName => {
                detail(path + fileName).then(stat => {
                    if(name(fileName).includes(name(wanted))) {
                        process.send(stat);
                        result.push(stat);
                    }
                    if(stat && stat.isDirectory()) {
                        search(path + fileName + '\\\\').then();
                    }
                });
            })
        })
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
                    resolve(stat);
                }
            })
        })
    }

    function name(fileName) {
        return caps ? fileName.toLowerCase() : fileName;
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
