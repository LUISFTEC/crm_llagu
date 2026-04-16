// components/CRM/CRMClientes.jsx
import { useState } from 'react';
import { useClientes } from '../../hooks/useClientes';
import TablaClientes from './TablaClientes';
import ModalCliente from './ModalCliente';

function CRMClientes() {
  const { clientes, agregarCliente, actualizarCliente, eliminarCliente } = useClientes();
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);

  const handleSave = async (formData) => {
    const clienteData = {
      ...formData,
      nombre: formData.nombre.toUpperCase().trim(),
      createdAt: new Date().toISOString()
    };

    let result;
    if (editMode && selectedCliente) {
      result = await actualizarCliente(selectedCliente.id, clienteData);
    } else {
      result = await agregarCliente(clienteData);
    }

    if (result.success) {
      setShowModal(false);
      setEditMode(false);
      setSelectedCliente(null);
    } else {
      alert('Error al guardar el cliente');
    }
  };

  const handleEditar = (cliente) => {
    setSelectedCliente(cliente);
    setEditMode(true);
    setShowModal(true);
  };

  const handleEliminar = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de eliminar a ${nombre}?`)) {
      const result = await eliminarCliente(id);
      if (!result.success) {
        alert('Error al eliminar el cliente');
      }
    }
  };

  return (
    <div className="container-fluid px-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold mb-0">Seguimiento de Ventas</h2>
        <button 
          className="btn btn-primary" 
          onClick={() => {
            setEditMode(false);
            setSelectedCliente(null);
            setShowModal(true);
          }}
        >
          + Nuevo Prospecto
        </button>
      </div>

      <TablaClientes 
        clientes={clientes}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
      />

      <ModalCliente
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditMode(false);
          setSelectedCliente(null);
        }}
        onSave={handleSave}
        editMode={editMode}
        initialData={selectedCliente}
      />
    </div>
  );
}

export default CRMClientes;