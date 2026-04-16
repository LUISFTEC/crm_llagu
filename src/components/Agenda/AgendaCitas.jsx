// components/Agenda/AgendaCitas.jsx
import { useState } from 'react';
import { useCitas } from '../../hooks/useCitas';
import { useClientes } from '../../hooks/useClientes';
import ListaCitas from './ListaCitas';
import FormularioCita from './FormularioCita';

function AgendaCitas({ onSwitchToCRM }) {  // ← RECIBE el prop aquí
  const { citas, agregarCita, actualizarCita, eliminarCita } = useCitas();
  const { clientes } = useClientes();
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

  return (
    <div className="container-fluid px-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="fw-bold mb-0">📅 Agenda de Citas</h2>
        
        <div className="d-flex gap-3">
          {/* Filtro por mes */}
          <div className="d-flex align-items-center gap-2">
            <label className="fw-bold">Filtrar mes:</label>
            <input 
              type="month" 
              className="form-control"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              style={{ width: '180px' }}
            />
          </div>
          
          <button 
            className="btn btn-primary" 
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

      {/* Resumen de citas */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h5 className="card-title">⏳ Pendientes</h5>
              <h2 className="mb-0">
                {citas.filter(c => c.estado === 'Pendiente' && (!filtroMes || c.fecha?.startsWith(filtroMes))).length}
              </h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">✅ Completadas</h5>
              <h2 className="mb-0">
                {citas.filter(c => c.estado === 'Completada' && (!filtroMes || c.fecha?.startsWith(filtroMes))).length}
              </h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-danger text-white">
            <div className="card-body">
              <h5 className="card-title">❌ Canceladas</h5>
              <h2 className="mb-0">
                {citas.filter(c => c.estado === 'Cancelada' && (!filtroMes || c.fecha?.startsWith(filtroMes))).length}
              </h2>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">📊 Total</h5>
              <h2 className="mb-0">
                {citas.filter(c => !filtroMes || c.fecha?.startsWith(filtroMes)).length}
              </h2>
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
        onSwitchToCRM={onSwitchToCRM}  // ← PASA el prop aquí
      />
    </div>
  );
}

export default AgendaCitas;