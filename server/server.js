const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Base URL for TheMealDB API
const THEMEALDB_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// In-memory data storage (resets on server restart)
let favorites = [];
let planner = {
  Monday: [],
  Tuesday: [],
  Wednesday: [],
  Thursday: [],
  Friday: [],
  Saturday: [],
  Sunday: []
};

// ==========================================
// 1. PROXY ROUTES (THEMEALDB API INTEGRATION)
// ==========================================

// GET /api/recipes/search?q=keyword
app.get('/api/recipes/search', async (req, res) => {
  try {
    const keyword = req.query.q || '';
    const response = await axios.get(`${THEMEALDB_BASE_URL}/search.php?s=${keyword}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching search results:', error.message);
    res.status(500).json({ error: 'Failed to fetch recipes from external API' });
  }
});

// GET /api/recipes/random
app.get('/api/recipes/random', async (req, res) => {
  try {
    const response = await axios.get(`${THEMEALDB_BASE_URL}/random.php`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching random recipe:', error.message);
    res.status(500).json({ error: 'Failed to fetch random recipe from external API' });
  }
});

// GET /api/categories
app.get('/api/categories', async (req, res) => {
  try {
    const response = await axios.get(`${THEMEALDB_BASE_URL}/categories.php`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({ error: 'Failed to fetch categories from external API' });
  }
});

// GET /api/recipes/category/:name
app.get('/api/recipes/category/:name', async (req, res) => {
  try {
    const categoryName = req.params.name;
    const response = await axios.get(`${THEMEALDB_BASE_URL}/filter.php?c=${categoryName}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching category recipes for ${req.params.name}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch recipes by category from external API' });
  }
});

// GET /api/cuisines
app.get('/api/cuisines', async (req, res) => {
  try {
    const response = await axios.get(`${THEMEALDB_BASE_URL}/list.php?a=list`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching cuisines:', error.message);
    res.status(500).json({ error: 'Failed to fetch cuisines from external API' });
  }
});

// GET /api/recipes/cuisine/:name
app.get('/api/recipes/cuisine/:name', async (req, res) => {
  try {
    const cuisineName = req.params.name;
    const response = await axios.get(`${THEMEALDB_BASE_URL}/filter.php?a=${cuisineName}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching cuisine recipes for ${req.params.name}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch recipes by cuisine from external API' });
  }
});

// GET /api/recipes/:id (Put this last so it doesn't match 'random' or 'search')
app.get('/api/recipes/:id', async (req, res) => {
  try {
    const recipeId = req.params.id;
    const response = await axios.get(`${THEMEALDB_BASE_URL}/lookup.php?i=${recipeId}`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching recipe details for ${req.params.id}:`, error.message);
    res.status(500).json({ error: 'Failed to fetch recipe details from external API' });
  }
});

// ==========================================
// 2. FAVORITES ROUTES (IN-MEMORY STORAGE)
// ==========================================

// GET /api/favorites
app.get('/api/favorites', (req, res) => {
  res.json(favorites);
});

// POST /api/favorites
app.post('/api/favorites', (req, res) => {
  const { id, name, thumbnail, category } = req.body;
  
  if (!id || !name) {
    return res.status(400).json({ error: 'Recipe id and name are required' });
  }

  // Check if it already exists in favorites
  const exists = favorites.find(fav => fav.id === id);
  if (exists) {
    return res.status(200).json({ message: 'Recipe already in favorites', favorites });
  }

  const newFavorite = { id, name, thumbnail, category };
  favorites.push(newFavorite);
  res.status(201).json({ message: 'Recipe added to favorites', favorites });
});

// DELETE /api/favorites/:id
app.delete('/api/favorites/:id', (req, res) => {
  const recipeId = req.params.id;
  favorites = favorites.filter(fav => fav.id !== recipeId);
  res.json({ message: 'Recipe removed from favorites', favorites });
});

// ==========================================
// 3. MEAL PLANNER ROUTES (IN-MEMORY STORAGE)
// ==========================================

// GET /api/planner
app.get('/api/planner', (req, res) => {
  res.json(planner);
});

// POST /api/planner
app.post('/api/planner', (req, res) => {
  const { day, recipe } = req.body;

  if (!day || !recipe || !recipe.id || !recipe.name) {
    return res.status(400).json({ error: 'Day and recipe details (id, name) are required' });
  }

  if (!planner[day]) {
    return res.status(400).json({ error: 'Invalid day of the week' });
  }

  // Check if recipe is already added to that specific day
  const alreadyPlanned = planner[day].find(item => item.id === recipe.id);
  if (alreadyPlanned) {
    return res.status(200).json({ message: `Recipe already planned for ${day}`, planner });
  }

  const plannedRecipe = {
    id: recipe.id,
    name: recipe.name,
    thumbnail: recipe.thumbnail || '',
    category: recipe.category || ''
  };

  planner[day].push(plannedRecipe);
  res.status(201).json({ message: `Recipe added to ${day}'s plan`, planner });
});

// DELETE /api/planner/:day/:id
app.delete('/api/planner/:day/:id', (req, res) => {
  const { day, id } = req.params;

  if (!planner[day]) {
    return res.status(400).json({ error: 'Invalid day of the week' });
  }

  planner[day] = planner[day].filter(item => item.id !== id);
  res.json({ message: `Recipe removed from ${day}'s plan`, planner });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
