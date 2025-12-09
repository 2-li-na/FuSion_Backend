import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers, getUser, getUserPoints, getUserTotalSteps, getUserPurchases, deletePurchase } from '../services/api';
import PramieEdit from './PramieEdit';
import './BenutzerSuchen.css';

const BenutzerSuchen = () => {
  const navigate = useNavigate();
  const [usernameInput, setUsernameInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [purchases, setPurchases] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingPurchase, setEditingPurchase] = useState(null);
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
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setUsernameInput(user.username);
    setShowDropdown(false);
  };

  // Refresh purchases list
  const refreshPurchases = async () => {
    if (selectedUser) {
      try {
        const purchaseHistory = await getUserPurchases(selectedUser._id);
        setPurchases(purchaseHistory);
      } catch (error) {
        console.error('Error refreshing purchases:', error);
      }
    }
  };

  // Handle search button click
  const handleSearch = async () => {
    if (!selectedUser) {
      setMessage('Bitte wählen Sie einen Benutzer aus');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Fetch user details
      const user = await getUser(selectedUser._id);
      setUserDetails(user);

      // Fetch user points
      const pointsData = await getUserPoints(selectedUser._id);
      setTotalPoints(pointsData.totalPoints || 0);

      // Fetch total steps
      const stepsData = await getUserTotalSteps(selectedUser._id);
      setTotalSteps(stepsData.totalSteps || 0);

      // Fetch purchase history
      const purchaseHistory = await getUserPurchases(selectedUser._id);
      setPurchases(purchaseHistory);

    } catch (error) {
      console.error('Error fetching user data:', error);
      setMessage('Fehler beim Laden der Benutzerdaten');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete purchase
  const handleDeletePurchase = async (purchaseId) => {
    if (!window.confirm('Möchten Sie diesen Kauf wirklich löschen?')) {
      return;
    }

    try {
      await deletePurchase(purchaseId);
      setPurchases(purchases.filter(p => p._id !== purchaseId));
      setMessage('Kauf erfolgreich gelöscht');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting purchase:', error);
      setMessage('Fehler beim Löschen des Kaufs');
    }
  };

  // Handle edit purchase
  const handleEditPurchase = (purchase) => {
    setEditingPurchase(purchase);
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingPurchase(null);
  };

  // Refresh purchases after edit
  const handlePurchaseUpdate = () => {
    refreshPurchases();
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE');
  };

  return (
    <div className="benutzer-suchen-page">
      <header className="benutzer-header">
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

      <div className="benutzer-content">
        <button className="back-button" onClick={() => navigate('/users')}>
          Zurück
        </button>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-container" ref={dropdownRef}>
            <input
              type="text"
              className="search-input"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="username eingeben"
              onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
          
          <button 
            className="search-button" 
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Laden...' : 'suchen'}
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('Fehler') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}

        {/* User Details Section */}
        {userDetails && (
          <div className="user-info-card">
            <div className="info-row">
              <span className="info-label">Name:</span>
              <span className="info-value">{userDetails.username}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Punkte:</span>
              <span className="info-value">{totalPoints}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Fachbereich:</span>
              <span className="info-value">{userDetails.department || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Email:</span>
              <span className="info-value">{userDetails.email}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Gesamte Schritte:</span>
              <span className="info-value">{totalSteps.toLocaleString()}</span>
            </div>

            {/* Purchase History Table */}
            <div className="purchase-history">
              <h3>Kauf Historie</h3>
              <table className="purchase-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Preis</th>
                    <th>Bemerkungen</th>
                    <th>Datum</th>
                    <th>Aktion</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="no-purchases">
                        Keine Käufe gefunden
                      </td>
                    </tr>
                  ) : (
                    purchases.map((purchase) => (
                      <tr key={purchase._id}>
                        <td>{purchase.itemName || purchase.itemTitle}</td>
                        <td>{purchase.cost || purchase.points}</td>
                        <td>{purchase.notes || purchase.bemerkungen || 'Keine'}</td>
                        <td>{formatDate(purchase.redeemedAt || purchase.date)}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="edit-button"
                              onClick={() => handleEditPurchase(purchase)}
                            >
                              bearbeiten
                            </button>
                            <button 
                              className="delete-button"
                              onClick={() => handleDeletePurchase(purchase._id)}
                            >
                              löschen
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!userDetails && (
          <div className="no-user-selected">
            <p>Geben Sie einen Benutzernamen ein und klicken Sie auf "suchen"</p>
          </div>
        )}
      </div>

      {/* Edit Purchase Modal */}
      {editingPurchase && (
        <PramieEdit
          purchase={editingPurchase}
          onClose={closeEditModal}
          onUpdate={handlePurchaseUpdate}
        />
      )}
    </div>
  );
};

export default BenutzerSuchen;