import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase-config';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rol, setRol] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Obtener el rol desde Firestore
        const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
        const userData = userDoc.data();
        
        setUser(firebaseUser);
        setRol(userData?.rol || 'asesor');
      } else {
        setUser(null);
        setRol(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, rol };
};