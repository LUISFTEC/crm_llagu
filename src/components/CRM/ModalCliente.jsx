// components/CRM/ModalCliente.jsx
import { useState, useEffect } from 'react';
import { ACUERDOS, ESTADOS_VENTA, SECTORES } from '../../constants';

function ModalCliente({ show, onClose, onSave, editMode, initialData, rol, userEmail }) {
  const [formData, setFormData] = useState({
    nombre: '', telefono: '', correo: '', dni: '', fechaContacto: '',
    acuerdo: 'Llamar', estadoVenta: 'Prospecto', 
    precio: '', sectorMz: '', mzLote: '', montoSeparacion: '', montoFinanciamiento: ''
  });
  
  const [errors, setErrors] = useState({});

  // 🔒 BLOQUEO ORIGINAL: Solo para AGENTES cuando el estado ORIGINAL es "Compró"
  const isCompleto = editMode && rol !== 'admin' && initialData?.estadoVenta === 'Compró';

  // 🔥 NUEVA LÓGICA DE BLOQUEO: Detectar si ya tiene cronograma generado
  const tienePlanGenerado = editMode && initialData?.planGenerado === true;

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nombre: '', telefono: '', correo: '', dni: '', 
        fechaContacto: new Date().toISOString().split('T')[0],
        acuerdo: 'Llamar', estadoVenta: 'Prospecto', 
        precio: '', sectorMz: '', mzLote: '', montoSeparacion: '', montoFinanciamiento: '',
        createdAt: new Date().toISOString()
      });
    }
    setErrors({});
  }, [initialData, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'dni') {
      const onlyNumbers = value.replace(/\D/g, '').slice(0, 8);
      setFormData({ ...formData, [name]: onlyNumbers });
    }
    else if (name === 'telefono') {
      const onlyNumbers = value.replace(/\D/g, '').slice(0, 9);
      setFormData({ ...formData, [name]: onlyNumbers });
    }
    else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
    const dniRegex = /^\d{8}$/;
    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (!dniRegex.test(formData.dni)) {
      newErrors.dni = 'El DNI debe tener 8 dígitos';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="modal-dialog modal-lg modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          
          <div className="modal-header" style={{ backgroundColor: initialData?.estadoVenta === 'Compró' ? '#f59e0b' : '#0d6efd', color: 'white' }}>
            <h5 className="modal-title fw-bold">
              {tienePlanGenerado ? (
                <><i className="fas fa-lock me-2"></i> Cliente con Cronograma Activo</>
              ) : initialData?.estadoVenta === 'Compró' ? (
                <><i className="fas fa-exclamation-triangle me-2"></i> Cliente - Compra Cerrada</>
              ) : (
                <>{editMode ? '✏️ Editar Información del Cliente' : '➕ Registro de Nuevo Prospecto'}</>
              )}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {/* MENSAJE DE ADVERTENCIA SOBRE BLOQUEO DE PRECIO */}
          {tienePlanGenerado && (
            <div className="alert alert-info m-3 mb-0 py-2">
              <i className="fas fa-info-circle me-2"></i>
              <strong>Nota:</strong> El precio está bloqueado porque ya existe un cronograma generado. El sector y lote siguen disponibles para cambios.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="row g-3">
                
                <div className="col-md-6">
                  <label className="form-label fw-bold">Nombre Completo *</label>
                  <input type="text" name="nombre" className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} value={formData.nombre} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">DNI / Documento *</label>
                  <input type="text" name="dni" className={`form-control ${errors.dni ? 'is-invalid' : ''}`} value={formData.dni} onChange={handleChange} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Teléfono</label>
                  <input type="tel" name="telefono" className="form-control" value={formData.telefono} onChange={handleChange} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Correo</label>
                  <input type="email" name="correo" className="form-control" value={formData.correo} onChange={handleChange} />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Fecha Contacto</label>
                  <input type="date" name="fechaContacto" className="form-control" value={formData.fechaContacto} onChange={handleChange} />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-bold text-primary">Acuerdo</label>
                  <select name="acuerdo" className="form-select border-primary" value={formData.acuerdo} onChange={handleChange}>
                    {ACUERDOS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold text-primary">Estado Venta</label>
                  <select 
                    name="estadoVenta" 
                    className="form-select border-primary" 
                    value={formData.estadoVenta} 
                    onChange={handleChange}
                    disabled={isCompleto || tienePlanGenerado} // Bloqueamos cambio de estado si ya hay plan
                  >
                    {ESTADOS_VENTA.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                {/* --- SECCIÓN DE DATOS DE LOTE (CUADRO VERDE) --- */}
                {['Compró', 'Separó', 'Financió'].includes(formData.estadoVenta) && (
                  <div className="col-12 row g-3 mt-1 bg-success bg-opacity-10 p-3 rounded mx-0">
                    
                    {/* MONTO / PRECIO: BLOQUEADO SI TIENE PLAN */}
                    <div className="col-md-4">
                      <label className="form-label fw-bold text-success">
                        {formData.estadoVenta === 'Compró' && 'Precio Final (S/)'}
                        {formData.estadoVenta === 'Separó' && 'Monto Separación (S/)'}
                        {formData.estadoVenta === 'Financió' && 'Monto Financiado (S/)'}
                      </label>
                      <input 
                        type="number" 
                        name={formData.estadoVenta === 'Compró' ? 'precio' : (formData.estadoVenta === 'Separó' ? 'montoSeparacion' : 'montoFinanciamiento')} 
                        className="form-control fw-bold" 
                        value={formData.estadoVenta === 'Compró' ? formData.precio : (formData.estadoVenta === 'Separó' ? formData.montoSeparacion : formData.montoFinanciamiento)} 
                        onChange={handleChange} 
                        disabled={isCompleto || tienePlanGenerado} // 🔒 BLOQUEADO
                      />
                      {tienePlanGenerado && <small className="text-muted" style={{fontSize: '11px'}}>🔒 Bloqueado por cronograma</small>}
                    </div>

                    {/* SECTOR: EDITABLE AUNQUE TENGA PLAN */}
                    <div className="col-md-4">
                      <label className="form-label fw-bold text-success">Sector</label>
                      <select 
                        name="sectorMz" 
                        className="form-select" 
                        value={formData.sectorMz} 
                        onChange={handleChange}
                        disabled={isCompleto} // ✅ Editable aunque tenga plan
                      >
                        <option value="">Seleccionar sector...</option>
                        {SECTORES.map(sector => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                    </div>

                    {/* MZ & LT: EDITABLE AUNQUE TENGA PLAN */}
                    <div className="col-md-4">
                      <label className="form-label fw-bold text-success">Mz & Lt</label>
                      <input 
                        type="text" 
                        name="mzLote" 
                        className="form-control" 
                        placeholder="Ej: Mz A Lt 5" 
                        value={formData.mzLote} 
                        onChange={handleChange} 
                        disabled={isCompleto} // ✅ Editable aunque tenga plan
                      />
                    </div>

                  </div>
                )}

              </div>
            </div>

            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary px-5">
                {editMode ? 'Actualizar Datos' : 'Guardar Registro'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}

export default ModalCliente;