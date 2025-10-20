// src/Components/ActionButtons.js
import React from 'react';

const ActionButtons = ({ onSave, onRandomize, onUploadClick }) => {
  return (
    <>
      {/* Bottom buttons */}
      <div className="action-buttons">
        <button className="action-btn save-btn" onClick={onSave}>Save Outfit</button>
        <button className="action-btn randomize-btn" onClick={onRandomize}>Randomize</button>
      </div>

      {/* Upload button (outside the action-buttons container) */}
      <button className="action-btn upload-btn" onClick={onUploadClick}>Upload</button>
    </>
  );
};

export default ActionButtons;
