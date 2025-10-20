// src/hooks/useClosets.js
import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseClient';

export function useClosets(userId) {
  const [closets, setClosets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const colRef = collection(db, 'users', userId, 'closets');
    const unsub = onSnapshot(colRef, snap => {
      setClosets(snap.docs.map(d => d.id));
      setLoading(false);
    });
    return unsub;
  }, [userId]);

  return { closets, loading };
}
