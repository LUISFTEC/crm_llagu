// components/Agenda/ListaCitas.jsx
function ListaCitas({ citas, onEditar, onEliminar, filtroMes, rol }) {
  
  const getEstadoBadge = (estado) => {
    const classes = {
      'Pendiente': 'bg-warning text-dark',
      'Completada': 'bg-success',
      'Cancelada': 'bg-danger'
    };
    return classes[estado] || 'bg-secondary';
  };

  const getTipoIcono = (tipo) => {
    switch (tipo) {
      case 'Llamada': return 'fas fa-phone-alt';
      case 'Visita': return 'fas fa-building';
      case 'Reunión': return 'fas fa-users';
      case 'Seguimiento': return 'fas fa-tasks';
      default: return 'fas fa-calendar-alt';
    }
  };

  const citasFiltradas = filtroMes 
    ? citas.filter(cita => cita.fecha?.startsWith(filtroMes))
    : citas;

  const citasPorFecha = citasFiltradas.reduce((grupo, cita) => {
    const fecha = cita.fecha;
    if (!grupo[fecha]) grupo[fecha] = [];
    grupo[fecha].push(cita);
    return grupo;
  }, {});

  const fechasOrdenadas = Object.keys(citasPorFecha).sort().reverse();

  if (citasFiltradas.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="fas fa-calendar-alt fa-2x text-muted mb-2"></i>
        <p className="text-muted mb-0">No hay citas agendadas</p>
      </div>
    );
  }

  return (
    <div className="row g-2">
      {fechasOrdenadas.map(fecha => (
        <div key={fecha} className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white py-2">
              <small className="fw-bold">
                <i className="fas fa-calendar-day me-1"></i>
                {new Date(fecha).toLocaleDateString('es-ES', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}
              </small>
            </div>
            <div className="card-body p-0">
              {citasPorFecha[fecha].map(cita => (
                <div key={cita.id} className="border-bottom p-2 hover-bg-light">
                  <div className="row align-items-center g-1">
                    {/* COLUMNA 1: TIPO Y HORA */}
                    <div className="col-md-2">
                      <div className="d-flex align-items-center gap-2">
                        <i className={`${getTipoIcono(cita.tipo)} text-primary`} style={{ fontSize: '12px' }}></i>
                        <div>
                          <small className="fw-semibold d-block">{cita.tipo}</small>
                          <small className="text-muted" style={{ fontSize: '11px' }}>{cita.hora}</small>
                        </div>
                      </div>
                    </div>

                    {/* COLUMNA 2: CLIENTE */}
                    <div className="col-md-3">
                      <div className="d-flex align-items-center gap-2">
                        <i className="fas fa-user-circle text-secondary" style={{ fontSize: '12px' }}></i>
                        <div>
                          <small className="fw-semibold d-block">{cita.clienteNombre}</small>
                          <small className="text-muted" style={{ fontSize: '11px' }}>{cita.duracion}</small>
                        </div>
                      </div>
                    </div>

                    {/* 👇 COLUMNA NUEVA: ASESOR 👇 */}
                    <div className="col-md-3">
                      <div className="d-flex align-items-center gap-2">
                        <i className="fas fa-id-badge text-info" style={{ fontSize: '12px' }}></i>
                        <div>
                          <small className="text-muted d-block" style={{ fontSize: '9px', textTransform: 'uppercase' }}>Asesor</small>
                          <small className="fw-semibold" style={{ fontSize: '11px' }}>
                            {cita.creadoPorEmail ? cita.creadoPorEmail.split('@')[0] : 'Sistema'}
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* COLUMNA 4: ESTADO */}
                    <div className="col-md-2 text-center">
                      <span className={`badge ${getEstadoBadge(cita.estado)} px-2 py-1`} style={{ fontSize: '10px' }}>
                        {cita.estado}
                      </span>
                    </div>

                    {/* COLUMNA 5: ACCIONES */}
                    <div className="col-md-2 text-end">
                      <button 
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => onEditar(cita)}
                        style={{ padding: '2px 6px', fontSize: '11px' }}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      {rol === 'admin' && (
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => onEliminar(cita.id, cita.clienteNombre)}
                          style={{ padding: '2px 6px', fontSize: '11px' }}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {cita.notas && (
                    <div className="row mt-1">
                      <div className="col-12">
                        <small className="text-muted" style={{ fontSize: '10px' }}>
                          <i className="fas fa-sticky-note me-1"></i>
                          {cita.notas}
                        </small>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ListaCitas;