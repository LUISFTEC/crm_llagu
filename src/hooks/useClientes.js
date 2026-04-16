// hooks/useClientes.js
import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase-config';

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'clientes'), (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClientes(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const agregarCliente = async (clienteData) => {
    try {
      const docRef = await addDoc(collection(db, 'clientes'), clienteData);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error al agregar:', error);
      return { success: false, error };
    }
  };

  const actualizarCliente = async (id, clienteData) => {
    try {
      await updateDoc(doc(db, 'clientes', id), clienteData);
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