// components/Agenda/ListaCitas.jsx
function ListaCitas({ citas, onEditar, onEliminar, filtroMes }) {
  
  const getEstadoBadge = (estado) => {
    const classes = {
      'Pendiente': 'bg-warning text-dark',
      'Completada': 'bg-success',
      'Cancelada': 'bg-danger'
    };
    return classes[estado] || 'bg-secondary';
  };

  const getTipoIcon = (tipo) => {
    const icons = {
      'Llamada': '📞',
      'Visita': '🏠',
      'Reunión': '👥',
      'Seguimiento': '🔄'
    };
    return icons[tipo] || '📅';
  };

  // Filtrar citas por mes si hay filtro
  const citasFiltradas = filtroMes 
    ? citas.filter(cita => cita.fecha?.startsWith(filtroMes))
    : citas;

  // Agrupar citas por fecha
  const citasPorFecha = citasFiltradas.reduce((grupo, cita) => {
    const fecha = cita.fecha;
    if (!grupo[fecha]) grupo[fecha] = [];
    grupo[fecha].push(cita);
    return grupo;
  }, {});

  // Ordenar fechas
  const fechasOrdenadas = Object.keys(citasPorFecha).sort().reverse();

  if (citasFiltradas.length === 0) {
    return (
      <div className="text-center py-5">
        <div className="display-1 mb-3">📅</div>
        <h4 className="text-muted">No hay citas agendadas</h4>
        <p className="text-muted">Haz clic en "+ Nueva Cita" para programar una reunión</p>
      </div>
    );
  }

  return (
    <div className="row">
      {fechasOrdenadas.map(fecha => (
        <div key={fecha} className="col-12 mb-4">
          <div className="card shadow-sm border-0">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0">
                📅 {new Date(fecha).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h5>
            </div>
            <div className="card-body">
              {citasPorFecha[fecha].map(cita => (
                <div key={cita.id} className="card mb-2 border-start border-primary border-3">
                  <div className="card-body py-3">
                    <div className="row align-items-center">
                      <div className="col-md-3">
                        <h6 className="mb-1">
                          {getTipoIcon(cita.tipo)} {cita.tipo}
                        </h6>
                        <span className="badge bg-secondary">⏰ {cita.hora}</span>
                      </div>
                      <div className="col-md-3">
                        <strong>{cita.clienteNombre}</strong>
                        <br />
                        <small className="text-muted">Duración: {cita.duracion}</small>
                      </div>
                      <div className="col-md-3">
                        <span className={`badge ${getEstadoBadge(cita.estado)}`}>
                          {cita.estado}
                        </span>
                        {cita.recordatorio && (
                          <span className="badge bg-info ms-2">🔔 Recordatorio</span>
                        )}
                      </div>
                      <div className="col-md-3 text-end">
                        <button 
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => onEditar(cita)}
                        >
                          ✏️ Editar
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => onEliminar(cita.id, cita.clienteNombre)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                    {cita.notas && (
                      <div className="row mt-2">
                        <div className="col-12">
                          <small className="text-muted">
                            📝 Notas: {cita.notas}
                          </small>
                        </div>
                      </div>
                    )}
                  </div>
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