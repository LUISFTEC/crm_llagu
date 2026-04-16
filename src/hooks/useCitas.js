// hooks/useCitas.js
import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase-config';

export const useCitas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ordenar por fecha y hora
    const q = query(collection(db, 'citas'), orderBy('fecha', 'desc'), orderBy('hora', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCitas(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const agregarCita = async (citaData) => {
    try {
      const docRef = await addDoc(collection(db, 'citas'), {
        ...citaData,
        createdAt: new Date().toISOString()
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error al agregar cita:', error);
      return { success: false, error };
    }
  };

  const actualizarCita = async (id, citaData) => {
    try {
      await updateDoc(doc(db, 'citas', id), citaData);
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar cita:', error);
      return { success: false, error };
    }
  };

  const eliminarCita = async (id) => {
    try {
      await deleteDoc(doc(db, 'citas', id));
      return { success: true };
    } catch (error) {
      console.error('Error al eliminar cita:', error);
      return { success: false, error };
    }
  };

  const getCitasPorMes = (mes) => {
    if (!mes) return citas;
    return citas.filter(cita => cita.fecha?.startsWith(mes));
  };

  const getCitasPorCliente = (clienteId) => {
    return citas.filter(cita => cita.clienteId === clienteId);
  };

  const getCitasPorEstado = (estado) => {
    return citas.filter(cita => cita.estado === estado);
  };

  return { 
    citas, 
    loading, 
    agregarCita, 
    actualizarCita, 
    eliminarCita,
    getCitasPorMes,
    getCitasPorCliente,
    getCitasPorEstado
  };
};

const agregarCita = async (citaData) => {
  console.log("📌 Llegó a agregarCita con:", citaData);  // ← Agrega esto
  
  try {
    const docRef = await addDoc(collection(db, 'citas'), {
      ...citaData,
      createdAt: new Date().toISOString()
    });
    console.log("📌 Documento creado:", docRef.id);  // ← Agrega esto
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error detallado:', error);  // ← Esto te dirá el error real
    return { success: false, error };
  }
};