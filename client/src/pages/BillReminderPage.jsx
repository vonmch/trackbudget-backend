// src/pages/BillReminderPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import './TrackerPage.css';
import './BillReminderPage.css';
import Modal from '../components/common/Modal';
import BillForm from '../components/forms/BillForm';
import SimpleBarChart from '../components/common/SimpleBarChart';
import { formatCurrency } from '../utils/formatting';
import { authFetch } from '../utils/api'; 

function BillReminderPage({ isPremium }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bills, setBills] = useState([]);
  const [billToEdit, setBillToEdit] = useState(null);

  const fetchBills = async () => {
    try {
      const response = await authFetch('/bills');
      if (response.ok) {
        const data = await response.json();
        // Safety Check: Ensure it's an array
        setBills(Array.isArray(data) ? data : []);
      } else {
        setBills([]);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
      setBills([]);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const billSummary = useMemo(() => {
    const totals = {};
    if (!bills) return [];
    
    bills.forEach(bill => {
      // FIX: Ensure we do math on NUMBERS, not strings
      const amount = parseFloat(bill.amount);
      totals[bill.type] = (totals[bill.type] || 0) + amount;
    });
    
    return Object.keys(totals).map(typeName => ({
      name: typeName,
      total: totals[typeName],
    }));
  }, [bills]);

  const openCreateModal = () => { setBillToEdit(null); setIsModalOpen(true); };
  const openEditModal = (bill) => { setBillToEdit(bill); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setBillToEdit(null); };
  const handleSave = () => { closeModal(); fetchBills(); };
  
  const handleTogglePaid = async (bill) => {
    try {
      const newIsPaidStatus = !bill.is_paid;
      await authFetch(`/bills/${bill.id}/pay`, {
        method: 'PUT',
        body: JSON.stringify({ is_paid: newIsPaidStatus }),
      });
      fetchBills();
    } catch (error) { console.error('Error updating bill status:', error); }
  };
  
  const handleDeleteBill = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await authFetch(`/bills/${billId}`, {
          method: 'DELETE',
        });
        fetchBills();
      } catch (error) { console.error('Error deleting bill:', error); }
    }
  };

  const handleAddClick = () => {
    if (isPremium) {
      openCreateModal();
    } else {
      alert("Please upgrade to Premium to add new bills!");
    }
  };

  return (
    <div className="bill-page-layout">
      <div className="data-container">
        <h3>Bills</h3>
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
                <tr><th>Name</th><th>Amount</th><th>Due Date</th><th>Type</th><th>Paid?</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {!bills || bills.length === 0 ? (
                  <tr><td colSpan="6">No bills added yet</td></tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id}>
                      <td>{bill.name}</td>
                      <td>{formatCurrency(bill.amount)}</td>
                      <td>{bill.due_date.split('T')[0].split(' ')[0]}</td>
                      <td>{bill.type}</td>
                      <td>
                        <input type="checkbox" checked={bill.is_paid} onChange={() => handleTogglePaid(bill)} style={{transform: 'scale(1.3)', cursor: 'pointer'}} />
                      </td>
                      <td>
                        <button className="edit-btn" onClick={() => openEditModal(bill)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDeleteBill(bill.id)}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="data-container">
        <h3>Bill Breakdown by Type</h3>
        {/* Only show chart if we have data */}
        {billSummary.length > 0 ? (
           <SimpleBarChart data={billSummary} />
        ) : (
           <p style={{textAlign:'center', padding:'20px', color:'#777'}}>Add bills to see the breakdown chart.</p>
        )}
      </div>
      {isModalOpen && (
        <Modal onClose={closeModal}>
          <BillForm onCancel={closeModal} onSave={handleSave} existingBill={billToEdit} />
        </Modal>
      )}
    </div>
  );
}

export default BillReminderPage;