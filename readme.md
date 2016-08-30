# 资源管理器

  基于 Angular, Node.js, Electron 的 Windows 资源管理器

### 截图预览
![image](https://raw.githubusercontent.com/Ruiming/FileSystem/master/static/windows.png)

### 功能：

  - 文件和文件夹的复制剪切粘贴新建删除
  - 显示导航栏，支持前进后退，显示当前目录文件数
  - 显示系统，硬盘，磁盘，文件和文件夹的信息
  - 支持图片预览和可执行程序运行
  - 监控文件和文件夹的操作并提示变更
  - 搜索功能


### 使用方法：

开发：
```sh
npm install
bower install
./node_modules/.bin/electron .
```

构建运行(Win32 为例)：
```sh
npm install
bower install
./node_modules/.bin/electron-packager . FileSystem --platform=win32 --asar --arch=ia32
```

 ---
