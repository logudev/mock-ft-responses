const mongoose = require('mongoose');

const MONGO_URI =
  'mongodb://logd:stage2%40qa@10.176.20.197:27017/mockResponses?authSource=mockResponses&readPreference=primary&ssl=false';

const connectDB = async () => {
  try {
    console.log('Connecting to MongoDB');
    const conn = await mongoose.connect(MONGO_URI, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.log(`Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
