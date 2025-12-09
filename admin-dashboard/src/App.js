import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import AdminSettings from './components/AdminSettings';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import BenutzerSuchen from './pages/BenutzerSuchen';
import PunkteBearbeiten from './pages/PunkteBearbeiten';
import BonusEinlosen from './pages/BonusEinlosen';
import Rewards from './pages/Rewards';
import Content from './pages/Content';
import ContentSprache from './pages/ContentSprache';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/settings" element={<AdminSettings />} />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <Layout>
                  <Users />
                </Layout>
              </PrivateRoute>
            }
          />

           <Route
            path="/benutzer-suchen"
            element={
              <PrivateRoute>
                <BenutzerSuchen />
              </PrivateRoute>
            }
          />

          <Route
            path="/punkte-bearbeiten"
            element={
              <PrivateRoute>
                <PunkteBearbeiten />
              </PrivateRoute>
            }
          />

          <Route
            path="/bonus-einlosen"
            element={
              <PrivateRoute>
                <BonusEinlosen />
              </PrivateRoute>
            }
          />
          
          <Route
            path="/rewards"
            element={
              <PrivateRoute>
                <Layout>
                  <Rewards />
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/content"
            element={
              <PrivateRoute>
                <Layout>
                  <Content />
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/content-sprache"
            element={
              <PrivateRoute>
                <ContentSprache />
              </PrivateRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;