// hooks/useCitas.js
import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from './useAuth'; // 👈 IMPORTAMOS EL USUARIO

export const useCitas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // 👈 OBTENEMOS LOS DATOS DEL AGENTE

  useEffect(() => {
    // Si no hay usuario logueado, no hacemos nada
    if (!user) return;

    // Ordenar por fecha y hora
    const q = query(collection(db, 'citas'), orderBy('fecha', 'desc'), orderBy('hora', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCitas(docs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]); // 👈 Dependencia del usuario

  const agregarCita = async (citaData) => {
    console.log("📌 Llegó a agregarCita con:", citaData);
    
    try {
      // 👇 Capturamos quién CREÓ la cita
      const citaConAuditoria = {
        ...citaData,
        creadoPorId: user?.uid || 'ID_Desconocido',
        creadoPorEmail: user?.email || 'Sin correo',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'citas'), citaConAuditoria);
      console.log("📌 Documento creado:", docRef.id);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error detallado:', error);
      return { success: false, error };
    }
  };

  const actualizarCita = async (id, citaData) => {
    try {
      // 👇 Capturamos quién ACTUALIZÓ la cita
      const citaConAuditoria = {
        ...citaData,
        ultimaEdicionPorId: user?.uid || 'ID_Desconocido',
        ultimaEdicionPorEmail: user?.email || 'Sin correo',
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'citas', id), citaConAuditoria);
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