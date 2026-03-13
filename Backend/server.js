const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes.js');
const userRoutes = require('./routes/userRoutes.js');
const hospitalRoutes = require('./routes/hospitalRoutes.js');
const emergencyRoutes = require('./routes/emergencyRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const campRoutes = require('./routes/campRoutes');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/emergency', emergencyRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/camps', campRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const startServer = (port) => {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Connected to Supabase');
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying another port...`);
      startServer(port + 1);
    } else {
      console.error(err);
    }
  });
};

startServer(PORT);
