const express = require('express');
const connectDB = require('./db');
const mockResponses = require('./routes/mockResponses');

connectDB();

const app = express();
app.use(express.json());

app.get('/ping', (req, res) => {
  res.json({
    ping: 'pong',
  });
});

app.use('/api/mockResponses', mockResponses);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in port ${PORT}`);
});
