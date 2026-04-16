// components/CRM/TablaClientes.jsx
import { ESTADO_BADGE_CLASSES } from '../../constants';

function TablaClientes({ clientes, onEditar, onEliminar, rol }) {
  
  const getDetallesExtra = (cliente) => {
    switch (cliente.estadoVenta) {
      case 'Compró':
        return cliente.precio && cliente.sectorMz 
          ? `S/ ${cliente.precio.toLocaleString()} - ${cliente.sectorMz}`
          : 'Precio pendiente';
      case 'Separó':
        return cliente.montoSeparacion 
          ? `S/ ${cliente.montoSeparacion.toLocaleString()}`
          : 'Monto pendiente';
      case 'Financió':
        return cliente.montoFinanciamiento 
          ? `S/ ${cliente.montoFinanciamiento.toLocaleString()}`
          : 'Monto pendiente';
      case 'Negociación':
        return '📞 En negociación';
      case 'Prospecto':
        return '⭐ Prospecto inicial';
      default:
        return '—';
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="table-responsive" style={{ overflowX: 'auto', maxWidth: '100%', maxHeight: '70vh' }}>
        <table className="table table-bordered table-hover align-middle mb-0" style={{ fontSize: '0.875rem', minWidth: '900px' }}>
          
          {/* CABECERA PROFESIONAL - Gris oscuro elegante */}
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#1e293b' }}>
            <tr>
              <th className="py-3 px-3" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>
                <i className="fas fa-user me-2"></i> CLIENTE
              </th>
              <th className="py-3 px-3" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>
                <i className="fas fa-phone me-2"></i> CONTACTO
              </th>
              <th className="py-3 px-3" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>
                <i className="fas fa-calendar me-2"></i> FECHA
              </th>
              {rol === 'admin' && (
                <th className="py-3 px-3" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>
                  <i className="fas fa-user-tie me-2"></i> AGENTE
                </th>
              )}
              <th className="py-3 px-3" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>
                <i className="fas fa-handshake me-2"></i> ACUERDO
              </th>
              <th className="py-3 px-3" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>
                <i className="fas fa-chart-line me-2"></i> ESTADO
              </th>
              <th className="py-3 px-3" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>
                <i className="fas fa-info-circle me-2"></i> DETALLES
              </th>
              <th className="py-3 px-3 text-center" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}>
                <i className="fas fa-cogs me-2"></i> ACCIONES
              </th>
            </tr>
          </thead>
          
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={rol === 'admin' ? 8 : 7} className="text-center py-5 text-muted">
                  <i className="fas fa-users fa-2x mb-2 d-block"></i>
                  No hay clientes registrados
                </td>
              </tr>
            ) : (
              clientes.map(cliente => (
                <tr key={cliente.id} className="border-bottom">
                  <td className="py-2 px-3">
                    <div className="fw-semibold">{cliente.nombre}</div>
                    <div className="small text-muted"><i className="fas fa-id-card me-1"></i>{cliente.dni}</div>
                  </td>
                  <td className="py-2 px-3">
                    {cliente.telefono && <div><i className="fab fa-whatsapp text-success me-1"></i> {cliente.telefono}</div>}
                    {cliente.correo && <div className="small text-truncate" style={{ maxWidth: '180px' }}><i className="fas fa-envelope me-1"></i> {cliente.correo}</div>}
                    {!cliente.telefono && !cliente.correo && <span className="text-muted">—</span>}
                  </td>
                  <td className="py-2 px-3">{cliente.fechaContacto || '—'}</td>
                  {rol === 'admin' && (
                    <td className="py-2 px-3">
                      <span className="badge bg-secondary">{cliente.agente}</span>
                    </td>
                  )}
                  <td className="py-2 px-3">
                    <span className="badge bg-primary">{cliente.acuerdo}</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`badge ${ESTADO_BADGE_CLASSES[cliente.estadoVenta] || 'bg-secondary'}`}>
                      {cliente.estadoVenta}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <small className="text-muted">{getDetallesExtra(cliente)}</small>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button 
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => onEditar(cliente)}
                      title="Editar"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    {rol === 'admin' && (
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onEliminar(cliente.id, cliente.nombre)}
                        title="Eliminar"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    )}
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