// components/CRM/TablaClientes.jsx
import { ESTADO_BADGE_CLASSES } from '../../constants';

function TablaClientes({ clientes, onEditar, onEliminar }) {
  const getDetallesExtra = (cliente) => {
    switch (cliente.estadoVenta) {
      case 'Compró':
        return cliente.precio && cliente.sectorMz 
          ? `S/ ${cliente.precio.toLocaleString()} - Mz: ${cliente.sectorMz}`
          : 'Precio y sector pendientes';
      case 'Separó':
        return cliente.montoSeparacion 
          ? `Separó con: S/ ${cliente.montoSeparacion.toLocaleString()}`
          : 'Monto de separación pendiente';
      case 'Financió':
        return cliente.montoFinanciamiento 
          ? `Financió: S/ ${cliente.montoFinanciamiento.toLocaleString()}`
          : 'Monto de financiamiento pendiente';
      case 'Negociación':
        return 'En proceso de negociación';
      case 'Prospecto':
        return 'Prospecto inicial - Sin detalles';
      default:
        return '—';
    }
  };

  return (
    <div className="card shadow border-0">
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-dark">
            <tr>
              <th>CLIENTE / DNI</th>
              <th>CONTACTO</th>
              <th>FECHA CONTACTO</th>
              <th>AGENTE</th>
              <th>ACUERDO</th>
              <th>ESTADO VENTA</th>
              <th>DETALLES EXTRA</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-5 text-muted">
                  No hay clientes registrados. ¡Comienza agregando uno nuevo!
                </td>
              </tr>
            ) : (
              clientes.map(cliente => (
                <tr key={cliente.id}>
                  <td>
                    <strong>{cliente.nombre}</strong>
                    <br />
                    <small className="text-muted">{cliente.dni}</small>
                  </td>
                  <td>
                    <small>
                      {cliente.telefono && <div>📱 {cliente.telefono}</div>}
                      {cliente.correo && <div>✉️ {cliente.correo}</div>}
                      {!cliente.telefono && !cliente.correo && <span className="text-muted">—</span>}
                    </small>
                  </td>
                  <td><small>{cliente.fechaContacto || '—'}</small></td>
                  <td><span className="badge bg-info text-dark">{cliente.agente}</span></td>
                  <td><span className="badge bg-secondary">{cliente.acuerdo}</span></td>
                  <td>
                    <span className={`badge ${ESTADO_BADGE_CLASSES[cliente.estadoVenta] || 'bg-secondary'}`}>
                      {cliente.estadoVenta}
                    </span>
                  </td>
                  <td><small className="text-muted">{getDetallesExtra(cliente)}</small></td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => onEditar(cliente)}
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => onEliminar(cliente.id, cliente.nombre)}
                    >
                      🗑️ Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TablaClientes;