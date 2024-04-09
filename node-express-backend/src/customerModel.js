const { Schema } = mongoose; 
import mongoose from 'mongoose';

// Define schema
const customerSchema = new Schema({
  name: { type: String },
  movie: { type: String },
  email: { type: String, required: true }
});

// Create model
const Customer = mongoose.model('Customer', customerSchema);

// Export model
export default Customer;
