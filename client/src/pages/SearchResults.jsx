import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!query) {
      setRecipes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    axios.get(`/api/recipes/search?q=${encodeURIComponent(query)}`)
      .then(response => {
        if (response.data && response.data.meals) {
          setRecipes(response.data.meals);
        } else {
          setRecipes([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error searching recipes:', err);
        setError('An error occurred while fetching search results.');
        setLoading(false);
      });
  }, [query]);

  return (
    <div className="container">
      <div className="section-header">
        <div>
          <h2 className="section-title">Search Results</h2>
          <p className="section-subtitle">Showing results for: "{query}"</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p>Finding the perfect recipes for you...</p>
        </div>
      ) : error ? (
        <div className="error-wrapper">
          <p className="error-title">Search Failed</p>
          <p>{error}</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="empty-wrapper">
          <span style={{ fontSize: '3rem' }}>🔍</span>
          <p className="empty-title">No Recipes Found</p>
          <p>We couldn't find any recipes matching "{query}". Try searching for another ingredient or dish!</p>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/" className="btn btn-primary">
              Return to Home
            </Link>
          </div>
        </div>
      ) : (
        <div className="recipe-grid">
          {recipes.map((recipe) => (
            <div key={recipe.idMeal} className="recipe-card">
              <div className="recipe-card-img-wrapper">
                <img
                  src={recipe.strMealThumb}
                  alt={recipe.strMeal}
                  className="recipe-card-img"
                  loading="lazy"
                />
                <span className="recipe-card-category">{recipe.strCategory}</span>
              </div>
              <div className="recipe-card-content">
                <h3 className="recipe-card-title">{recipe.strMeal}</h3>
                <div className="recipe-card-info">
                  <span>📍 {recipe.strArea} Cuisine</span>
                  <Link to={`/recipe/${recipe.idMeal}`} className="recipe-card-btn">
                    View Details ➔
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResults;
