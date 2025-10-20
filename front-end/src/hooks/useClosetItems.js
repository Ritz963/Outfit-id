// src/hooks/useClosetItems.js
import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebaseClient';


export function useClosetItems(uid, closet, category) {
  const [items, setItems]   = useState([]);
  const [loading, setLoad]  = useState(true);

  useEffect(() => {
    if (!uid) return;
    const colRef = collection(
      db, 'users', uid, 'closets', closet, category
    );
    const q = query(colRef, orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoad(false);
    });
    return unsub;
  }, [uid, closet, category]);

  return { items, loading };
}

