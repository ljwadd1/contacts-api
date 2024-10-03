import express from 'express';
import contactsRouter from './routes/contacts.js';
import cors from 'cors';

// Setup
const port = process.env.PORT || 3000;
const app = express();
//var cors = require('cors');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());

// API routes
app.use('/api/contacts', contactsRouter);

// Start server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


