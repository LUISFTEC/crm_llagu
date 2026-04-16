// components/CRM/CRMClientes.jsx
import { useState, useEffect } from 'react';
import { useClientes } from '../../hooks/useClientes';
import { useAuth } from '../../hooks/useAuth'; 
import { doc, getDoc } from 'firebase/firestore'; // 👈 Necesario para el nombre real
import { db } from '../../firebase-config';
import TablaClientes from './TablaClientes';
import ModalCliente from './ModalCliente';

function CRMClientes() {
  const { clientes, agregarCliente, actualizarCliente, eliminarCliente } = useClientes();
  const { user, rol } = useAuth();
  
  // 🆕 Estado para guardar el nombre real del usuario logueado
  const [nombreRealUsuario, setNombreRealUsuario] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState(null);

  // 🕵️ BUSCAR NOMBRE REAL: Se ejecuta cuando el usuario se loguea
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        try {
          const userRef = doc(db, 'usuarios', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setNombreRealUsuario(userSnap.data().nombre); // Captura "Ana Lopez" etc.
          }
        } catch (error) {
          console.error("Error obteniendo nombre del usuario:", error);
        }
      }
    };
    fetchUserData();
  }, [user]);

  const handleSave = async (formData) => {
    const ahora = new Date();
    const fechaHora = ahora.toLocaleString('es-PE', { 
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });

    const clienteData = {
      ...formData,
      nombre: formData.nombre.toUpperCase().trim(),
      updatedAt: fechaHora,
      
      // 🛡️ CAPTURA AUTOMÁTICA MEJORADA:
      // Si eres admin, permitimos que venga un asesorId/agente del modal (si lo habilitas luego)
      // Si eres asesor, ignoramos cualquier intento de hack y grabamos TU nombre real
      asesorId: rol === 'admin' ? (formData.asesorId || user.uid) : user.uid,
      
      // ⚠️ AQUÍ ESTÁ EL TRUCO: Usamos 'agente' para que coincida con tu Tabla
      agente: rol === 'admin' ? (formData.agente || 'Admin') : (nombreRealUsuario || user.email)
    };

    if (!editMode) {
      clienteData.createdAt = fechaHora;
    }

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

  const handleEliminar = async (id, nombre, clienteAsesorId) => {
    const puedeEliminar = rol === 'admin' || user.uid === clienteAsesorId;

    if (!puedeEliminar) {
      alert('No tienes permiso para eliminar prospectos de otros agentes.');
      return;
    }

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
        <div>
          <h2 className="fw-bold mb-0">Seguimiento de Ventas</h2>
          {/* 💡 Feedback visual para el usuario */}
          <p className="text-muted">
            Agente actual: <span className="badge bg-secondary">{nombreRealUsuario || 'Cargando...'}</span>
          </p>
        </div>
        
        <button 
          className="btn btn-primary shadow-sm" 
          onClick={() => {
            setEditMode(false);
            setSelectedCliente(null);
            setShowModal(true);
          }}
        >
          <i className="bi bi-person-plus-fill me-2"></i>
          Nuevo Prospecto
        </button>
      </div>

      <TablaClientes 
        clientes={clientes}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        rol={rol}
        currentUserId={user?.uid}
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
        rol={rol} 
      />
    </div>
  );
}

export default CRMClientes;