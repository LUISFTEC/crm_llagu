// components/Agenda/FormularioCita.jsx
import { useState, useEffect } from 'react';
import { TIPOS_CITA, ESTADOS_CITA, DURACION_CITA } from '../../constants';

function FormularioCita({ show, onClose, onSave, editMode, initialData, clientes, onSwitchToCRM }) {
  const [formData, setFormData] = useState({
    clienteId: '',
    clienteNombre: '',
    fecha: '',
    hora: '10:00',
    duracion: '30 min',
    tipo: 'Llamada',
    estado: 'Pendiente',
    notas: '',
    recordatorio: false
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleClienteChange = (e) => {
    const clienteId = e.target.value;
    const cliente = clientes.find(c => c.id === clienteId);
    setFormData({
      ...formData,
      clienteId: clienteId,
      clienteNombre: cliente ? cliente.nombre : ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log("🔍 PASO 1: Submit ejecutado");
    console.log("🔍 PASO 2: formData actual:", formData);
    
    // Validación 1
    if (!formData.clienteId) {
      console.log("❌ ERROR: clienteId está vacío");
      alert('Debes seleccionar un cliente');
      return;
    }
    
    // Validación 2
    if (!formData.fecha) {
      console.log("❌ ERROR: fecha está vacía");
      alert('Debes seleccionar una fecha');
      return;
    }
    
    // Validación 3
    if (!formData.hora) {
      console.log("❌ ERROR: hora está vacía");
      alert('Debes seleccionar una hora');
      return;
    }
    
    console.log("✅ PASO 3: Validaciones pasadas");
    console.log("✅ PASO 4: Llamando a onSave con:", formData);
    
    try {
      onSave(formData);
      console.log("✅ PASO 5: onSave ejecutado sin errores");
    } catch (error) {
      console.log("❌ PASO 5 ERROR: onSave falló:", error);
    }
  };

  const handleSwitchToCRM = () => {
    onClose(); // Cerrar el modal de cita
    if (onSwitchToCRM) {
      onSwitchToCRM(); // Cambiar a la pestaña de CRM
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              {editMode ? '✏️ Editar Cita' : '📅 Nueva Cita'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-12">
                  <label className="form-label required">Cliente *</label>
                  
                  {clientes.length === 0 ? (
                    <div className="alert alert-warning mt-2">
                      <i className="bi bi-exclamation-triangle me-2"></i>
                      ⚠️ No hay clientes registrados en el sistema.
                      <button 
                        type="button"
                        className="btn btn-link p-0 ms-2 text-decoration-none"
                        onClick={handleSwitchToCRM}
                        style={{ verticalAlign: 'baseline' }}
                      >
                        ➕ Ir a CRM Ventas para registrar un cliente
                      </button>
                    </div>
                  ) : (
                    <select 
                      name="clienteId"
                      className="form-select"
                      value={formData.clienteId}
                      onChange={handleClienteChange}
                      required
                    >
                      <option value="">Seleccionar cliente...</option>
                      {clientes.map(cliente => (
                        <option key={cliente.id} value={cliente.id}>
                          {cliente.nombre} - {cliente.dni}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="col-md-6">
                  <label className="form-label required">Fecha *</label>
                  <input 
                    type="date"
                    name="fecha"
                    className="form-control"
                    value={formData.fecha}
                    onChange={handleChange}
                    required
                    disabled={clientes.length === 0}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label required">Hora *</label>
                  <input 
                    type="time"
                    name="hora"
                    className="form-control"
                    value={formData.hora}
                    onChange={handleChange}
                    required
                    disabled={clientes.length === 0}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Duración</label>
                  <select 
                    name="duracion"
                    className="form-select"
                    value={formData.duracion}
                    onChange={handleChange}
                    disabled={clientes.length === 0}
                  >
                    {DURACION_CITA.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Tipo de Cita</label>
                  <select 
                    name="tipo"
                    className="form-select"
                    value={formData.tipo}
                    onChange={handleChange}
                    disabled={clientes.length === 0}
                  >
                    {TIPOS_CITA.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Estado</label>
                  <select 
                    name="estado"
                    className="form-select"
                    value={formData.estado}
                    onChange={handleChange}
                    disabled={clientes.length === 0}
                  >
                    {ESTADOS_CITA.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Recordatorio</label>
                  <div className="form-check mt-2">
                    <input 
                      type="checkbox"
                      name="recordatorio"
                      className="form-check-input"
                      checked={formData.recordatorio}
                      onChange={handleChange}
                      disabled={clientes.length === 0}
                    />
                    <label className="form-check-label">
                      Enviar recordatorio
                    </label>
                  </div>
                </div>

                <div className="col-md-12">
                  <label className="form-label">Notas / Observaciones</label>
                  <textarea 
                    name="notas"
                    className="form-control"
                    rows="3"
                    value={formData.notas}
                    onChange={handleChange}
                    placeholder="Detalles de la cita, temas a tratar, etc."
                    disabled={clientes.length === 0}
                  ></textarea>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn btn-primary px-5"
                disabled={clientes.length === 0}
              >
                {editMode ? 'Actualizar Cita' : 'Guardar Cita'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FormularioCita;