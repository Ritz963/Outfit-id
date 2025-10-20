import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';           
import { useAuth }       from '../contexts/AuthContext';
import { db }            from '../firebaseClient';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import OutfitCard        from '../Components/OutfitCard';
import '../css/App.css';
import LoadingScreen from '../Components/LoadingScreen';

export default function Outfits() {
const [minTimePassed, setMinTimePassed] = useState(false);
useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), 500);
    return () => clearTimeout(t);
}, []);
  const navigate = useNavigate();                         
  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid;
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const readyToShow = !loading && minTimePassed;


  useEffect(() => {
    if (!userId) return;
    (async () => {
      const q = query(
        collection(db, 'users', userId, 'outfits'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setOutfits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    })();
  }, [userId]);



    if (!readyToShow) {
        return <LoadingScreen />;
    }
  return (
    <div className="outfits-page">
      {/* Back button */}
      <button
        className="back-btn"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h1>Your Saved Outfits</h1>
      <div className="outfits-grid">
        {outfits.map(o => (
          <OutfitCard key={o.id} outfit={o} />
        ))}
      </div>
    </div>
  );
}
