/**
 * System Factory
 * 提供Windows下获取系统信息如固定磁盘分区，CPU负载等功能
 */
routeApp.factory('System', ($q) => {
    const exec = require('child_process').exec,
         iconv = require('iconv-lite');

    function getDisk(){
        return $q(function(resolve, reject){
            exec('wmic logicaldisk get /VALUE', {encoding: 'GB2312'}, (err, stdout, stderr) => {
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
                exec('wmic cpu get /VALUE', (err, stdout, stderr) => {
                    if(err || stderr){
                        throw new Error(err);
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
            exec('wmic baseboard get /VALUE', (err, stdout, stderr) => {
                if(err || stderr){
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
            exec('wmic bios get /VALUE', (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                }
                else {
                    wmicFormat(stdout, 31).then(result => {
                        resolve(result);
                    })
                }
            })
        })
    }

    function getDiskDrive() {
        return $q((resolve, reject) => {
            exec('wmic diskdrive get /VALUE', {encoding: 'GB2312'}, (err, stdout, stderr) => {
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

    /**
     * 格式化wmic输出
     * @param stdout
     * @param size
     * @returns {*}
     */
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
        getDiskDrive: getDiskDrive
    }
});
