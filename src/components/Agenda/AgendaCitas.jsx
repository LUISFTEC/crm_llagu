// components/Agenda/AgendaCitas.jsx
import { useState } from 'react';
import { useCitas } from '../../hooks/useCitas';
import { useClientes } from '../../hooks/useClientes';
import { useAuth } from '../../hooks/useAuth';
import ListaCitas from './ListaCitas';
import FormularioCita from './FormularioCita';

function AgendaCitas({ onSwitchToCRM }) {
  const { citas, agregarCita, actualizarCita, eliminarCita } = useCitas();
  const { clientes } = useClientes();
  const { user, rol } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCita, setSelectedCita] = useState(null);
  const [filtroMes, setFiltroMes] = useState(new Date().toISOString().slice(0, 7));

  const handleSave = async (formData) => {
    let result;
    if (editMode && selectedCita) {
      result = await actualizarCita(selectedCita.id, formData);
    } else {
      result = await agregarCita(formData);
    }

    if (result.success) {
      setShowModal(false);
      setEditMode(false);
      setSelectedCita(null);
    } else {
      alert('Error al guardar la cita');
    }
  };

  const handleEditar = (cita) => {
    setSelectedCita(cita);
    setEditMode(true);
    setShowModal(true);
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Eliminar cita con ${nombre}?`)) {
      const result = await eliminarCita(id);
      if (!result.success) {
        alert('Error al eliminar la cita');
      }
    }
  };

  const citasDelMes = citas.filter(c => !filtroMes || c.fecha?.startsWith(filtroMes));

  return (
    <div className="container-fluid px-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h5 className="fw-bold mb-0">📅 Agenda de Citas</h5>
        
        <div className="d-flex gap-2">
          <div className="d-flex align-items-center gap-1">
            <label className="small fw-bold">Filtrar mes:</label>
            <input 
              type="month" 
              className="form-control form-control-sm"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              style={{ width: '150px' }}
            />
          </div>
          
          <button 
            className="btn btn-sm btn-primary" 
            onClick={() => {
              setEditMode(false);
              setSelectedCita(null);
              setShowModal(true);
            }}
          >
            + Nueva Cita
          </button>
        </div>
      </div>

      {/* Resumen de citas - Colores vivos */}
      <div className="row g-2 mb-3">
        <div className="col-3 col-md-3">
          <div className="card bg-warning text-dark border-0 shadow-sm">
            <div className="card-body py-2 px-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="fw-bold">Pendientes</small>
                  <h4 className="mb-0 fw-bold">{citasDelMes.filter(c => c.estado === 'Pendiente').length}</h4>
                </div>
                <i className="fas fa-clock fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-3 col-md-3">
          <div className="card bg-success text-white border-0 shadow-sm">
            <div className="card-body py-2 px-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="fw-bold">Completadas</small>
                  <h4 className="mb-0 fw-bold">{citasDelMes.filter(c => c.estado === 'Completada').length}</h4>
                </div>
                <i className="fas fa-check-circle fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-3 col-md-3">
          <div className="card bg-danger text-white border-0 shadow-sm">
            <div className="card-body py-2 px-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="fw-bold">Canceladas</small>
                  <h4 className="mb-0 fw-bold">{citasDelMes.filter(c => c.estado === 'Cancelada').length}</h4>
                </div>
                <i className="fas fa-times-circle fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
        <div className="col-3 col-md-3">
          <div className="card bg-primary text-white border-0 shadow-sm">
            <div className="card-body py-2 px-2">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="fw-bold">Total</small>
                  <h4 className="mb-0 fw-bold">{citasDelMes.length}</h4>
                </div>
                <i className="fas fa-calendar-alt fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de citas */}
      <ListaCitas 
        citas={citas}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        filtroMes={filtroMes}
        rol={rol}
      />

      {/* Modal formulario */}
      <FormularioCita
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditMode(false);
          setSelectedCita(null);
        }}
        onSave={handleSave}
        editMode={editMode}
        initialData={selectedCita}
        clientes={clientes}
        onSwitchToCRM={onSwitchToCRM}
      />
    </div>
  );
}

export default AgendaCitas;