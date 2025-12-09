import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getContent, updateContent } from '../services/api';
import './ContentSprache.css';

const ContentSprache = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const category = searchParams.get('category');

  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [editForm, setEditForm] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (category) {
      loadCategoryContent(category);
    }
  }, [category]);

  const loadCategoryContent = async (cat) => {
    setLoading(true);
    setMessage('');
    try {
      const response = await getContent(cat);
      setContent(response.content || []);
    } catch (error) {
      console.error('Error loading content:', error);
      setMessage('Fehler beim Laden des Inhalts');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
  };

  const handleEdit = (item) => {
    setEditingKey(item.key);
    const lang = selectedLanguage === 'Deutsch' ? 'de' : 'en';
    setEditForm(item.translations[lang] || '');
  };

  const handleSave = async (key) => {
    try {
      const lang = selectedLanguage === 'Deutsch' ? 'de' : 'en';
      const currentItem = content.find(item => item.key === key);
      
      const updatedTranslations = {
        de: currentItem.translations.de,
        en: currentItem.translations.en || ''
      };
      updatedTranslations[lang] = editForm;

      await updateContent(key, {
        translations: updatedTranslations
      });
      
      setMessage('Erfolgreich gespeichert!');
      setEditingKey(null);
      loadCategoryContent(category);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating content:', error);
      setMessage('Fehler beim Speichern');
    }
  };

  const handleCancel = () => {
    setEditingKey(null);
    setEditForm('');
  };

  const handleBackToLanguage = () => {
    setSelectedLanguage(null);
    setEditingKey(null);
    setEditForm('');
  };

  const handleBackToCategory = () => {
    navigate('/content');
  };

  return (
    <div className="content-sprache-page">
      {/* Hochschule Logo Header */}
      <header className="sprache-header">
        <img 
          src="https://www.hs-fulda.de/assets/images/hs-fulda_logo_rechteckig_gruen-schwarz_keinhintergrund_keineschutzzone_RGB.svg" 
          alt="Hochschule Fulda" 
          className="university-logo"
        />
      </header>

      {/* Language Selection */}
      {!selectedLanguage && (
        <div className="language-selection">
          <div className="category-title">
            <h2>{category}</h2>
          </div>
          
          <button className="btn-back-top" onClick={handleBackToCategory}>
            ← Zurück
          </button>

          <div className="language-buttons">
            <button
              className="language-button"
              onClick={() => handleLanguageSelect('Deutsch')}
            >
              Deutsch
            </button>
            <button
              className="language-button"
              onClick={() => handleLanguageSelect('Englisch')}
            >
              Englisch
            </button>
          </div>
        </div>
      )}

      {/* Content Editing */}
      {selectedLanguage && (
        <div className="content-editor">
          <div className="editor-header">
            <h2>{category} - {selectedLanguage}</h2>
            <button className="btn-back" onClick={handleBackToLanguage}>
              ← Zurück
            </button>
          </div>

          {message && (
            <div className={`message ${message.includes('Fehler') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}

          {loading ? (
            <div className="loading">Laden...</div>
          ) : content.length === 0 ? (
            <div className="no-content">
              Kein Inhalt für {category} gefunden
            </div>
          ) : (
            <div className="content-list">
              {content.map((item) => {
                const lang = selectedLanguage === 'Deutsch' ? 'de' : 'en';
                const displayText = item.translations[lang] || '';

                return (
                  <div key={item.key} className="content-item">
                    <div className="content-item-header">
                      <h3>{item.description || item.key}</h3>
                      {editingKey !== item.key && (
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(item)}
                        >
                          Bearbeiten
                        </button>
                      )}
                    </div>

                    {editingKey === item.key ? (
                      <div className="edit-form">
                        <div className="form-group">
                          <label>{selectedLanguage}:</label>
                          <textarea
                            value={editForm}
                            onChange={(e) => setEditForm(e.target.value)}
                            rows={8}
                          />
                        </div>
                        <div className="form-actions">
                          <button
                            className="btn-save"
                            onClick={() => handleSave(item.key)}
                          >
                            Speichern
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={handleCancel}
                          >
                            Abbrechen
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="content-display">
                        <div className="language-section-single">
                          <p>{displayText || '(Nicht verfügbar)'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentSprache;