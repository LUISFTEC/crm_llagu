import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase-config';
import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore'; 
import TablaClientes from './TablaClientes';
import ModalCliente from './ModalCliente';

// 🔥 1. AQUI IMPORTAMOS EL NUEVO PANEL DE LA MAGIA
import ModalNuevaVenta from './ModalNuevaVenta'; 

function CRMClientes() {
  const { user, rol } = useAuth();
  const [modalActivo, setModalActivo] = useState(''); 
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // GUARDAR CLIENTE
  const handleSaveCliente = async (datos) => {
    try {
      if (editMode && clienteSeleccionado?.id) {
        const docRef = doc(db, 'clientes', clienteSeleccionado.id);
        await updateDoc(docRef, datos);
        console.log('✅ Cliente actualizado:', clienteSeleccionado.id);
      } else {
        const docRef = await addDoc(collection(db, 'clientes'), datos);
        console.log('✅ Nuevo cliente creado:', docRef.id);
      }
      
      setModalActivo('');
      setClienteSeleccionado(null);
      setEditMode(false);
      
    } catch (error) {
      console.error('❌ Error al guardar:', error);
      alert('Error al guardar los datos.');
    }
  };

  // ELIMINAR CLIENTE
  const handleEliminarCliente = async (id, nombre) => {
    const confirmar = window.confirm(`¿Estás seguro de eliminar a ${nombre}?`);
    if (!confirmar) return;
    
    try {
      const docRef = doc(db, 'clientes', id);
      await deleteDoc(docRef);
      console.log('🗑️ Cliente eliminado:', id);
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      alert('Error al eliminar el cliente.');
    }
  };

  return (
    <div className="container-fluid px-4 pt-4">
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0">
            <i className="fas fa-chart-line me-2"></i> Seguimiento de Ventas
          </h2>
          <p className="text-muted mt-2 mb-0 fs-6">
            Agente actual: <span className="badge bg-secondary">{rol === 'admin' ? 'Administrador' : 'Asesor'}</span>
          </p>
        </div>
        
        <button 
          className="btn btn-primary shadow-sm px-4 py-2" 
          onClick={() => {
            setClienteSeleccionado(null);
            setEditMode(false);
            setModalActivo('cliente');
          }}
        >
          <i className="fas fa-plus-circle me-2"></i> Nuevo Prospecto
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <TablaClientes 
          rol={rol}
          onEditar={(cliente) => {
            setClienteSeleccionado(cliente);
            setEditMode(true);
            setModalActivo('cliente');
          }}
          onEliminar={handleEliminarCliente}
          onRegistrarVenta={(cliente) => {
            setClienteSeleccionado(cliente);
            setModalActivo('venta'); // 👈 Esto activa el nuevo modal
          }}
        />
      </div>
      
      <ModalCliente
        show={modalActivo === 'cliente'}
        initialData={clienteSeleccionado}
        editMode={editMode}
        rol={rol}
        userEmail={user?.email}
        onClose={() => {
          setModalActivo('');
          setClienteSeleccionado(null);
          setEditMode(false);
        }}
        onSave={handleSaveCliente}
      />

      {/* 🔥 2. AQUI CONECTAMOS EL PANEL FINANCIERO AL FINAL DE TODO */}
      <ModalNuevaVenta
        show={modalActivo === 'venta'}
        cliente={clienteSeleccionado}
        onClose={() => {
          setModalActivo('');
          setClienteSeleccionado(null);
        }}
      />

    </div>
  );
}

export default CRMClientes;