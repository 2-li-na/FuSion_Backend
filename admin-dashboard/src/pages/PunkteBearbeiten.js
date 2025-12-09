import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers, getUserPoints, addPoints, removePoints } from '../services/api';
import './PunkteBearbeiten.css';

const PunkteBearbeiten = () => {
  const navigate = useNavigate();
  const [usernameInput, setUsernameInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPoints, setCurrentPoints] = useState(0);
  const [newPoints, setNewPoints] = useState('');
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
    }, 300); // Debounce search

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
      setNewPoints(pointsData.totalPoints || 0);
    } catch (error) {
      console.error('Error fetching points:', error);
      setMessage('Fehler beim Laden der Punkte');
    }
  };

  // Handle points update
  const handleSetPoints = async () => {
    if (!selectedUser) {
      setMessage('Bitte wählen Sie einen Benutzer aus');
      return;
    }

    const pointsValue = parseInt(newPoints);
    if (isNaN(pointsValue) || pointsValue < 0) {
      setMessage('Bitte geben Sie eine gültige Punktzahl ein');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const pointsDiff = pointsValue - currentPoints;
      
      if (pointsDiff > 0) {
        // Add points
        await addPoints(selectedUser._id, pointsDiff, 'Admin adjustment');
      } else if (pointsDiff < 0) {
        // Remove points
        await removePoints(selectedUser._id, Math.abs(pointsDiff), 'Admin adjustment');
      }

      setCurrentPoints(pointsValue);
      setMessage('Punkte erfolgreich aktualisiert!');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating points:', error);
      setMessage('Fehler beim Aktualisieren der Punkte');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="punkte-bearbeiten-page">
      <header className="punkte-header">
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

      <div className="punkte-content">
        <button className="back-button" onClick={() => navigate('/users')}>
          Zurück
        </button>

        <div className="edit-points-card">
          <div className="form-group" ref={dropdownRef}>
            <label>Username</label>
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
                {selectedUser.username} hat {currentPoints} Punkte
              </div>

              <div className="points-input-container">
                <input
                  type="number"
                  className="points-input"
                  value={newPoints}
                  onChange={(e) => setNewPoints(e.target.value)}
                  min="0"
                />
              </div>

              <button
                className="set-points-button"
                onClick={handleSetPoints}
                disabled={loading}
              >
                {loading ? 'Wird gespeichert...' : 'Punkte setzen'}
              </button>

              {message && (
                <div className={`message ${message.includes('Fehler') ? 'error' : 'success'}`}>
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

export default PunkteBearbeiten;