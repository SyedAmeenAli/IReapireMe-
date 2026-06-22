const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/irepairme';

console.log('Connecting to:', MONGO_URI);
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Schema
    const UserSchema = new mongoose.Schema({
      email: String,
      role: String
    }, { collection: 'users' });
    
    const User = mongoose.models.User || mongoose.model('User', UserSchema);
    
    return User.findOne({ email: 'amanziyan2004@gmail.com' });
  })
  .then(user => {
    console.log('User found in db:', user);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error encountered:', err);
    process.exit(1);
  });
