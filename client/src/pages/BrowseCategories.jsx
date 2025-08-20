import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function BrowseCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get('/api/categories')
      .then(response => {
        if (response.data && response.data.categories) {
          setCategories(response.data.categories);
        } else {
          setCategories([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        setError('Failed to fetch meal categories.');
        setLoading(false);
      });
  }, []);

  return (
    <div className="container">
      <div className="section-header">
        <div>
          <h2 className="section-title">Browse by Category</h2>
          <p className="section-subtitle">Select a category to discover tailored recipes</p>
        </div>
      </div>

      {loading ? (
        <div className="loading-wrapper">
          <div className="loading-spinner"></div>
          <p>Organizing delicious categories...</p>
        </div>
      ) : error ? (
        <div className="error-wrapper">
          <p className="error-title">Error Loading Categories</p>
          <p>{error}</p>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((cat) => (
            <Link key={cat.idCategory} to={`/category/${cat.strCategory}`} className="category-card">
              <img
                src={cat.strCategoryThumb}
                alt={cat.strCategory}
                className="category-card-img"
                loading="lazy"
              />
              <h3 className="category-card-title">{cat.strCategory}</h3>
              <p className="category-card-desc">{cat.strCategoryDescription}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default BrowseCategories;
