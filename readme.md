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


### 日志：

  - 通过 WMIC 和 Node.js 的 OS 模块来显示基本系统信息(2016.6.12)
  - 通过 WMIC 来得到系统固定磁盘分区和磁盘信息(2016.6.13)
  - 通过 Node.js 的 fs 模块来列举文件(2016.6.13)
  - 前进后退功能(2016.6.15)
  - 文件排序功能(2016.6.16)
  - 使用 Promise 异步操作加快速度(2016.6.16)
  - 路径导航(2016.6.16)
  - 右键菜单删除文件(2016.6.16)
  - 右键菜单删除文件夹(2016.6.17)
  - 右键复制粘贴文件和文件夹到里面(2016.6.17)
  - 右键复制粘贴文件和文件夹到此处(2016.6.18)
  - 增加 File Factory 和 System Factory(2016.6.26)
  - 增加文件与图片和类型的映射(2016.6.26)
  - 重命名功能(2016.6.28)
  - 创建 txt 文档和新文件夹功能(2016.6.29)
  - 不太完善但能用的搜索功能(2016.7.1)
  - 文件列表显示对齐和溢出处理(2016.7.2)
  - 增加文件和目录变动提示(2016.7.4)
  - 美化样式(2016.7.4)
  - 支持小于 1M 的文本文件预览功能,非 UTF-8 格式可能乱码(2016.7.5)
  - 图片转 base64 实现图片预览功能(2016.7.5)
  - 支持显示全部磁盘，完善侧边栏(2016.7.6)
  - 增加显示硬盘信息(2016.7.6)
  - 使用自制模块 node-wmic 代替 System Factory (2016.7.7)
  - 支持运行可执行文件(2016.7.8)
  - 重构(2016.8.10)


 ---
