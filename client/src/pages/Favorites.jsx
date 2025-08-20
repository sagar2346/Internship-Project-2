import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = () => {
    setLoading(true);
    axios.get('/api/favorites')
      .then(response => {
        setFavorites(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching favorites:', err);
        setError('Failed to fetch your saved favorites list.');
        setLoading(false);
      });
  };

  const handleRemoveFavorite = (e, id) => {
    e.preventDefault(); // Stop navigation if wrap card is link
    
    axios.delete(`/api/favorites/${id}`)
      .then(response => {
        setFavorites(response.data.favorites || []);
      })
      .catch(err => {
        console.error('Error removing favorite:', err);
      });
  };

  return (
    <div className="container">
      <div className="section-header">
        <div>
          <h2 className="section-title">Your Favorites</h2>
          <p className="section-subtitle">Your personalized list of saved culinary creations</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p>Opening your custom recipe vault...</p>
        </div>
      ) : error ? (
        <div className="error-wrapper">
          <p className="error-title">Load Failure</p>
          <p>{error}</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="empty-wrapper">
          <span style={{ fontSize: '3.5rem' }}>❤️</span>
          <p className="empty-title">No Favorites Yet</p>
          <p>Explore recipes and save them to build your custom culinary cookbook!</p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/" className="btn btn-primary">
              Discover Recipes
            </Link>
          </div>
        </div>
      ) : (
        <div className="recipe-grid">
          {favorites.map((fav) => (
            <div key={fav.id} className="recipe-card">
              <div className="recipe-card-img-wrapper">
                <img
                  src={fav.thumbnail}
                  alt={fav.name}
                  className="recipe-card-img"
                  loading="lazy"
                />
                <span className="recipe-card-category">{fav.category}</span>
              </div>
              <div className="recipe-card-content">
                <h3 className="recipe-card-title">{fav.name}</h3>
                
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', alignItems: 'center' }}>
                  <Link to={`/recipe/${fav.id}`} className="btn btn-secondary" style={{ flexGrow: 1, padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                    Cook Now
                  </Link>
                  <button
                    onClick={(e) => handleRemoveFavorite(e, fav.id)}
                    className="btn btn-danger"
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                    title="Remove from favorites"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Favorites;
