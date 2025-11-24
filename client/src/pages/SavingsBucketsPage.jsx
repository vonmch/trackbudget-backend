// src/pages/SavingsBucketsPage.jsx

import React, { useState, useEffect } from 'react';
import './SavingsBucketsPage.css';
import Modal from '../components/common/Modal';
import BucketForm from '../components/forms/BucketForm'; 
import AddFundsForm from '../components/forms/AddFundsForm';
import { formatCurrency } from '../utils/formatting'; 
import { authFetch } from '../utils/api'; 

// 1. Accept 'isPremium' prop
function SavingsBucketsPage({ isPremium }) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFundsModalOpen, setIsFundsModalOpen] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [buckets, setBuckets] = useState([]);

  const fetchBuckets = async () => {
    try {
      const response = await authFetch('/savings');
      const data = await response.json();
      setBuckets(data);
    } catch (error) {
      console.error('Error fetching buckets:', error);
    }
  };

  useEffect(() => {
    fetchBuckets();
  }, []);

  const openCreateModal = () => { setSelectedBucket(null); setIsEditModalOpen(true); };
  const openEditModal = (bucket, e) => { e.stopPropagation(); setSelectedBucket(bucket); setIsEditModalOpen(true); };
  const openAddFundsModal = (bucket, e) => { e.stopPropagation(); setSelectedBucket(bucket); setIsFundsModalOpen(true); };
  const closeModal = () => { setIsEditModalOpen(false); setIsFundsModalOpen(false); setSelectedBucket(null); };
  const handleSave = () => { closeModal(); fetchBuckets(); };
  
  const handleDeleteBucket = async (bucketId, e) => {
    e.stopPropagation(); 
    if (window.confirm('Are you sure you want to delete this savings bucket?')) {
      try {
        await authFetch(`/savings/${bucketId}`, {
          method: 'DELETE',
        });
        fetchBuckets();
      } catch (error) {
        console.error('Error deleting bucket:', error);
      }
    }
  };

  const handleAddFunds = async (amountToAdd) => {
    if (!selectedBucket) return;
    try {
      await authFetch(`/savings/${selectedBucket.id}/add`, {
        method: 'PUT',
        body: JSON.stringify({ amount: amountToAdd }),
      });
      closeModal();
      fetchBuckets();
    } catch (error) {
      console.error('Error adding funds:', error);
      alert('Failed to add funds.');
    }
  };

  const getProgressBarColor = (percentage) => {
    if (percentage < 25) return '#ff4d4f';
    if (percentage < 50) return '#faad14';
    if (percentage < 75) return '#1677ff';
    return '#52c41a';
  };

  // 2. Handle Lock
  const handleAddClick = () => {
    if (isPremium) {
      openCreateModal();
    } else {
      alert("Please upgrade to Premium to create new savings buckets!");
    }
  };

  return (
    <>
      <div className="buckets-page">
        <div className="buckets-header">
          <h2>Saving Buckets</h2>
          {/* 3. Apply Lock */}
          <button 
            className="add-new-btn" 
            onClick={handleAddClick}
            style={{ opacity: isPremium ? 1 : 0.5, cursor: isPremium ? 'pointer' : 'not-allowed' }}
          >
            {isPremium ? '+ New' : '🔒 Locked'}
          </button>
        </div>
        
        <div className="buckets-grid">
          {buckets.length === 0 ? (
            <p style={{color: '#777'}}>No savings buckets created yet. Click "+ New" to start!</p>
          ) : (
            buckets.map((bucket) => {
              const percentage = bucket.target_amount > 0 
                ? (bucket.current_amount / bucket.target_amount) * 100 
                : 0;
              const amountRemaining = bucket.target_amount - bucket.current_amount;
              const barColor = getProgressBarColor(percentage);

              return (
                <div className="bucket-card" key={bucket.id}>
                  <div className="bucket-card-header">
                    <span>{bucket.name}</span>
                    <div className="card-actions">
                      <button 
                        className="bucket-add-btn"
                        onClick={(e) => openAddFundsModal(bucket, e)}
                        title="Add Funds"
                      >
                        ➕
                      </button>
                      <button 
                        className="bucket-edit-btn"
                        onClick={(e) => openEditModal(bucket, e)}
                        title="Edit Bucket"
                      >
                        ✏️
                      </button>
                      <button 
                        className="bucket-delete-btn"
                        onClick={(e) => handleDeleteBucket(bucket.id, e)}
                        title="Delete Bucket"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                  <div className="bucket-card-body">
                    <div className="bucket-amount">
                      {formatCurrency(bucket.current_amount)}
                    </div>
                    <div className="bucket-goal">
                      of {formatCurrency(bucket.target_amount)}
                    </div>
                    {amountRemaining > 0 ? (
                      <div className="bucket-remaining">
                        {formatCurrency(amountRemaining)} to go
                      </div>
                    ) : (
                      <div className="bucket-remaining complete">
                        🎉 Goal Reached!
                      </div>
                    )}
                  </div>
                  <div className="bucket-card-footer">
                    <div className="progress-bar-outline">
                      <div 
                        className="progress-bar-fill" 
                        style={{width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor}}
                      ></div>
                    </div>
                    <span>{percentage.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <Modal onClose={closeModal}>
          <BucketForm 
            onCancel={closeModal} 
            onSave={handleSave}
            existingBucket={selectedBucket}
          />
        </Modal>
      )}
      
      {isFundsModalOpen && (
        <Modal onClose={closeModal}>
          <AddFundsForm 
            onCancel={closeModal} 
            onSave={handleAddFunds}
            bucketName={selectedBucket?.name}
          />
        </Modal>
      )}
    </>
  );
}

export default SavingsBucketsPage;