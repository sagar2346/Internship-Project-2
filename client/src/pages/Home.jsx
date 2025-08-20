import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch some default recipes to show as "Featured" on the home page (e.g. search query 'a')
    axios.get('/api/recipes/search?q=a')
      .then(response => {
        if (response.data && response.data.meals) {
          // Take the first 6 meals as featured
          setFeaturedRecipes(response.data.meals.slice(0, 6));
        } else {
          setFeaturedRecipes([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching featured recipes:', err);
        setError('Could not load featured recipes at this time.');
        setLoading(false);
      });
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <h1 className="hero-title">
            Discover <span>Exquisite</span> Recipes & Plan Your Weekly Meals
          </h1>
          <p className="hero-subtitle">
            Explore thousands of gourmet recipes from across the globe, save your favorite selections, and coordinate your dining schedule effortlessly.
          </p>

          {/* Search Bar */}
          <form className="search-form" onSubmit={handleSearchSubmit}>
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search for ingredients, dishes, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-button">
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured Section */}
      <div className="container">
        <div className="section-header">
          <div>
            <h2 className="section-title">Featured Culinary Delights</h2>
            <p className="section-subtitle">Specially curated recipes to inspire your next chef-d'oeuvre</p>
          </div>
        </div>

        {loading ? (
          <div className="loading-wrapper">
            <div className="loading-spinner"></div>
            <p>Loading featured recipes...</p>
          </div>
        ) : error ? (
          <div className="error-wrapper">
            <p className="error-title">Oops!</p>
            <p>{error}</p>
          </div>
        ) : (
          <div className="recipe-grid">
            {featuredRecipes.map((recipe) => (
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
                      View Recipe ➔
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
