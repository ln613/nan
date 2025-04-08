const express = require('express');
const path = require('path');
const cors = require('cors');
const exec = require('mz/child_process').exec;
const dmmRoutes = require('./routes/dmm');

// Initialize express app
const app = express();


// Define port
const PORT = process.env.PORT || 705;

let file

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, '../public')));

app.use('/dmm', dmmRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Express server is running');
});

// fn is full path
app.get('/exec/:fn', (req, res) => {
  const fn = req.params.fn;
  if (fn && file !== fn) exec('"' + fn + '"');
  file = fn;
  setTimeout(() => file = null, 1000);
  res.end();
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;