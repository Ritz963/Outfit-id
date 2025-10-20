import React from 'react';
import Slider from "react-slick";

// Import slick-carousel CSS files
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

const SlickCarousel = ({ images, imageClass = '' }) => {
  // Basic react-slick settings – you can adjust as needed
  const settings = {
    dots: true,             // Display dots below the carousel
    infinite: true,         // Allows infinite looping of slides
    speed: 500,             // Transition speed in ms
    slidesToShow: 1,        // One slide at a time
    slidesToScroll: 1,      // Scroll one slide per click
    arrows: true,           // Show arrow buttons for navigation
    // You can add more settings here:
    // autoplay: true,
    // autoplaySpeed: 3000,
  };

  return (
    <div className="slick-carousel-container">
      <Slider {...settings}>
        {images.map((img, index) => (
          <div key={index} className="carousel-slide">
            <img className={imageClass} src={img} alt={`Slide ${index + 1}`} />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default SlickCarousel;
