const express = require('express');
const router = express.Router();

// GET all items
router.get('/items', (req, res) => {
  res.json({
    success: true,
    message: 'Successfully retrieved all items',
    data: [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
      { id: 3, name: 'Item 3' }
    ]
  });
});

// GET single item by ID
router.get('/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  res.json({
    success: true,
    message: `Successfully retrieved item ${id}`,
    data: { id, name: `Item ${id}` }
  });
});

// POST create new item
router.post('/items', (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Name is required'
    });
  }
  
  res.status(201).json({
    success: true,
    message: 'Item created successfully',
    data: { id: 4, name }
  });
});

// PUT update item
router.put('/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({
      success: false,
      message: 'Name is required'
    });
  }
  
  res.json({
    success: true,
    message: `Item ${id} updated successfully`,
    data: { id, name }
  });
});

// DELETE item
router.delete('/items/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  res.json({
    success: true,
    message: `Item ${id} deleted successfully`
  });
});

module.exports = router;