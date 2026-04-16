import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from './useAuth'; // 👈 IMPORTAMOS EL USUARIO

export const useClientes = () => {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, rol } = useAuth(); // 👈 OBTENEMOS LOS DATOS DE SESIÓN

  useEffect(() => {
    // Si no hay usuario logueado, no hacemos nada
    if (!user) return;

    let consulta;
    
    // Aplicamos el filtro de seguridad según el rol
    if (rol === 'admin') {
      consulta = collection(db, 'clientes');
    } else {
      consulta = query(collection(db, 'clientes'), where("asesorId", "==", user.uid));
    }

    // Usamos la 'consulta' filtrada en lugar de la colección completa
    const unsubscribe = onSnapshot(consulta, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setClientes(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error en onSnapshot de clientes:", error);
    });

    return () => unsubscribe();
  }, [user, rol]); // 👈 Agregamos dependencias

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