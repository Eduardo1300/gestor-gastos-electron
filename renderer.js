const form = document.getElementById('form-transaccion');
const lista = document.getElementById('lista-transacciones');


form.addEventListener('submit', (e) => {
  e.preventDefault();

  const transaccion = {
    tipo: form.tipo.value,
    descripcion: form.descripcion.value,
    monto: parseFloat(form.monto.value),
    fecha: form.fecha.value
  };

  if (!transaccion.descripcion || isNaN(transaccion.monto) || !transaccion.fecha) {
    alert("Todos los campos son obligatorios.");
    return;
  }

  window.api.send('guardar-transaccion', transaccion);
  form.reset();
});


window.api.receive('transaccion-guardada', (transaccion) => {
  agregarTransaccion(transaccion);
});


window.api.send('obtener-transacciones');

window.api.receive('lista-transacciones', (transacciones) => {
  lista.innerHTML = '';
  transacciones.forEach(agregarTransaccion);
});

function agregarTransaccion(transaccion) {
  const item = document.createElement('li');
  item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
item.innerHTML = `
  ${transaccion.fecha} - [${transaccion.tipo.toUpperCase()}] ${transaccion.descripcion}: S/. ${transaccion.monto.toFixed(2)}
  <button data-id="${transaccion.id}" class="btn btn-danger btn-sm btn-eliminar">🗑️</button>
`;
  lista.appendChild(item);
}

lista.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-eliminar')) {
    const id = e.target.dataset.id;
    window.api.send('eliminar-transaccion', id);
  }
});

window.api.receive('transaccion-eliminada', (id) => {
  const boton = document.querySelector(`button[data-id="${id}"]`);
  if (boton) {
    boton.parentElement.remove();
  }
});

document.getElementById('btn-exportar').addEventListener('click', () => {
  window.api.send('exportar-transacciones');
});

