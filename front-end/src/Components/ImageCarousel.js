// src/Components/ImageCarousel.js
import React from 'react';

export default function ImageCarousel({
  items,
  selectedIndex = 0,
  onChangeIndex = () => {},
  onItemClick = () => {},
  imageClass = ''
}) {
  const nextImage = () => {
    onChangeIndex((selectedIndex + 1) % items.length);
  };
  const prevImage = () => {
    onChangeIndex((selectedIndex - 1 + items.length) % items.length);
  };

  const current = items[selectedIndex];

  return (
    <div className="carousel">
      <div className="carousel-image">
        <button className="arrow left-arrow" onClick={prevImage}>
          &larr;
        </button>
        <img
          className={imageClass}
          src={current.imageUrl}
          alt=""
          onClick={() => onItemClick(current)}
        />
        <button className="arrow right-arrow" onClick={nextImage}>
          &rarr;
        </button>
      </div>
    </div>
  );
}
