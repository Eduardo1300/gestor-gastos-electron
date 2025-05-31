const fs = require('fs');

module.exports = {
  exportarCSV: (transacciones) => {
    let csv = "Tipo,Descripción,Monto,Fecha\n";
    transacciones.forEach(t => {
      csv += `${t.tipo},${t.descripcion},${t.monto},${t.fecha}\n`;
    });
    fs.writeFileSync('exportado.csv', csv);
  }
};
