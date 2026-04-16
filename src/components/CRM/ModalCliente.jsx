// components/CRM/ModalCliente.jsx
import { useState, useEffect } from 'react';
import { AGENTES, ACUERDOS, ESTADOS_VENTA } from '../../constants';

function ModalCliente({ show, onClose, onSave, editMode, initialData }) {
  const [formData, setFormData] = useState({
    nombre: '', telefono: '', correo: '', dni: '', fechaContacto: '',
    acuerdo: 'Llamar', estadoVenta: 'Prospecto', agente: AGENTES[0],
    precio: '', sectorMz: '', montoSeparacion: '', montoFinanciamiento: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.dni.trim()) {
      alert('Nombre y DNI son obligatorios');
      return;
    }
    onSave(formData);
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">
              {editMode ? '✏️ Editar Cliente' : '➕ Nuevo Cliente'}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Nombre Completo *</label>
                  <input type="text" name="nombre" className="form-control" value={formData.nombre} onChange={handleChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">DNI *</label>
                  <input type="text" name="dni" className="form-control" value={formData.dni} onChange={handleChange} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Teléfono</label>
                  <input type="text" name="telefono" className="form-control" value={formData.telefono} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Correo</label>
                  <input type="email" name="correo" className="form-control" value={formData.correo} onChange={handleChange} />
                </div>
                <div className="col-md-4">
                  <label className="form-label">Fecha Contacto</label>
                  <input type="date" name="fechaContacto" className="form-control" value={formData.fechaContacto} onChange={handleChange} />
                </div>
                
                <div className="col-md-4">
                  <label className="form-label">Acuerdo</label>
                  <select name="acuerdo" className="form-select" value={formData.acuerdo} onChange={handleChange}>
                    {ACUERDOS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Estado Venta</label>
                  <select name="estadoVenta" className="form-select" value={formData.estadoVenta} onChange={handleChange}>
                    {ESTADOS_VENTA.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label">Agente</label>
                  <select name="agente" className="form-select" value={formData.agente} onChange={handleChange}>
                    {AGENTES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                {/* CAMPOS CONDICIONALES */}
                {formData.estadoVenta === 'Compró' && (
                  <div className="row g-3 mt-1 bg-success bg-opacity-10 p-3 rounded">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Precio Final (S/)</label>
                      <input 
                        type="number" 
                        name="precio"
                        className="form-control" 
                        placeholder="0.00" 
                        value={formData.precio} 
                        onChange={handleChange} 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Sector / Manzana</label>
                      <input 
                        type="text" 
                        name="sectorMz"
                        className="form-control" 
                        placeholder="Ej: Sector A - Mz J" 
                        value={formData.sectorMz} 
                        onChange={handleChange} 
                      />
                    </div>
                  </div>
                )}

                {formData.estadoVenta === 'Separó' && (
                  <div className="col-12 bg-warning bg-opacity-10 p-3 rounded">
                    <label className="form-label fw-bold">Monto de Separación (S/)</label>
                    <input 
                      type="number" 
                      name="montoSeparacion"
                      className="form-control" 
                      placeholder="0.00" 
                      value={formData.montoSeparacion} 
                      onChange={handleChange} 
                    />
                  </div>
                )}

                {formData.estadoVenta === 'Financió' && (
                  <div className="col-12 bg-info bg-opacity-10 p-3 rounded">
                    <label className="form-label fw-bold">Monto Financiado (S/)</label>
                    <input 
                      type="number" 
                      name="montoFinanciamiento"
                      className="form-control" 
                      placeholder="0.00" 
                      value={formData.montoFinanciamiento} 
                      onChange={handleChange} 
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary px-5">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ModalCliente;