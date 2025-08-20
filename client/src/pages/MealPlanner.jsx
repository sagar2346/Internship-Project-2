import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function MealPlanner() {
  const [planner, setPlanner] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];

  useEffect(() => {
    fetchPlanner();
  }, []);

  const fetchPlanner = () => {
    setLoading(true);
    axios.get('/api/planner')
      .then(response => {
        setPlanner(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching planner:', err);
        setError('Failed to load weekly meal planner.');
        setLoading(false);
      });
  };

  const handleRemoveMeal = (day, id) => {
    axios.delete(`/api/planner/${day}/${id}`)
      .then(response => {
        setPlanner(response.data.planner || {});
      })
      .catch(err => {
        console.error('Error removing meal from planner:', err);
      });
  };

  return (
    <div className="container" style={{ maxWidth: '1400px' }}>
      <div className="section-header">
        <div>
          <h2 className="section-title">Weekly Meal Planner</h2>
          <p className="section-subtitle">Plan, track, and organize your weekly dining schedule</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p>Mapping out your weekly culinary calendar...</p>
        </div>
      ) : error ? (
        <div className="error-wrapper">
          <p className="error-title">Load Failure</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="planner-grid">
          {daysOfWeek.map((day) => {
            const dayMeals = planner[day] || [];
            return (
              <div key={day} className="planner-day-column">
                <div className="planner-day-header">{day}</div>
                
                <div className="planner-meals-list">
                  {dayMeals.length === 0 ? (
                    <div className="planner-empty-state">
                      No meals<br/>scheduled
                    </div>
                  ) : (
                    dayMeals.map((meal) => (
                      <div key={meal.id} className="planner-meal-card">
                        <Link to={`/recipe/${meal.id}`}>
                          <img
                            src={meal.thumbnail}
                            alt={meal.name}
                            className="planner-meal-img"
                          />
                        </Link>
                        <Link to={`/recipe/${meal.id}`} className="planner-meal-title" title={meal.name}>
                          {meal.name}
                        </Link>
                        <button
                          onClick={() => handleRemoveMeal(day, meal.id)}
                          className="btn btn-danger"
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            marginTop: '0.25rem',
                            width: '100%'
                          }}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MealPlanner;
