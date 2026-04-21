import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from './useAuth'; 

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); 

  useEffect(() => {
    if (!user) return;

    const consulta = collection(db, 'clientes');

    const unsubscribe = onSnapshot(consulta, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClientes(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error en onSnapshot de clientes:", error);
    });

    return () => unsubscribe();
  }, [user]); 

  const agregarCliente = async (clienteData) => {
    try {
      // 👇 Capturamos quién CREÓ al cliente
      const datosConAuditoria = {
        ...clienteData,
        creadoPorId: user.uid,
        creadoPorEmail: user.email,
        fechaCreacion: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'clientes'), datosConAuditoria);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error al agregar:', error);
      return { success: false, error };
    }
  };

  const actualizarCliente = async (id, clienteData) => {
    try {
      // 👇 Capturamos quién ACTUALIZÓ al cliente
      const datosConAuditoria = {
        ...clienteData,
        ultimaEdicionPorId: user.uid,
        ultimaEdicionPorEmail: user.email,
        fechaUltimaEdicion: new Date().toISOString()
      };

      await updateDoc(doc(db, 'clientes', id), datosConAuditoria);
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar:', error);
      return { success: false, error };
    }
  };

  const eliminarCliente = async (id) => {
    try {
      await deleteDoc(doc(db, 'clientes', id));
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar:', error);
      return { success: false, error };
    }
  };

  return { clientes, loading, agregarCliente, actualizarCliente, eliminarCliente };
};