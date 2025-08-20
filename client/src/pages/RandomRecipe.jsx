import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RandomRecipe() {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [plannerMessage, setPlannerMessage] = useState('');
  const [favMessage, setFavMessage] = useState('');

  const fetchRandomRecipe = () => {
    setLoading(true);
    setError(null);
    setFavMessage('');
    setPlannerMessage('');
    
    axios.get('/api/recipes/random')
      .then(response => {
        if (response.data && response.data.meals && response.data.meals[0]) {
          const meal = response.data.meals[0];
          setRecipe(meal);
          
          // Check if this new recipe is in favorites
          return axios.get('/api/favorites')
            .then(favResponse => {
              const exists = favResponse.data.some(fav => fav.id === meal.idMeal);
              setIsFavorited(exists);
              setLoading(false);
            });
        } else {
          setError('Failed to fetch a random recipe.');
          setLoading(false);
        }
      })
      .catch(err => {
        console.error('Error fetching random recipe:', err);
        setError('Failed to load random recipe from backend proxy.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchRandomRecipe();
  }, []);

  const getIngredientsList = (meal) => {
    const list = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      if (ingredient && ingredient.trim()) {
        list.push({
          name: ingredient.trim(),
          measure: measure ? measure.trim() : ''
        });
      }
    }
    return list;
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const handleToggleFavorite = () => {
    if (!recipe) return;

    if (isFavorited) {
      axios.delete(`/api/favorites/${recipe.idMeal}`)
        .then(() => {
          setIsFavorited(false);
          setFavMessage('Removed from Favorites!');
          setTimeout(() => setFavMessage(''), 3000);
        })
        .catch(err => console.error('Error removing from favorites:', err));
    } else {
      axios.post('/api/favorites', {
        id: recipe.idMeal,
        name: recipe.strMeal,
        thumbnail: recipe.strMealThumb,
        category: recipe.strCategory
      })
        .then(() => {
          setIsFavorited(true);
          setFavMessage('Added to Favorites!');
          setTimeout(() => setFavMessage(''), 3000);
        })
        .catch(err => console.error('Error adding to favorites:', err));
    }
  };

  const handleAddToPlanner = () => {
    if (!recipe) return;

    axios.post('/api/planner', {
      day: selectedDay,
      recipe: {
        id: recipe.idMeal,
        name: recipe.strMeal,
        thumbnail: recipe.strMealThumb,
        category: recipe.strCategory
      }
    })
      .then(() => {
        setPlannerMessage(`Successfully added to ${selectedDay}!`);
        setTimeout(() => setPlannerMessage(''), 3000);
      })
      .catch(err => {
        console.error('Error adding to planner:', err);
        setPlannerMessage('Failed to add to planner.');
      });
  };

  if (loading) {
    return (
      <div className="container loading-wrapper">
        <div className="loading-spinner"></div>
        <p>Curating a surprise dish just for you...</p>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="container error-wrapper">
        <p className="error-title">Mystery Dish Error</p>
        <p>{error || 'An unexpected error occurred.'}</p>
        <button onClick={fetchRandomRecipe} className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
          🔄 Try Again
        </button>
      </div>
    );
  }

  const ingredients = getIngredientsList(recipe);
  const embedUrl = getYoutubeEmbedUrl(recipe.strYoutube);

  return (
    <div className="container">
      {/* Header and Roll Again Button */}
      <div className="random-header-wrap">
        <div>
          <h2 className="section-title" style={{ fontSize: '1.5rem', color: 'var(--color-accent)' }}>
            ✨ Culinary Roulette
          </h2>
          <h1 className="recipe-title" style={{ marginTop: '0.25rem' }}>{recipe.strMeal}</h1>
        </div>
        <button onClick={fetchRandomRecipe} className="btn btn-primary" style={{ gap: '0.5rem' }}>
          🔄 Roll Another Surprise Recipe
        </button>
      </div>

      <div className="recipe-meta-strip" style={{ marginBottom: '2rem' }}>
        <span className="meta-item">🍽️ {recipe.strCategory}</span>
        <span className="meta-item">📍 {recipe.strArea} Cuisine</span>
        {recipe.strTags && (
          <span className="meta-item">🏷️ {recipe.strTags.split(',').join(', ')}</span>
        )}
      </div>

      {/* Main Detail Grid */}
      <div className="detail-container">
        {/* Left Side: Recipe Image & Instructions */}
        <div>
          <img
            src={recipe.strMealThumb}
            alt={recipe.strMeal}
            className="recipe-hero-image"
          />

          {/* Action Row */}
          <div className="recipe-actions">
            <div>
              <button
                onClick={handleToggleFavorite}
                className={`btn ${isFavorited ? 'btn-danger' : 'btn-primary'}`}
              >
                {isFavorited ? '❤️ Favorited' : '🤍 Add to Favorites'}
              </button>
              {favMessage && <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: 'var(--color-accent)', fontWeight: '500' }}>{favMessage}</span>}
            </div>

            <div className="planner-select-wrapper">
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="planner-select"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
              <button onClick={handleAddToPlanner} className="btn btn-secondary">
                📅 Add to Meal Planner
              </button>
              {plannerMessage && <span style={{ marginLeft: '10px', fontSize: '0.9rem', color: 'var(--color-accent)', fontWeight: '500' }}>{plannerMessage}</span>}
            </div>
          </div>

          <div className="recipe-instructions">
            <h2 className="instructions-title">Preparation Instructions</h2>
            <div className="instructions-steps">
              {recipe.strInstructions
                .split('\r\n')
                .filter(step => step.trim().length > 0)
                .map((step, idx) => (
                  <p key={idx} className="instruction-step">
                    <strong>{idx + 1}.</strong> {step}
                  </p>
                ))}
            </div>
          </div>
        </div>

        {/* Right Side: Ingredients List Card */}
        <div>
          <div className="ingredients-card">
            <h2 className="ingredients-title">Ingredients Check-list</h2>
            <ul className="ingredients-list">
              {ingredients.map((item, index) => (
                <li key={index} className="ingredients-item">
                  <span className="ingredient-name">
                    <span>🟢</span> {item.name}
                  </span>
                  <span className="ingredient-measure">{item.measure}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Optional YouTube Embed */}
      {embedUrl && (
        <div className="video-section">
          <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>
            Video Guide & Cooking Tutorial
          </h2>
          <p className="section-subtitle">Follow along with this step-by-step video tutorial</p>
          <div className="video-container">
            <iframe
              src={embedUrl}
              title={`${recipe.strMeal} YouTube Video`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}

export default RandomRecipe;
