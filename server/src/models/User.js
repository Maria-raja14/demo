const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['salesperson', 'manager', 'admin'], 
    required: true 
  },
  companyId: { type: String, required: true },
  divisionId: { type: String, required: true },
  vanId: { type: String },
  isActive: { type: Boolean, default: true },
  lastSync: { type: Date },
  permissions: {
    canCreateOrders: { type: Boolean, default: true },
    canProcessPayments: { type: Boolean, default: true },
    canManageInventory: { type: Boolean, default: true },
    canViewReports: { type: Boolean, default: true },
    canManageVisits: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);