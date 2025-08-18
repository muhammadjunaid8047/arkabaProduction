import mongoose from 'mongoose';

let initialized = false;

export const connect = async () => {
  mongoose.set('strictQuery', true);
  if (initialized) {
    console.log('Already connected to MongoDB');
    return;
  }
  // mongodb+srv://muhammadjunaid3164:ink5pbLYEkajG8Ut@cluster0.tpiroy5.mongodb.net/
  try {
    // await mongoose.connect('mongodb+srv://arkaba:arkaba@cluster0.osatsz6.mongodb.net/', {
    await mongoose.connect(process.env.Mongo, {
      
      
      dbName: 'Arkaba',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    initialized = true;
  } catch (error) {
    console.log('Error connecting to MongoDB:', error);
  }
};
