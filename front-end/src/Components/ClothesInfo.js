import React from 'react';

const ClothesInfo = ({ item }) => {
    return (
        <div className='inner'>
            <p><b>Brand:</b> {item.brand}</p>
            <p><b>Color:</b> {item.color}</p>
            <p><b>Type:</b> {item.type}</p>
        </div>
    );
};

export default ClothesInfo;
