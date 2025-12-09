import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers, getUserPoints, redeemBonus } from '../services/api';
import './BonusEinlosen.css';

const BonusEinlosen = () => {
  const navigate = useNavigate();
  const [usernameInput, setUsernameInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [itemName, setItemName] = useState('');
  const [cost, setCost] = useState('');
  const [notes, setNotes] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search users as user types
  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (usernameInput.trim().length > 0) {
        try {
          const results = await searchUsers(usernameInput.trim());
          setSearchResults(results);
          setShowDropdown(results.length > 0);
        } catch (error) {
          console.error('Error searching users:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [usernameInput]);

  // Handle user selection from dropdown
  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    setUsernameInput(user.username);
    setShowDropdown(false);
    setMessage('');
    
    // Fetch user's current points
    try {
      const pointsData = await getUserPoints(user._id);
      setCurrentPoints(pointsData.totalPoints || 0);
    } catch (error) {
      console.error('Error fetching points:', error);
      setMessage('Fehler beim Laden der Punkte');
    }
  };

  // Handle bonus redemption
  const handleRedeemBonus = async () => {
    if (!selectedUser) {
      setMessage('Bitte wählen Sie einen Benutzer aus');
      return;
    }

    if (!itemName.trim()) {
      setMessage('Bitte geben Sie einen Item-Namen ein');
      return;
    }

    const costValue = parseInt(cost);
    if (isNaN(costValue) || costValue <= 0) {
      setMessage('Bitte geben Sie gültige Kosten ein');
      return;
    }

    if (costValue > currentPoints) {
      setMessage(`Benutzer hat nicht genug Punkte. Verfügbar: ${currentPoints}`);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await redeemBonus(
        selectedUser._id,
        itemName,
        costValue,
        notes
      );

      setCurrentPoints(result.remainingPoints);
      setMessage(`Bonus erfolgreich eingelöst! ${costValue} Punkte abgezogen.`);
      
      // Clear the form fields
      setItemName('');
      setCost('');
      setNotes('');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error redeeming bonus:', error);
      const errorMsg = error.response?.data?.message || 'Fehler beim Einlösen des Bonus';
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bonus-einlosen-page">
      <header className="bonus-header">
        <div className="header-left">
          {/* <div className="fusion-logo-container">
            <span className="fusion-text">FuSion</span>
          </div> */}
          <h1 className="fusion-title">FuSion</h1>
        </div>
        <div className="header-right">
          {/* <h2 className="university-name">HOCHSCHULE <span>FULDA</span></h2>
          <span className="university-subtitle">UNIVERSITY OF APPLIED SCIENCES</span> */}
          <img 
            src="https://www.hs-fulda.de/assets/images/hs-fulda_logo_rechteckig_gruen-schwarz_keinhintergrund_keineschutzzone_RGB.svg" 
            alt="Hochschule Fulda" 
            className="university-logo-small"
          />
        </div>
      </header>

      <div className="bonus-content">
        <button className="back-button" onClick={() => navigate('/users')}>
          Zurück
        </button>

        <div className="bonus-card">
          <div className="form-group" ref={dropdownRef}>
            <label>Username:</label>
            <input
              type="text"
              className="username-input"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Username"
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            />
            
            {showDropdown && searchResults.length > 0 && (
              <div className="autocomplete-dropdown">
                {searchResults.map((user) => (
                  <div
                    key={user._id}
                    className="dropdown-item"
                    onClick={() => handleUserSelect(user)}
                  >
                    {user.username}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedUser && (
            <>
              <div className="email-display">
                {selectedUser.email}
              </div>

              <div className="points-info">
                {selectedUser.username} hat {currentPoints} Punkte:
              </div>

              <div className="form-group">
                <label>Item:</label>
                <input
                  type="text"
                  className="item-input"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="z.B. Frisbee"
                />
              </div>

              <div className="form-group">
                <label>Kosten:</label>
                <input
                  type="number"
                  className="cost-input"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="z.B. 30"
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Anmerkungen:</label>
                <textarea
                  className="notes-textarea"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder=""
                  rows="4"
                />
              </div>

              <button
                className="redeem-button"
                onClick={handleRedeemBonus}
                disabled={loading}
              >
                {loading ? 'Wird eingelöst...' : 'Einlösen'}
              </button>

              {message && (
                <div className={`message ${message.includes('Fehler') || message.includes('nicht genug') ? 'error' : 'success'}`}>
                  {message}
                </div>
              )}
            </>
          )}
        </div>

        {!selectedUser && (
          <div className="logout-button-container">
            <button className="logout-button" onClick={() => navigate('/dashboard')}>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BonusEinlosen;