// src/pages/NetWorthPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import './NetWorthPage.css';
import './TrackerPage.css';
import Modal from '../components/common/Modal';
import AssetForm from '../components/forms/AssetForm'; 
import HorizontalStackedBar from '../components/common/HorizontalStackedBar';
import { formatCurrency } from '../utils/formatting';
import { authFetch } from '../utils/api'; 

const generateColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

const BASE_COLOR_MAP = {
  'Cash': '#0088FE',
  'Investments': '#00C49F',
  'Property': '#FFBB28',
  'Vehicle': '#FF8042',
  'Other': '#8884D8',
};

// 1. Accept 'isPremium' prop
function NetWorthPage({ isPremium }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [assets, setAssets] = useState([]);
  const [assetToEdit, setAssetToEdit] = useState(null);

  const fetchAssets = async () => {
    try {
      const response = await authFetch('/assets'); 
      const data = await response.json();
      setAssets(data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);
  
  const openCreateModal = () => { setAssetToEdit(null); setIsModalOpen(true); };
  const openEditModal = (asset) => { setAssetToEdit(asset); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setAssetToEdit(null); };
  const handleSave = () => { closeModal(); fetchAssets(); };
  
  const handleDeleteAsset = async (assetId) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await authFetch(`/assets/${assetId}`, { 
          method: 'DELETE',
        });
        fetchAssets();
      } catch (error) { console.error('Error deleting asset:', error); }
    }
  };

  const calculations = useMemo(() => {
    const totalNetWorth = assets.reduce((sum, asset) => sum + asset.worth, 0);
    const groupedByType = assets.reduce((acc, asset) => {
      acc[asset.type] = (acc[asset.type] || 0) + asset.worth;
      return acc;
    }, {});
    const assetTypes = Object.keys(groupedByType);
    const finalTypeColorMap = {};
    assetTypes.forEach(type => {
      if (BASE_COLOR_MAP[type]) {
        finalTypeColorMap[type] = BASE_COLOR_MAP[type];
      } else {
        finalTypeColorMap[type] = generateColor(type);
      }
    });
    const chartData = { name: 'Net Worth', ...groupedByType };
    return { totalNetWorth, chartData, assetTypes, finalTypeColorMap };
  }, [assets]);

  // 2. Handle Lock
  const handleAddClick = () => {
    if (isPremium) {
      openCreateModal();
    } else {
      alert("Please upgrade to Premium to add new assets!");
    }
  };

  return (
    <>
      <div className="networth-page">
        <div className="networth-summary-card">
          <div className="total-networth">
            <span>Total Networth</span>
            <strong>{formatCurrency(calculations.totalNetWorth)}</strong>
          </div>
          <div className="graph-container">
            <HorizontalStackedBar 
              data={calculations.chartData} 
              types={calculations.assetTypes}
              typeColorMap={calculations.finalTypeColorMap}
            />
          </div>
        </div>

        <div className="data-container" style={{width: "100%"}}>
          <h3>Assets</h3>
          {/* 3. Apply Lock */}
          <button 
            className="add-new-btn" 
            onClick={handleAddClick}
            style={{ opacity: isPremium ? 1 : 0.5, cursor: isPremium ? 'pointer' : 'not-allowed' }}
          >
            {isPremium ? '+ New' : '🔒 Locked'}
          </button>
          
          <div className="data-table-scrollable">
            <div className="data-table">
              <table>
                <thead>
                  <tr><th>Name</th><th>Type</th><th>Worth</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {assets.length === 0 ? (
                    <tr><td colSpan="4">No assets added yet</td></tr>
                  ) : (
                    assets.map((asset) => (
                      <tr key={asset.id}>
                        <td>{asset.name}</td>
                        <td>{asset.type}</td>
                        <td>{formatCurrency(asset.worth)}</td>
                        <td>
                          <button className="edit-btn" onClick={() => openEditModal(asset)}>Edit</button>
                          <button className="delete-btn" onClick={() => handleDeleteAsset(asset.id)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <AssetForm onCancel={closeModal} onSave={handleSave} existingAsset={assetToEdit} />
        </Modal>
      )}
    </>
  );
}

export default NetWorthPage;