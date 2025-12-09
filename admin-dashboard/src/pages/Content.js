import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Content.css';

const Content = () => {
  const navigate = useNavigate();

  const categories = [
    { name: 'Datenschutz', path: '/content-sprache?category=Datenschutz' },
    { name: 'FAQ', path: '/content-sprache?category=FAQ' },
    { name: 'Impressum', path: '/content-sprache?category=Impressum' }
  ];

  return (
    <div className="content-page">
      <header className="content-header">
        <h1>Text ändern</h1>
        <p>Wählen Sie eine Kategorie zum Bearbeiten</p>
      </header>

      <div className="category-selection">
        {categories.map((category) => (
          <button
            key={category.name}
            className="category-button"
            onClick={() => navigate(category.path)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Content;