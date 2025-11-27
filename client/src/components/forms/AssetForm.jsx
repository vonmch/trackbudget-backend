// src/components/forms/AssetForm.jsx

import React, { useState, useEffect } from 'react';
import './AssetForm.css';
import { authFetch } from '../../utils/api';

const STANDARD_ASSET_TYPES = ['Cash', 'Investments', 'Property', 'Vehicle', 'Other'];

function AssetForm({ onSave, onCancel, existingAsset }) {
  const isEditMode = Boolean(existingAsset);

  const [name, setName] = useState('');
  const [worth, setWorth] = useState('');
  const [type, setType] = useState('Cash');
  const [customType, setCustomType] = useState('');

  useEffect(() => {
    if (isEditMode) {
      setName(existingAsset.name);
      setWorth(existingAsset.worth);
      if (STANDARD_ASSET_TYPES.includes(existingAsset.type)) {
        setType(existingAsset.type);
        setCustomType('');
      } else {
        setType('Other');
        setCustomType(existingAsset.type);
      }
    }
  }, [isEditMode, existingAsset]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const finalType = type === 'Other' ? customType : type;
    
    const formData = {
      name: name,
      worth: parseFloat(worth),
      type: finalType,
    };

    const url = isEditMode ? `/assets/${existingAsset.id}` : '/assets';
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      await authFetch(url, {
        method: method,
        // --- THIS HEADER WAS MISSING ---
        headers: { 'Content-Type': 'application/json' }, 
        // -------------------------------
        body: JSON.stringify(formData),
      });
      onSave();
    } catch (error) {
      console.error(`Error saving asset:`, error);
      alert(`Failed to save asset.`);
    }
  };

  return (
    <form className="asset-form" onSubmit={handleSubmit}>
      <h3>{isEditMode ? 'Edit Asset' : 'Add New Asset'}</h3>
      <div className="form-group">
        <label>Asset Name</label>
        <input type="text" placeholder="Checking Account" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Asset Worth</label>
          <input type="number" placeholder="5.00" value={worth} onChange={(e) => setWorth(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Asset Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Cash">Cash</option>
            <option value="Investments">Investments</option>
            <option value="Property">Property</option>
            <option value="Vehicle">Vehicle</option>
            <option value="Other">Other (Please specify)</option>
          </select>
          {type === 'Other' && (
            <div className="form-group custom-type-input">
              <label>Custom Asset Type:</label>
              <input type="text" value={customType} onChange={(e) => setCustomType(e.target.value)} placeholder="e.g., Collectibles" required />
            </div>
          )}
        </div>
      </div>
      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-add">{isEditMode ? 'Save Changes' : 'Add'}</button>
      </div>
    </form>
  );
}

export default AssetForm;