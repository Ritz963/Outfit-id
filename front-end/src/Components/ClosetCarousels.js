// src/Components/ClosetCarousels.js
import React from 'react';
import ImageCarousel from './ImageCarousel';

export default function ClosetCarousels({ shirts, pants, shoes, selectedIndices }) {
  return (
    <div className="carousels-container">
      <ImageCarousel
        images={shirts}
        selectedIndex={selectedIndices.shirts}
      />
      <ImageCarousel
        images={pants}
        selectedIndex={selectedIndices.pants}
      />
      <ImageCarousel
        images={shoes}
        imageClass="shoes-image"
        selectedIndex={selectedIndices.shoes}
      />
    </div>
  );
}
