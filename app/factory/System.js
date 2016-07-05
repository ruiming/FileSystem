/**
 * System Factory
 * 提供Windows下获取系统信息如固定磁盘分区，CPU负载等功能
 */
routeApp.factory('System', ($q) => {
    const exec = require('child_process').exec,
         iconv = require('iconv-lite');

    /**
     * 获取系统固定磁盘信息
     * 调用wmic命令
     * @returns {*}
     */
    function getDisk(){
        return $q(function(resolve, reject){
            exec('wmic logicaldisk where "drivetype=3" get name,filesystem,freespace,size', (err, stdout, stderr) => {
                if(err || stderr){
                    reject(err + stderr);
                }
                else {
                    let diskStr = stdout.replace(/(FileSystem)|(FreeSpace)|(Name)|(Size)/g, '').replace(/(\s+)/g, '#').trim().split('#');
                    diskStr.pop();
                    diskStr.shift();
                    let disks = [];
                    let disk = {};
                    for(let i in diskStr){
                        if(diskStr.hasOwnProperty(i)){
                            if(i%4 == 0){
                                disk.FileSystem = diskStr[i];
                            }
                            else if(i%4 == 1){
                                disk.FreeSpace = diskStr[i];
                            }
                            else if(i%4 == 2){
                                disk.Name = diskStr[i];
                            }
                            else if(i%4 == 3){
                                disk.Size = diskStr[i];
                                disk.src = FileTypeIcon['disk'].src;
                                disk.type = FileTypeIcon['disk'].type;
                                disks.push(disk);
                                disk = {};
                            }
                        }
                    }
                    resolve(disks);
                }
            })
        });
    }

    /**
     * 获取当前CPU负载
     * @param callback
     */
    function getCpuLoadPercentage(callback){
        exec('wmic cpu get loadpercentage', (err, stdout, stderr) => {
            if(err || stderr){
                throw new Error(err);
            }
            else {
                callback(stdout.replace(/(LoadPercentage)/, '').trim());
            }
        });
    }

    /**
     * 获取当前CPU温度
     * @param callback
     */
    function getCpuTemperature(callback){
        exec('wmic /namespace:\\\\root\\WMI path MSAcpi_ThermalZoneTemperature GET CriticalTripPoint,CurrentTemperature', (err, stdout, stderr) => {
            if(err || stderr){
                throw new Error(err);
            }
            let out = stdout.replace(/(CriticalTripPoint)|(CurrentTemperature)/g, '').replace(/(\s+)/g, '#').trim().split('#');
            out.pop();
            out.shift();
            callback(out);
        })
    }

    /**
     * 获取BIOS制造商
     * @param callback
     */
    function getBiosManufacturer(callback){
        exec('wmic bios get Manufacturer', (err, stdout, stderr) => {
            if (err || stderr) {
                throw new Error(err);
            }
            else {
                callback(stdout.replace(/(Manufacturer)|(s+)/g, '').replace(/(\s+)/g, '').trim())
            }
        })
    }

    /**
     * 获取BIOS名称
     * @param callback
     */
    function getBiosName(callback){
        exec('wmic bios get Name', (err, stdout, stderr) => {
            if (err || stderr) {
                throw new Error(err);
            }
            else {
                callback(stdout.replace(/(Name)|(s+)/g, '').replace(/(\s+)/g, '').trim());
            }
        })
    }

    /**
     * 获取CPU实际数量和逻辑数量
     * @param callback
     */
    function getCpuNumber(callback){
        exec('wmic cpu get NumberOfCores,NumberOfLogicalProcessors', (err, stdout, stderr) => {
            if (err || stderr) {
                throw new Error(err);
            }
            else {
                callback(stdout.replace(/(NumberOfCores)|(NumberOfLogicalProcessors)/g, '').replace(/(\s+)/g, '#').trim().split('#'));
            }
        })
    }

    /**
     * 获取PC型号
     * @param callback
     */
    function getProduct(callback) {
        exec('wmic baseboard get Product', (err, stdout, stderr) => {
            if(err || stderr){
                throw new Error(err);
            }
            callback(stdout.replace(/(Product)/g, '').replace(/(\s+)/g, '').trim().toString());
        })
    }

    function getDiskDriver() {
        exec('wmic DISKDRIVE get caption,description,interfacetype,model,partitions,size,totalsectors /VALUE', {encoding: 'GB2312'}, (err, stdout, stderr) => {
            if(err || iconv.decode(stderr, 'GB2312')){
                throw new Error(err);
            }
            wmicFormat(iconv.decode(stdout, 'GB2312'), 7);
        })
    }

    function wmicFormat(stdout, size) {
        let reg = /([^\r]+)=([^\r]+)\r/g;
        let result = [];
        let one = {};
        let length = stdout.match(/=/g).length;
        for(let i=0; i<length/size; i++){
            for(let j=0; j<size; j++){
                let mat = reg.exec(stdout);
                one[mat[1].slice(1)] = mat[2];
            }
            result.push(one);
        }
        console.log(result);
    }

    getDiskDriver();

    return {
        getDisk: getDisk,
        getCpuLoadPercentage: getCpuLoadPercentage,
        getCpuTemperature: getCpuTemperature,
        getBiosManufacturer: getBiosManufacturer,
        getBiosName: getBiosName,
        getCpuNumber: getCpuNumber,
        getProduct: getProduct,
        getDiskDriver: getDiskDriver
    }
});
