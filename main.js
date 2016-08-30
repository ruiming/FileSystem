const electron = require('electron');
const nativeImage = require('electron').nativeImage;
const Tray = electron.Tray;
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Menu = electron.Menu;
let mainWindow = null;

// 若所有窗口关闭，则退出
app.on('window-all-closed', () => {
    if(process.platform != 'darwin') {
        app.quit();
    }
});

var appIcon = null;

app.on('ready', () => {
    appIcon = new Tray('./static/pikachu.png');
    var contextMenu = Menu.buildFromTemplate([
        { label: '打开', click() {
            mainWindow.show();
        }},
        { label: '最大化', click() {
            mainWindow.maximize();
        }},
        { label: '最小化', click() {
            mainWindow.minimize();
        }},
        { label: '关闭', click() {
            mainWindow.close();
        }}
    ]);
    appIcon.setToolTip('Windows 资源管理器');
    appIcon.setContextMenu(contextMenu);

    // 创建浏览器窗口
    mainWindow = new BrowserWindow({
        width: 1366,
        height: 768,
        title: "资源管理器",
        center: true,
        skipTaskbar: true,
        icon: nativeImage.createFromPath('./static/pikachu.png')
    });
    // 加载应用的index.html
    mainWindow.loadURL('file://' + __dirname + '/index.html');
    
    // 打开开发工具
    mainWindow.openDevTools();
    
    // 当window被关闭，触发下面事件
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
});
