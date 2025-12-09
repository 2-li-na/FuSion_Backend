import React, { useState, useEffect } from 'react';
import { updatePurchase, deletePurchase } from '../services/api';
import './PramieEdit.css';

const PramieEdit = ({ purchase, onClose, onUpdate }) => {
  const [itemName, setItemName] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (purchase) {
      setItemName(purchase.itemName || purchase.itemTitle || '');
      setCost(purchase.cost || purchase.points || '');
      setNotes(purchase.notes || purchase.bemerkungen || '');
      
      // Format date for input (DD-MM-YYYY)
      const purchaseDate = new Date(purchase.redeemedAt || purchase.date);
      const formattedDate = purchaseDate.toISOString().split('T')[0];
      setDate(formattedDate);
    }
  }, [purchase]);

  const handleSave = async () => {
    if (!itemName.trim()) {
      setMessage('Item name is required');
      return;
    }

    if (!cost || isNaN(cost) || cost <= 0) {
      setMessage('Valid cost is required');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const updateData = {
        itemName: itemName.trim(),
        cost: parseInt(cost),
        notes: notes.trim(),
        date: new Date(date)
      };

      await updatePurchase(purchase._id, updateData);
      setMessage('Kauf erfolgreich aktualisiert');
      
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error updating purchase:', error);
      setMessage('Fehler beim Aktualisieren des Kaufs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Möchten Sie diesen Kauf wirklich löschen?')) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await deletePurchase(purchase._id);
      setMessage('Kauf erfolgreich gelöscht');
      
      setTimeout(() => {
        onUpdate();
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Error deleting purchase:', error);
      setMessage('Fehler beim Löschen des Kaufs');
    } finally {
      setLoading(false);
    }
  };

  // Format date for display (DD.MM.YYYY)
  const formatDateDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  };

  return (
    <div className="pramie-edit-overlay" onClick={onClose}>
      <div className="pramie-edit-modal" onClick={(e) => e.stopPropagation()}>
        <button className="zuruck-button" onClick={onClose}>
          Zurück
        </button>

        <div className="edit-form-container">
          <div className="form-row">
            <label className="form-label">Item:</label>
            <input
              type="text"
              className="form-input"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <label className="form-label">Kosten:</label>
            <input
              type="number"
              className="form-input"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <label className="form-label">Anmerkungen:</label>
            <textarea
              className="form-textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              rows="4"
            />
          </div>

          <div className="form-row">
            <label className="form-label">Kaufdatum:</label>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={loading}
            />
          </div>

          {message && (
            <div className={`form-message ${message.includes('Fehler') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          <div className="button-row">
            <button 
              className="speichern-button" 
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? 'Wird gespeichert...' : 'speichern'}
            </button>
            <button 
              className="loschen-button" 
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? 'Wird gelöscht...' : 'löschen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PramieEdit;