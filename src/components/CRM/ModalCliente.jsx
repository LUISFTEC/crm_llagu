// components/CRM/ModalCliente.jsx
import { useState, useEffect } from 'react';
import { ACUERDOS, ESTADOS_VENTA, SECTORES } from '../../constants';

function ModalCliente({ show, onClose, onSave, editMode, initialData, rol }) {
  const [formData, setFormData] = useState({
    nombre: '', telefono: '', correo: '', dni: '', fechaContacto: '',
    acuerdo: 'Llamar', estadoVenta: 'Prospecto', 
    precio: '', sectorMz: '', montoSeparacion: '', montoFinanciamiento: ''
  });
  
  const [errors, setErrors] = useState({});

  // 🔒 BLOQUEO: Solo para AGENTES cuando el estado ORIGINAL es "Compró"
  const isCompleto = editMode && rol !== 'admin' && initialData?.estadoVenta === 'Compró';

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nombre: '', telefono: '', correo: '', dni: '', 
        fechaContacto: new Date().toISOString().split('T')[0],
        acuerdo: 'Llamar', estadoVenta: 'Prospecto', 
        precio: '', sectorMz: '', montoSeparacion: '', montoFinanciamiento: ''
      });
    }
    setErrors({});
  }, [initialData, show]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validar DNI: solo números y máximo 8 dígitos
    if (name === 'dni') {
      const onlyNumbers = value.replace(/\D/g, '').slice(0, 8);
      setFormData({ ...formData, [name]: onlyNumbers });
    }
    // Validar Teléfono: solo números y máximo 9 dígitos
    else if (name === 'telefono') {
      const onlyNumbers = value.replace(/\D/g, '').slice(0, 9);
      setFormData({ ...formData, [name]: onlyNumbers });
    }
    // Otros campos
    else {
      setFormData({ ...formData, [name]: value });
    }
    
    // Limpiar error del campo cuando el usuario escribe
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validación nombre
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    
    // Validación DNI: solo números y 8 dígitos
    const dniRegex = /^\d{8}$/;
    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI es obligatorio';
    } else if (!dniRegex.test(formData.dni)) {
      newErrors.dni = 'El DNI debe tener exactamente 8 dígitos numéricos';
    }
    
    // Validación Teléfono (si tiene teléfono)
    if (formData.telefono && !/^\d{9}$/.test(formData.telefono)) {
      newErrors.telefono = 'El teléfono debe tener exactamente 9 dígitos numéricos';
    }
    
    // Validación para estado "Compró"
    if (formData.estadoVenta === 'Compró') {
      if (!formData.precio || parseFloat(formData.precio) <= 0) {
        newErrors.precio = 'Debe ingresar un precio válido';
      }
      if (!formData.sectorMz.trim()) {
        newErrors.sectorMz = 'Debe seleccionar un sector';
      }
    }
    
    // Validación para estado "Separó"
    if (formData.estadoVenta === 'Separó') {
      if (!formData.montoSeparacion || parseFloat(formData.montoSeparacion) <= 0) {
        newErrors.montoSeparacion = 'Debe ingresar el monto de separación';
      }
    }
    
    // Validación para estado "Financió"
    if (formData.estadoVenta === 'Financió') {
      if (!formData.montoFinanciamiento || parseFloat(formData.montoFinanciamiento) <= 0) {
        newErrors.montoFinanciamiento = 'Debe ingresar el monto financiado';
      }
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
              {initialData?.estadoVenta === 'Compró' ? (
                <><i className="fas fa-exclamation-triangle me-2"></i> Cliente - Compra Cerrada</>
              ) : (
                <>{editMode ? '✏️ Editar Información del Cliente' : '➕ Registro de Nuevo Prospecto'}</>
              )}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          {initialData?.estadoVenta === 'Compró' && rol === 'admin' && (
            <div className="alert alert-warning m-3 mb-0">
              <i className="fas fa-exclamation-triangle me-2"></i>
              ⚠️ ESTE CLIENTE YA ESTÁ EN "COMPRÓ". Solo el ADMIN puede modificar precio, sector y estado.
            </div>
          )}

          {isCompleto && (
            <div className="alert alert-info m-3 mb-0">
              <i className="fas fa-info-circle me-2"></i>
              ℹ️ Este cliente ya completó la compra. Puedes editar datos personales, pero NO el estado, precio ni sector.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <div className="row g-3">
                
                {/* --- CAMPOS SIEMPRE EDITABLES (incluso en Compró) --- */}
                <div className="col-md-6">
                  <label className="form-label fw-bold">Nombre Completo *</label>
                  <input 
                    type="text" name="nombre" 
                    className={`form-control ${errors.nombre ? 'is-invalid' : ''}`} 
                    placeholder="Ej: JUAN PEREZ" 
                    value={formData.nombre} 
                    onChange={handleChange} 
                  />
                  {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-bold">DNI / Documento *</label>
                  <input 
                    type="text" name="dni" 
                    className={`form-control ${errors.dni ? 'is-invalid' : ''}`} 
                    placeholder="12345678" 
                    value={formData.dni} 
                    onChange={handleChange} 
                  />
                  {errors.dni && <div className="invalid-feedback">{errors.dni}</div>}
                  <small className="text-muted">8 dígitos numéricos</small>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Teléfono</label>
                  <input 
                    type="tel" name="telefono" 
                    className={`form-control ${errors.telefono ? 'is-invalid' : ''}`} 
                    placeholder="999999999" 
                    value={formData.telefono} 
                    onChange={handleChange} 
                  />
                  {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
                  <small className="text-muted">9 dígitos</small>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Correo</label>
                  <input 
                    type="email" name="correo" 
                    className="form-control" 
                    placeholder="ejemplo@correo.com" 
                    value={formData.correo} 
                    onChange={handleChange} 
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Fecha Contacto</label>
                  <input 
                    type="date" name="fechaContacto" 
                    className="form-control" 
                    value={formData.fechaContacto} 
                    onChange={handleChange} 
                  />
                </div>
                
                <div className="col-md-6">
                  <label className="form-label fw-bold text-primary">Acuerdo</label>
                  <select 
                    name="acuerdo" 
                    className="form-select border-primary" 
                    value={formData.acuerdo} 
                    onChange={handleChange}
                  >
                    {ACUERDOS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                {/* --- CAMPOS CRÍTICOS (BLOQUEADOS si isCompleto) --- */}
                <div className="col-md-6">
                  <label className="form-label fw-bold text-primary">Estado Venta</label>
                  <select 
                    name="estadoVenta" 
                    className="form-select border-primary" 
                    value={formData.estadoVenta} 
                    onChange={handleChange}
                    disabled={isCompleto}
                  >
                    {ESTADOS_VENTA.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                  {isCompleto && <small className="text-muted">Bloqueado - Cliente ya completó compra</small>}
                </div>

                {/* --- CAMPOS DINÁMICOS SEGÚN ESTADO --- */}
                {formData.estadoVenta === 'Compró' && (
                  <div className="col-12 row g-3 mt-1 bg-success bg-opacity-10 p-3 rounded">
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-success">Precio Final (S/)</label>
                      <input 
                        type="number" name="precio" 
                        className={`form-control ${errors.precio ? 'is-invalid' : ''}`} 
                        placeholder="0.00" 
                        value={formData.precio} 
                        onChange={handleChange} 
                        disabled={isCompleto}
                      />
                      {errors.precio && <div className="invalid-feedback">{errors.precio}</div>}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold text-success">Sector</label>
                      <select 
                        name="sectorMz" 
                        className={`form-select ${errors.sectorMz ? 'is-invalid' : ''}`} 
                        value={formData.sectorMz} 
                        onChange={handleChange}
                        disabled={isCompleto}
                      >
                        <option value="">Seleccionar sector...</option>
                        {SECTORES.map(sector => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                      {errors.sectorMz && <div className="invalid-feedback">{errors.sectorMz}</div>}
                    </div>
                  </div>
                )}

                {formData.estadoVenta === 'Separó' && (
                  <div className="col-12 bg-warning bg-opacity-10 p-3 rounded">
                    <label className="form-label fw-bold text-warning">Monto Separación (S/)</label>
                    <input 
                      type="number" name="montoSeparacion" 
                      className={`form-control ${errors.montoSeparacion ? 'is-invalid' : ''}`} 
                      placeholder="0.00" 
                      value={formData.montoSeparacion} 
                      onChange={handleChange} 
                      disabled={isCompleto}
                    />
                    {errors.montoSeparacion && <div className="invalid-feedback">{errors.montoSeparacion}</div>}
                  </div>
                )}

                {formData.estadoVenta === 'Financió' && (
                  <div className="col-12 bg-info bg-opacity-10 p-3 rounded">
                    <label className="form-label fw-bold text-info">Monto Financiado (S/)</label>
                    <input 
                      type="number" name="montoFinanciamiento" 
                      className={`form-control ${errors.montoFinanciamiento ? 'is-invalid' : ''}`} 
                      placeholder="0.00" 
                      value={formData.montoFinanciamiento} 
                      onChange={handleChange} 
                      disabled={isCompleto}
                    />
                    {errors.montoFinanciamiento && <div className="invalid-feedback">{errors.montoFinanciamiento}</div>}
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