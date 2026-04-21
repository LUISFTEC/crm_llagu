import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase-config';
import { ESTADO_BADGE_CLASSES } from '../../constants';

function TablaClientes({ onEditar, onEliminar, onRegistrarVenta, rol }) {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const clientesRef = collection(db, 'clientes');
    const unsubscribe = onSnapshot(clientesRef, (snapshot) => {
      const datos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      datos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setClientes(datos);
      setCargando(false);
    }, (error) => {
      console.error("Error al escuchar clientes de Firebase:", error);
      setCargando(false);
    });
    return () => unsubscribe();
  }, []);

  // 🔥 AQUÍ ESTÁ LA CORRECCIÓN: Ahora lee el sector en los 3 estados
  const getDetallesExtra = (cliente) => {
    switch (cliente.estadoVenta) {
      case 'Compró':
        return cliente.precio && cliente.sectorMz 
          ? `S/ ${Number(cliente.precio).toLocaleString()} - ${cliente.sectorMz}`
          : 'Precio pendiente';
      case 'Separó':
        return cliente.montoSeparacion && cliente.sectorMz
          ? `S/ ${Number(cliente.montoSeparacion).toLocaleString()} - ${cliente.sectorMz}`
          : 'Monto pendiente';
      case 'Financió':
        return cliente.montoFinanciamiento && cliente.sectorMz
          ? `S/ ${Number(cliente.montoFinanciamiento).toLocaleString()} - ${cliente.sectorMz}`
          : 'Monto pendiente';
      case 'Negociación':
        return '📞 En negociación';
      case 'Prospecto':
        return '⭐ Prospecto inicial';
      default:
        return '—';
    }
  };

  // Determina si un cliente está en estado "activo" para venta
  const esClienteActivo = (estadoVenta) => {
    return estadoVenta === 'Separó' || estadoVenta === 'Financió';
  };

  // Obtiene el ícono según el estado
  const getIconoEstado = (estadoVenta) => {
    switch (estadoVenta) {
      case 'Separó':
        return '💰';
      case 'Financió':
        return '📋';
      case 'Compró':
        return '✅';
      case 'Negociación':
        return '🤝';
      case 'Prospecto':
        return '👤';
      default:
        return '•';
    }
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="table-responsive" style={{ overflowX: 'auto', maxWidth: '100%', maxHeight: '70vh' }}>
        <table className="table table-bordered table-hover align-middle mb-0" style={{ fontSize: '0.875rem', minWidth: '900px' }}>
          
          <thead style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#1e293b' }}>
            <tr>
              <th className="py-3 px-3" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}><i className="fas fa-user me-2"></i> CLIENTE</th>
              <th className="py-3 px-3" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}><i className="fas fa-phone me-2"></i> CONTACTO</th>
              <th className="py-3 px-3" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}><i className="fas fa-calendar me-2"></i> FECHA</th>
              {rol === 'admin' && (
                <th className="py-3 px-3" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}><i className="fas fa-user-tie me-2"></i> AGENTE</th>
              )}
              <th className="py-3 px-3" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}><i className="fas fa-handshake me-2"></i> ACUERDO</th>
              <th className="py-3 px-3" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}><i className="fas fa-chart-line me-2"></i> ESTADO</th>
              <th className="py-3 px-3" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}><i className="fas fa-info-circle me-2"></i> DETALLES</th>
              <th className="py-3 px-3 text-center" style={{ backgroundColor: '#1e293b', color: '#f1f5f9' }}><i className="fas fa-cogs me-2"></i> ACCIONES</th>
            </tr>
          </thead>
          
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={rol === 'admin' ? 8 : 7} className="text-center py-5 text-muted">
                  <div className="spinner-border text-primary mb-2" role="status"></div>
                  <div>Cargando base de datos...</div>
                </td>
              </tr>
            ) : (!clientes || clientes.length === 0) ? (
              <tr>
                <td colSpan={rol === 'admin' ? 8 : 7} className="text-center py-5 text-muted">
                  <i className="fas fa-users fa-2x mb-2 d-block"></i>
                  No hay clientes registrados en el sistema
                </td>
              </tr>
            ) : (
              clientes.map(cliente => {
                const esActivo = esClienteActivo(cliente.estadoVenta);
                const esSeparado = cliente.estadoVenta === 'Separó';
                
                return (
                  <tr 
                    key={cliente.id} 
                    className="border-bottom"
                    style={esActivo ? { backgroundColor: '#f0fdf4', borderLeft: '4px solid #22c55e' } : {}}
                  >
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
                      <span className="me-1">{getIconoEstado(cliente.estadoVenta)}</span>
                      <span className={`badge ${ESTADO_BADGE_CLASSES[cliente.estadoVenta] || 'bg-secondary'}`}>
                        {cliente.estadoVenta}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <small className="fw-bold">{getDetallesExtra(cliente)}</small>
                    </td>
                    
                    <td className="py-2 px-3 text-center">
                      
                      {/* Botón Editar */}
                      <button 
                        className="btn btn-sm btn-outline-primary me-1 mb-1"
                        onClick={() => onEditar(cliente)}
                        title="Editar Datos del Cliente"
                      >
                        <i className="fas fa-edit"></i>
                      </button>

                      {/* BOTÓN VERDE CON CHECK - SOLO ÍCONO */}
                      {esActivo && (
                        <button 
                          className="btn btn-sm btn-success me-1 mb-1"
                          onClick={() => onRegistrarVenta(cliente)}
                          title={esSeparado ? "💰 YA SEPARÓ - Ver detalles" : "📋 YA FINANCIÓ - Ver cronograma"}
                          style={{ position: 'relative' }}
                        >
                          {esSeparado ? (
                            <>
                              <i className="fas fa-hand-holding-usd"></i>
                              <span style={{
                                position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#15803d',
                                borderRadius: '50%', width: '16px', height: '16px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '10px',
                                border: '2px solid white'
                              }}>
                                <i className="fas fa-check" style={{ color: 'white', fontSize: '8px' }}></i>
                              </span>
                            </>
                          ) : (
                            <>
                              <i className="fas fa-file-invoice-dollar"></i>
                              <span style={{
                                position: 'absolute', top: '-5px', right: '-5px', backgroundColor: '#15803d',
                                borderRadius: '50%', width: '16px', height: '16px', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '10px',
                                border: '2px solid white'
                              }}>
                                <i className="fas fa-check" style={{ color: 'white', fontSize: '8px' }}></i>
                              </span>
                            </>
                          )}
                        </button>
                      )}

                      {rol === 'admin' && (
                        <button 
                          className="btn btn-sm btn-outline-danger mb-1"
                          onClick={() => onEliminar(cliente.id, cliente.nombre)}
                          title="Eliminar Cliente"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TablaClientes;