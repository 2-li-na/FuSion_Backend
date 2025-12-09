import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOverviewStats, getDepartmentStats } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [showRewardEntry, setShowRewardEntry] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, deptData] = await Promise.all([
        getOverviewStats(),
        getDepartmentStats(),
      ]);
      setStats(statsData);
      setDepartments(deptData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Willkommen AdminHSP</h1>
        </div>
        <div className="header-right">
          <img 
            src="https://www.hs-fulda.de/assets/images/hs-fulda_logo_rechteckig_gruen-schwarz_keinhintergrund_keineschutzzone_RGB.svg" 
            alt="Hochschule Fulda" 
            className="university-logo"
          />
        </div>
      </header>

      <div className="dashboard-content">
        <div className="left-section">
          <button 
            className="action-button"
            onClick={() => navigate('/users')}
          >
            Benutzer verwaltung
          </button>
          
          <button 
            className="action-button"
            onClick={() => navigate('/rewards')}
          >
            Prämie eingeben
          </button>
          
          <button 
            className="action-button"
            onClick={() => navigate('/content')}
          >
            Text ändern
          </button>
        </div>

        <div className="right-section">
          <div className="stat-card-new">
            <div className="stat-icon-new">👥</div>
            <div className="stat-content-new">
              <h3>Total Users</h3>
              <p className="stat-value-new">{stats?.totalUsers || 0}</p>
            </div>
          </div>

          <div className="stat-card-new">
            <div className="stat-icon-new">🔥</div>
            <div className="stat-content-new">
              <h3>Active Users</h3>
              <p className="stat-value-new">{stats?.activeUsers || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="departments-section">
        <h2>Users by Department</h2>
        <div className="departments-grid">
          {departments.map((dept) => (
            <div key={dept._id} className="department-card">
              <h4>{dept._id}</h4>
              <p className="department-count">{dept.userCount}</p>
            </div>
          ))}
        </div>
      </div>

      {/* User Management Modal */}
      {showUserManagement && (
        <div className="modal-overlay" onClick={() => setShowUserManagement(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Benutzer verwaltung</h2>
            <p>User management functionality will be implemented here.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowUserManagement(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reward Entry Modal */}
      {showRewardEntry && (
        <div className="modal-overlay" onClick={() => setShowRewardEntry(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Prämie eingeben</h2>
            <p>Reward entry functionality will be implemented here.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowRewardEntry(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Text Editor Modal */}
      {showTextEditor && (
        <div className="modal-overlay" onClick={() => setShowTextEditor(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Text ändern</h2>
            <p>Text editing functionality will be implemented here.</p>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowTextEditor(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;