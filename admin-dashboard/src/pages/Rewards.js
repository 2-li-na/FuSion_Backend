import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRewards, createReward, deleteReward } from '../services/api';
import './Rewards.css';

const Rewards = () => {
  const navigate = useNavigate();
  const [rewards, setRewards] = useState([]);
  const [itemName, setItemName] = useState('');
  const [points, setPoints] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      const response = await getRewards();
      setRewards(response.rewards || []);
    } catch (error) {
      console.error('Error fetching rewards:', error);
    }
  };

  const handleDeleteReward = async (rewardId, rewardTitle) => {
    if (!window.confirm(`Möchten Sie "${rewardTitle}" wirklich löschen?`)) {
      return;
    }

    try {
      await deleteReward(rewardId);
      setMessage('Prämie erfolgreich gelöscht');
      
      // Remove from local state immediately
      setRewards(rewards.filter(r => r._id !== rewardId));
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting reward:', error);
      setMessage('Fehler beim Löschen der Prämie');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleAddReward = async () => {
    if (!itemName.trim()) {
      setMessage('Bitte geben Sie einen Item-Namen ein');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!points || isNaN(points) || parseInt(points) <= 0) {
      setMessage('Bitte geben Sie gültige Punkte ein');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const rewardData = {
        title: itemName.trim(),
        points: parseInt(points),
        description: '',
        category: 'General',
        isActive: true
      };

      await createReward(rewardData);
      
      setMessage('Prämie erfolgreich hinzugefügt');
      setItemName('');
      setPoints('');
      
      await fetchRewards();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding reward:', error);
      setMessage('Fehler beim Hinzufügen der Prämie');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rewards">
      <header className="rewards-header">
        <div className="header-logo">
          <img 
            src="https://www.hs-fulda.de/assets/images/hs-fulda_logo_rechteckig_gruen-schwarz_keinhintergrund_keineschutzzone_RGB.svg" 
            alt="Hochschule Fulda" 
            className="university-logo"
          />
        </div>
      </header>

      <div className="rewards-content">
        <section className="rewards-section">
          <h2 className="section-title">Aktuelles Prämien</h2>
          
          {message && (
            <div className={`reward-message ${message.includes('Fehler') || message.includes('Bitte') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
          
          <div className="rewards-grid">
            {rewards.length === 0 ? (
              <p className="no-rewards">Keine Prämien verfügbar</p>
            ) : (
              rewards.map((reward) => (
                <div key={reward._id} className="reward-card">
                  <button
                    className="delete-reward-btn"
                    onClick={() => handleDeleteReward(reward._id, reward.title)}
                    aria-label="Prämie löschen"
                  >
                    🗑️
                  </button>
                  <div className="reward-name">{reward.title}</div>
                  <div className="reward-points">{reward.points}</div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="add-reward-section">
          <h2 className="section-title">Neues Prämien Eingeben</h2>

          <div className="add-reward-form">
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
              <label className="form-label">Punkte:</label>
              <input
                type="number"
                className="form-input"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                min="0"
                disabled={loading}
              />
            </div>

            <button
              className="einfugen-button"
              onClick={handleAddReward}
              disabled={loading}
            >
              {loading ? 'Wird hinzugefügt...' : 'Einfügen'}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Rewards;