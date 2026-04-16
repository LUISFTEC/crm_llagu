import { useState, useEffect } from 'react';
import { collection, addDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase-config';

export const useSeguimientos = (leadId) => {
  const [seguimientos, setSeguimientos] = useState([]);

  useEffect(() => {
    if (!leadId) return;
    
    const q = query(
      collection(db, 'seguimientos'),
      where('leadId', '==', leadId),
      orderBy('fecha', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSeguimientos(docs);
    });
    return () => unsubscribe();
  }, [leadId]);

  const agregarSeguimiento = async (seguimientoData) => {
    try {
      await addDoc(collection(db, 'seguimientos'), {
        ...seguimientoData,
        fecha: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return { seguimientos, agregarSeguimiento };
};