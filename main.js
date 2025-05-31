const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./db');

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});


ipcMain.on('guardar-transaccion', (event, transaccion) => {
  const { tipo, descripcion, monto, fecha } = transaccion;
  db.run(
    `INSERT INTO transacciones (tipo, descripcion, monto, fecha) VALUES (?, ?, ?, ?)`,
    [tipo, descripcion, monto, fecha],
    function (err) {
      if (err) {
        console.error("Error al guardar:", err.message);
      } else {
        transaccion.id = this.lastID; 
        event.reply('transaccion-guardada', transaccion);
      }
    }
  );
});



ipcMain.on('obtener-transacciones', (event) => {
  db.all(`SELECT * FROM transacciones ORDER BY fecha DESC`, [], (err, rows) => {
    if (err) {
      console.error("Error al obtener transacciones:", err.message);
      event.reply('lista-transacciones', []);
    } else {
      event.reply('lista-transacciones', rows);
    }
  });
});


ipcMain.on('eliminar-transaccion', (event, id) => {
  db.run(`DELETE FROM transacciones WHERE id = ?`, [id], (err) => {
    if (err) {
      console.error("Error al eliminar transacción:", err.message);
    } else {
      event.reply('transaccion-eliminada', id);
    }
  });
});

const fs = require('fs');
const { dialog } = require('electron');

ipcMain.on('exportar-transacciones', (event) => {
  db.all(`SELECT * FROM transacciones ORDER BY fecha DESC`, [], (err, rows) => {
    if (err) {
      console.error("Error al exportar:", err.message);
      return;
    }

   const csv = '\uFEFF' + [
  ['ID', 'Tipo', 'Descripción', 'Monto', 'Fecha'],
  ...rows.map(r => [r.id, r.tipo, r.descripcion, r.monto, r.fecha])
].map(e => e.join(',')).join('\n');


    dialog.showSaveDialog({
      title: 'Guardar CSV',
      defaultPath: 'transacciones.csv',
      filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    }).then(result => {
      if (!result.canceled) {
        fs.writeFileSync(result.filePath, csv);
        console.log("Exportado correctamente:", result.filePath);
      }
    });
  });
});


