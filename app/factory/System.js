routeApp.factory('System', ($q) => {
    const fs = require("fs"),
          path = require('path'),
          exec = require('child_process').exec,
          iconv = require('iconv-lite');

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
    
    return {
        getDisk: getDisk
    }
});