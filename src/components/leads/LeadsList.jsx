// components/Leads/LeadsList.jsx
import { useState } from 'react';
import { useClientes } from '../../hooks/useClientes';
import { useSeguimientos } from '../../hooks/useSeguimientos';

function LeadsList({ rol }) {
  const { clientes, loading } = useClientes();
  const [selectedLead, setSelectedLead] = useState(null);
  const { seguimientos, agregarSeguimiento } = useSeguimientos(selectedLead?.id);
  const [nota, setNota] = useState('');

  // Función para mapear estadoVenta a etapa del pipeline
  const getEtapa = (estadoVenta) => {
    switch (estadoVenta) {
      case 'Prospecto': return 'lead';
      case 'Negociación': return 'contactado';
      case 'Separó': return 'separado';
      case 'Compró': return 'vendido';
      case 'Financió': return 'financiado';
      default: return 'lead';
    }
  };

  const getEtapaColor = (etapaId) => {
    switch (etapaId) {
      case 'lead': return '#6366f1';
      case 'contactado': return '#3b82f6';
      case 'separado': return '#f59e0b';
      case 'vendido': return '#10b981';
      case 'financiado': return '#06b6d4';
      default: return '#6b7280';
    }
  };

  const getEtapaIcono = (etapaId) => {
    switch (etapaId) {
      case 'lead': return 'fas fa-star';
      case 'contactado': return 'fas fa-phone-alt';
      case 'separado': return 'fas fa-hand-holding-usd';
      case 'vendido': return 'fas fa-trophy';
      case 'financiado': return 'fas fa-credit-card';
      default: return 'fas fa-chart-line';
    }
  };

  const handleAgregarSeguimiento = async () => {
    if (!nota.trim() || !selectedLead) return;
    await agregarSeguimiento({
      leadId: selectedLead.id,
      asesorId: "usuario_actual",
      tipo: "llamada",
      nota: nota,
      fecha: new Date().toISOString()
    });
    setNota('');
  };

  const etapas = [
    { id: 'lead', nombre: 'Prospectos' },
    { id: 'contactado', nombre: 'Negociación' },
    { id: 'separado', nombre: 'Separados' },
    { id: 'vendido', nombre: 'Vendidos' },
    { id: 'financiado', nombre: 'Financiados' }
  ];

  // Filtrar clientes por etapa
  const leadsPorEtapa = (etapaId) => {
    return clientes.filter(c => getEtapa(c.estadoVenta) === etapaId);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-spinner fa-spin fa-2x text-primary mb-3"></i>
        <p className="text-muted">Cargando pipeline...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">
            <i className="fas fa-chart-line text-primary me-2"></i>
            Pipeline de Ventas
          </h2>
          <p className="text-muted mt-1">Haz clic en un cliente para ver su historial</p>
        </div>
        <div className="text-muted">
          <i className="fas fa-users me-1"></i> Total: {clientes.length} clientes
        </div>
      </div>
      
      <div className="row g-3">
        {etapas.map(etapa => {
          const leadsEtapa = leadsPorEtapa(etapa.id);
          const color = getEtapaColor(etapa.id);
          
          return (
            <div key={etapa.id} className="col-md-4 col-lg">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header py-2" style={{ backgroundColor: color, color: 'white' }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="small">
                      <i className={`${getEtapaIcono(etapa.id)} me-1`}></i>
                      <strong>{etapa.nombre}</strong>
                    </div>
                    <span className="badge bg-white text-dark rounded-pill px-2 py-1 fs-7">
                      {leadsEtapa.length}
                    </span>
                  </div>
                </div>
                <div className="card-body p-1" style={{ minHeight: '350px', maxHeight: '450px', overflowY: 'auto' }}>
                  {leadsEtapa.length === 0 ? (
                    <div className="text-center py-3 text-muted">
                      <i className="fas fa-inbox fa-1x mb-1"></i>
                      <p className="small mb-0">Sin clientes</p>
                    </div>
                  ) : (
                    leadsEtapa.map(cliente => (
                      <div 
                        key={cliente.id} 
                        className="card mb-1 shadow-sm cursor-pointer border-start border-2"
                        style={{ cursor: 'pointer', borderLeftColor: color }}
                        onClick={() => setSelectedLead(cliente)}
                      >
                        <div className="card-body p-2">
                          <div className="fw-semibold fs-6">{cliente.nombre}</div>
                          <div className="d-flex flex-wrap gap-2 mt-1">
                            <span className="small text-muted">
                              <i className="fas fa-id-card me-1"></i>{cliente.dni}
                            </span>
                            {cliente.telefono && (
                              <span className="small text-muted">
                                <i className="fab fa-whatsapp text-success me-1"></i>{cliente.telefono}
                              </span>
                            )}
                          </div>
                          <div className="small text-muted mt-1">
                            <i className="fas fa-user-circle me-1"></i>{cliente.agente}
                          </div>
                          {cliente.estadoVenta === 'Compró' && cliente.precio && (
                            <div className="small text-success mt-1">
                              <i className="fas fa-coin me-1"></i>S/ {cliente.precio.toLocaleString()}
                            </div>
                          )}
                          {cliente.estadoVenta === 'Separó' && cliente.montoSeparacion && (
                            <div className="small text-warning mt-1">
                              <i className="fas fa-hand-holding-usd me-1"></i>S/ {cliente.montoSeparacion.toLocaleString()}
                            </div>
                          )}
                          {cliente.estadoVenta === 'Financió' && cliente.precio && (
                            <div className="small text-info mt-1">
                              <i className="fas fa-credit-card me-1"></i>S/ {cliente.precio.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de detalles del cliente - igual pero más compacto */}
      {selectedLead && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-md modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header" style={{ backgroundColor: getEtapaColor(getEtapa(selectedLead.estadoVenta)), color: 'white', padding: '0.75rem 1rem' }}>
                <h6 className="modal-title mb-0">
                  <i className="fas fa-user-circle me-2"></i>
                  {selectedLead.nombre}
                </h6>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedLead(null)}></button>
              </div>
              <div className="modal-body p-3">
                <div className="row g-2">
                  <div className="col-6">
                    <small className="text-muted">Documento</small>
                    <div className="small">{selectedLead.dni}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Teléfono</small>
                    <div className="small">{selectedLead.telefono || 'No registrado'}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Correo</small>
                    <div className="small text-truncate">{selectedLead.correo || 'No registrado'}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Agente</small>
                    <div className="small">{selectedLead.agente}</div>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Estado</small>
                    <div>
                      <span className={`badge ${selectedLead.estadoVenta === 'Compró' ? 'bg-success' : selectedLead.estadoVenta === 'Separó' ? 'bg-warning' : selectedLead.estadoVenta === 'Financió' ? 'bg-info' : 'bg-secondary'}`}>
                        {selectedLead.estadoVenta}
                      </span>
                    </div>
                  </div>
                  {(selectedLead.estadoVenta === 'Compró' || selectedLead.estadoVenta === 'Separó' || selectedLead.estadoVenta === 'Financió') && (
                    <div className="col-6">
                      <small className="text-muted">Monto</small>
                      <div className="small fw-bold">
                        S/ {(selectedLead.precio || selectedLead.montoSeparacion || 0).toLocaleString()}
                      </div>
                    </div>
                  )}
                  {selectedLead.sectorMz && (
                    <div className="col-12">
                      <small className="text-muted">Ubicación</small>
                      <div className="small">{selectedLead.sectorMz}</div>
                    </div>
                  )}
                </div>

                <hr className="my-2" />
                
                <h6 className="mb-2 small fw-bold">
                  <i className="fas fa-history me-1"></i> Historial
                </h6>
                <div className="list-group mb-2" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                  {seguimientos.length === 0 ? (
                    <div className="text-muted text-center py-2 small">
                      <i className="fas fa-comment-slash me-1"></i> Sin seguimientos
                    </div>
                  ) : (
                    seguimientos.map(s => (
                      <div key={s.id} className="list-group-item p-2">
                        <small className="text-muted">{new Date(s.fecha).toLocaleString()}</small>
                        <p className="mb-0 small mt-1">{s.nota}</p>
                      </div>
                    ))
                  )}
                </div>
                
                <textarea 
                  className="form-control form-control-sm" 
                  rows="2"
                  value={nota} 
                  onChange={e => setNota(e.target.value)} 
                  placeholder="Escribe una nota..."
                ></textarea>
              </div>
              <div className="modal-footer py-2">
                <button className="btn btn-sm btn-secondary" onClick={() => setSelectedLead(null)}>Cerrar</button>
                <button className="btn btn-sm btn-primary" onClick={handleAgregarSeguimiento}>Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeadsList;