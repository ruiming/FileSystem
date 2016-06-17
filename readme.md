# 资源管理器
  使用Angular, Node.js, Electron编写的Windows下的资源管理器

###主要功能：

  - 文件和文件夹的增删查改
  - 搜索功能
  - 显示系统信息
  - 监控文件和文件夹的操作
  - 文件分类，用户和权限管理

###已完成功能：

  - 通过WMIC和Node.js的OS模块来显示基本系统信息(2016.6.12)
  - 通过WMIC来得到系统固定磁盘分区和磁盘信息(2016.6.13)
  - 通过Node.js的fs模块来列举文件(2016.6.13)
  - 前进后退功能(2016.6.15)
  - 文件排序功能(2016.6.16)
  - 使用$q来达到异步操作从而加快读取速度(2016.6.16)
  - 使用mmmagic模块获取文件类型(2016.6.16)
  - 路径导航(2016.6.16)
  - 右键菜单删除文件(2016.6.16)
  - 右键菜单删除文件夹(2016.6.17)
  - 右键复制粘贴文件和文件夹(2016.6.17)

# 注意
  使用electron-package打包时需要改写main.js

  ```
    const electron = require('electron');
    const app = require('app');
    const BrowserWindow = require('browser-window')

    loadURL -> loadUrl
 ```

 ---
