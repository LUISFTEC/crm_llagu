import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, doc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from './useAuth'; // 👈 IMPORTAMOS EL USUARIO

export const useLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, rol } = useAuth(); // 👈 OBTENEMOS LOS DATOS DE SESIÓN

  useEffect(() => {
    // Si no hay usuario logueado, no hacemos nada
    if (!user) return;

    let consulta;

    // Aplicamos el filtro de seguridad según el rol
    if (rol === 'admin') {
      consulta = collection(db, 'leads');
    } else {
      consulta = query(collection(db, 'leads'), where("asesorId", "==", user.uid));
    }

    // Usamos la 'consulta' filtrada
    const unsubscribe = onSnapshot(consulta, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(docs);
      setLoading(false);
    }, (error) => {
      console.error("Error en onSnapshot de leads:", error);
    });

    return () => unsubscribe();
  }, [user, rol]); // 👈 Agregamos dependencias

  const agregarLead = async (leadData) => {
    try {
      const docRef = await addDoc(collection(db, 'leads'), {
        ...leadData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        activo: true
      });
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error al agregar lead:', error);
      return { success: false, error };
    }
  };

  const actualizarLead = async (id, leadData) => {
    try {
      await updateDoc(doc(db, 'leads', id), {
        ...leadData,
        updatedAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error al actualizar lead:', error);
      return { success: false, error };
    }
  };

  // Ya no necesitas la función getLeadsPorAsesor porque Firebase 
  // ya te devuelve el arreglo "leads" filtrado automáticamente.
  
  return { leads, loading, agregarLead, actualizarLead };
};