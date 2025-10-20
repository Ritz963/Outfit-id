// File: src/pages/Home.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navigation from '../Components/Navigation';
import ImageCarousel from '../Components/ImageCarousel';
import ActionButtons from '../Components/ActionButtons';
import UploadModal from '../Components/UploadModal';
import Cursor from '../Components/cursor';
import { useClosetItems } from '../hooks/useClosetItems';
import { useAuth } from '../contexts/AuthContext';
import placeholder from '../assets/straight.png';
import '../css/App.css';
import { useSearchParams } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseClient';
import LoadingScreen from '../Components/LoadingScreen';

function Home() {

// ensure we show the loader at least 1.5s
const [minTimePassed, setMinTimePassed] = useState(false);
useEffect(() => {
  const t = setTimeout(() => setMinTimePassed(true), 1500);
  return () => clearTimeout(t);
}, []);

  const [search] = useSearchParams();
  const closetName = search.get('closet') || 'Main';
  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid;
  const [infoItem, setInfoItem] = useState(null);
  const getRandomPrice = () => Math.floor(Math.random() * 10000) + 1;



  const [isModalOpen, setIsModalOpen] = useState(false);

  const { items: rawTops,    loading: l1 } = useClosetItems(userId, closetName, 'tops');
  const { items: rawBottoms, loading: l2 } = useClosetItems(userId, closetName, 'bottoms');
  const { items: rawShoes,   loading: l3 } = useClosetItems(userId, closetName, 'shoes');
  const loading = authLoading || l1 || l2 || l3;

  const readyToShow = !loading && minTimePassed;


  const tops    = rawTops;
  const bottoms = rawBottoms;
  const shoes   = rawShoes;

  const shirtItems = rawTops.length ? rawTops.map(item => ({ ...item, price: getRandomPrice() })) : [{ id: 'ph', imageUrl: placeholder, brand: '', color: '', price: getRandomPrice() }];
  const pantItems = rawBottoms.length ? rawBottoms.map(item => ({ ...item, price: getRandomPrice() })) : [{ id: 'ph', imageUrl: placeholder, brand: '', color: '', price: getRandomPrice() }];
  const shoeItems = rawShoes.length ? rawShoes.map(item => ({ ...item, price: getRandomPrice() })) : [{ id: 'ph', imageUrl: placeholder, brand: '', color: '', price: getRandomPrice() }];

  const shirtImgs = tops.length    ? tops    : [placeholder];
  const pantImgs  = bottoms.length ? bottoms : [placeholder];
  const shoeImgs  = shoes.length   ? shoes   : [placeholder];

  const [idxTop,  setIdxTop]  = useState(0);
  const [idxBot,  setIdxBot]  = useState(0);
  const [idxShoe, setIdxShoe] = useState(0);

  const handleRandomize = () => {
    setIdxTop(  Math.floor(Math.random() * shirtImgs.length) );
    setIdxBot(  Math.floor(Math.random() * pantImgs .length) );
    setIdxShoe( Math.floor(Math.random() * shoeImgs .length) );
  };


  const handleUploadClick = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);




  const handleSave = async () => {
    if (!userId) return;
  
    const name = window.prompt('What would you like to call this outfit?');
    if (!name) {
      return;
    }
  
    const topItem    = shirtItems[idxTop];
    const bottomItem = pantItems[idxBot];
    const shoeItem   = shoeItems[idxShoe];
  
    const payload = {
      name,
      closet:    closetName,
      top:       topItem.imageUrl,
      topPrice:  topItem.price,
      bottom:    bottomItem.imageUrl,
      bottomPrice: bottomItem.price,
      shoe:      shoeItem.imageUrl,
      shoePrice: shoeItem.price,
      createdAt: serverTimestamp()
    };
  
    // 3) write it
    try {
      const outfitsCol = collection(db, 'users', userId, 'outfits');
      await addDoc(outfitsCol, payload);
      alert(`“${name}” saved!`);
    } catch (err) {
      console.error('Save outfit failed', err);
      alert('Failed to save outfit.');
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !userId) return;
    const formData = new FormData();
    formData.append('image', file);
    formData.append('userId', userId);
    formData.append('closetName', closetName);

    try {
      const { data } = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return data;  
    } catch (err) {
      console.error('Upload failed:', err);
      throw err;
    }
  };


  if (!readyToShow) {
    return <LoadingScreen />;
  }

  return (
    <div className="app-container fade-in">
      <Navigation />


      <div className="main-content">
        <div className="carousels-container">
          <ImageCarousel
            items={shirtItems}              
            selectedIndex={idxTop}
            onChangeIndex={setIdxTop}
            onItemClick={item => setInfoItem(item)}
          />
          <ImageCarousel
            items={pantItems}
            selectedIndex={idxBot}
            onChangeIndex={setIdxBot}
            onItemClick={item => setInfoItem(item)}
          />
          <ImageCarousel
            items={shoeItems}
            selectedIndex={idxShoe}
            onChangeIndex={setIdxShoe}
            imageClass="shoes-image"
            onItemClick={item => setInfoItem(item)}
          />
        </div>

  <ActionButtons
    onSave={handleSave}
    onRandomize={handleRandomize}
    onUploadClick={handleUploadClick}
  />
    </div>

      <UploadModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onUpload={handleFileUpload}
      />
      {infoItem && (
        <div className="info-modal-overlay" onClick={() => setInfoItem(null)}>
          <div className="info-modal" onClick={e => e.stopPropagation()}>
            <h3>Item Details</h3>
            <img src={infoItem.imageUrl} alt="" className="info-image" />
            <p><strong>Brand:</strong> {infoItem.brand || 'Unknown'}</p>
            <p><strong>Color:</strong> {infoItem.color || 'Unknown'}</p>
            <p><strong>Price:</strong> ${infoItem.price.toLocaleString()}</p>
            <button onClick={() => setInfoItem(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
