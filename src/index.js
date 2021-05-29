const {app, BrowserWindow, Menu, ipcMain, ipcRenderer} = require('electron');
const url = require('url');
const path  = require('path');

let mainWindow = require
let newProductWindow

const { title } = require('process');
const { platform } = require('os');

// Actualizar cuando se este en modo desarrollo
if(process.env.NODE_ENV !== 'production') {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
    });
  }


app.on('ready', () =>{  // Cuando la funcion inicia

    // ventana principal
    mainWindow = new BrowserWindow({
        width: 720, 
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    }); 

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/index.html'), // cargar desde esta direccion
        protocol: 'file',
        slashes: true
      }))

    // creamos una plantilla para el menu apartir de mi arreglo de objetos 'templatemenu'
    const mainMenu = Menu.buildFromTemplate(templateMenu);

    // Mandamos ese template a mi aplicacion
    Menu.setApplicationMenu(mainMenu);

    // Escuchamos si se cierra la ventana principal
    mainWindow.on('closed', () => {
        app.quit();
    });
});


function createNewProductWindow(){
    newProductWindow = new BrowserWindow({ // cargar ventana
        width: 400,
        height: 330,
        title: 'Add A New Product',
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
        }
    });
    
    // ventana sin menu superior
    newProductWindow.setMenu(null)  

    // direccion ventana nueva
    newProductWindow.loadURL(url.format({
        // crear conexion entre este direcotorio y new-product.html
        pathname: path.join(__dirname, 'views/new-product.html'),
        protocol: 'file',
        slashes: true
    }));

    // Escuchamos si se cierra la ventana de agregar producto
    newProductWindow.on('closed', () => {
        newProductWindow = null; // igualamos a nulo para borrarla
    });
    
}

// eventos de renderizado
ipcMain.on('product:new', (e, newProduct) => {
    // Enviar  ala ventana principal
    console.log(newProduct);
    mainWindow.webContents.send('product:new', newProduct);
    newProductWindow.close(); // despues de enviar la info se cierra al ventana
});

// plantilla para el menu
const templateMenu = [ // Arreglo de objetos
    {
        label: 'Archivo',
        submenu: [
            {
                label: 'Nuevo Producto',
                accelerator: process.platform == 'darwin' ? 'command+Q':'Ctrl+N',
                click() {
                    createNewProductWindow();
                }
            },

            {
                label: 'Borrar todos los productos',
                click(){
                    mainWindow.webContents.send('products:remove-all');
                }
            },

            {
                label: 'Salir',
                accelerator: process.platform == 'darwin' ? 'command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                }
            }
        ]
    }
];

// si estamos en mac agrega el nombre de la aplicacion al principio del menu
if (process.platform === 'darwin') {
    templateMenu.unshift({
      label: app.getName(),
    });
};



if(process.env.NODE_ENV !== 'production'){
    templateMenu.push({
        label: 'DevTools',
        submenu : [
            {
                label: 'Muestra/oculta Herramientas de Desarrollo',
                accelerator: 'Ctrl+D',
                click(item,focusedWindow){
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload' 
            }
        ]
    })
}