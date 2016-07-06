/**
 * System Factory
 * 提供Windows下获取系统信息如固定磁盘分区，CPU负载等功能
 */
routeApp.factory('System', ($q) => {
    const exec = require('child_process').exec,
         iconv = require('iconv-lite');

    const cmd = {
        'disk': 'wmic logicaldisk get /VALUE',
        'cpu': 'wmic cpu get /VALUE',
        'baseboard': 'wmic baseboard get /VALUE',
        'bios': 'wmic bios get /VALUE',
        'diskdrive': 'wmic diskdrive get /VALUE',
        'os': 'wmic os get /VALUE',
        'memorychip': 'wmic memorychip get /VALUE'
    };

    function getDisk(){
        return $q(function(resolve, reject){
            exec(cmd.disk, {encoding: 'GB2312'}, (err, stdout, stderr) => {
                if(err){
                    reject(stderr);
                }
                else {
                    wmicFormat(iconv.decode(stdout, 'GB2312'), 40).then(result => {
                        resolve(result);
                    })
                }
            })
        });
    }

    function getCpu(){
            return $q((resolve, reject) => {
                exec(cmd.cpu, (err, stdout, stderr) => {
                    if(err){
                        reject(err);
                    }
                    else {
                        wmicFormat(stdout,57).then(result => {
                            resolve(result);
                        })
                    } 
            });
        });
    }
    
    function getBaseboard() {
        return $q((resolve, reject) => {
            exec(cmd.baseboard, (err, stdout, stderr) => {
                if(err){
                    reject(err);
                }
                else {
                    wmicFormat(stdout, 29).then(result => {
                        resolve(result);
                    })
                }
            })
        })
    }

    function getBios(){
        return $q((resolve, reject) => {
            exec(cmd.bios, {encoding: 'GB2312'}, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }
                else {
                    wmicFormat(iconv.decode(stdout, 'GB2312'), 31).then(result => {
                        resolve(result);
                    })
                }
            })
        })
    }

    function getOs(){
        return $q((resolve, reject) => {
            exec(cmd.os, {encoding: 'GB2312'}, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }
                else {
                    wmicFormat(iconv.decode(stdout, 'GB2312'), 64).then(result => {
                        resolve(result);
                    })
                }
            })
        })
    }

    function getMemorychip(){
        return $q((resolve, reject) => {
            exec(cmd.memorychip, {encoding: 'GB2312'}, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }
                else {
                    wmicFormat(iconv.decode(stdout, 'GB2312'), 36).then(result => {
                        resolve(result);
                    })
                }
            })
        })
    }
    
    function getDiskDrive() {
        return $q((resolve, reject) => {
            exec(cmd.diskdrive, {encoding: 'GB2312'}, (err, stdout, stderr) => {
                if(err) {
                    reject(err);
                }
                else {
                    wmicFormat(iconv.decode(stdout, 'GB2312'), 51).then(result => {
                        resolve(result);
                    })
                }
            })
        })
    }
    
    function wmicFormat(stdout, size) {
        return $q((resolve, reject) => {
            let reg = /([^\r]+)=(.*)\r/g;
            let result = [];
            let one = {};
            let length = stdout.match(/=/g).length;
            for(let i=0; i<length/size; i++){
                one = {};
                for(let j=0; j<size; j++){
                    let mat = reg.exec(stdout);
                    if(mat != null) {
                        one[mat[1].slice(1)] = mat[2];
                    }
                }
                result.push(one);
            }
            if(result.length > 1) {
                resolve(result);
            }
            else    resolve(one);
        });
    }
    
    return {
        getDisk: getDisk,
        getCpu: getCpu,
        getBios: getBios,
        getBaseboard: getBaseboard,
        getDiskDrive: getDiskDrive,
        getOs: getOs,
        getMemorychip: getMemorychip
    }
});
