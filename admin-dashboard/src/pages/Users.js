import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Users.css';

const Users = () => {
  const navigate = useNavigate();
  const [showSearchUsers, setShowSearchUsers] = useState(false);
  const [showEditPoints, setShowEditPoints] = useState(false);
  const [showEditPurchases, setShowEditPurchases] = useState(false);
  const [showRedeemBonus, setShowRedeemBonus] = useState(false);

  return (
    <div className="users-page">
      <header className="users-header">
        {/* <button className="back-button" onClick={() => navigate('/dashboard')}>
          Zurück
        </button> */}
        <div className="header-right">
          <img 
            src="https://www.hs-fulda.de/assets/images/hs-fulda_logo_rechteckig_gruen-schwarz_keinhintergrund_keineschutzzone_RGB.svg" 
            alt="Hochschule Fulda" 
            className="university-logo"
          />
        </div>
      </header>

      <div className="users-actions-grid">
        <button 
          className="users-action-button"
          onClick={() => navigate('/benutzer-suchen')}
        >
          Benutzer suchen
        </button>

        <button 
          className="users-action-button"
          onClick={() => navigate('/punkte-bearbeiten')}
        >
          Punkte bearbeiten
        </button>

        {/* <button 
          className="users-action-button"
          onClick={() => setShowEditPurchases(true)}
        >
          Käufe bearbeiten
        </button> */}

        <button 
          className="users-action-button"
          onClick={() => navigate('/bonus-einlosen')}
        >
          Bonus einlösen
        </button>
      </div>

      {/* Search Users Modal */}
      {showSearchUsers && (
        <div className="modal-overlay" onClick={() => setShowSearchUsers(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Benutzer suchen</h2>
            <p>User search functionality will be implemented here.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowSearchUsers(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Points Modal */}
      {showEditPoints && (
        <div className="modal-overlay" onClick={() => setShowEditPoints(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Punkte bearbeiten</h2>
            <p>Points editing functionality will be implemented here.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowEditPoints(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Purchases Modal */}
      {showEditPurchases && (
        <div className="modal-overlay" onClick={() => setShowEditPurchases(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Käufe bearbeiten</h2>
            <p>Purchase editing functionality will be implemented here.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowEditPurchases(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Redeem Bonus Modal */}
      {showRedeemBonus && (
        <div className="modal-overlay" onClick={() => setShowRedeemBonus(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Bonus einlösen</h2>
            <p>Bonus redemption functionality will be implemented here.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowRedeemBonus(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;