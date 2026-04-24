// hooks/usePlanesPago.js
import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useAuth } from './useAuth';

export const usePlanesPago = (clienteId = null) => {
  // ✅ Inicializar loading basado en si hay clienteId
  const [planes, setPlanes] = useState([]);
  const [loading, setLoading] = useState(!!clienteId);
  const [previousClienteId, setPreviousClienteId] = useState(clienteId);
  const { user } = useAuth();

  // ✅ Detectar cambio de clienteId y resetear loading ANTES del effect
  if (clienteId !== previousClienteId) {
    setPreviousClienteId(clienteId);
    setLoading(!!clienteId);
  }

  useEffect(() => {
    if (!clienteId) {
      return;
    }

    const q = query(
      collection(db, 'planesPago'),
      where('clienteId', '==', clienteId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setPlanes(docs);
        setLoading(false);
      },
      (error) => {
        console.error("Error al escuchar planes:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [clienteId]);

  const guardarPlanPago = async (datosPlan) => {
    try {
      const planConAuditoria = {
        ...datosPlan,
        creadoPorId: user?.uid || 'sistema',
        creadoPorEmail: user?.email || 'sistema',
        createdAt: serverTimestamp(),
        estado: 'activo'
      };

      const docRef = await addDoc(collection(db, 'planesPago'), planConAuditoria);
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Error al guardar plan de pago:', error);
      return { success: false, error };
    }
  };

  // ✅ Derivar estado final
  const planesFinal = clienteId ? planes : [];
  const loadingFinal = clienteId ? loading : false;

  return { planes: planesFinal, loading: loadingFinal, guardarPlanPago };
};