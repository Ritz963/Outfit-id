// src/Components/OutfitCard.js
import React from 'react';

export default function OutfitCard({ outfit }) {
  const { name, top, bottom, shoe, topPrice, bottomPrice, shoePrice } = outfit;
  const total = (topPrice||0) + (bottomPrice||0) + (shoePrice||0);

  return (
    <div className="outfit-card">
      <h2 className="outfit-name">{name}</h2>

      <div className="outfit-stack">
        <img src={shoe}   alt="" className="stack-img shoes" />
        <img src={bottom} alt="" className="stack-img bottoms" />
        <img src={top}    alt="" className="stack-img tops" />
      </div>

      <div className="outfit-footer">
        <span className="outfit-cost">
          ${total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
