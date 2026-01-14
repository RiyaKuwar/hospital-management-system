const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('.')); // Serve static files from current directory

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/hospital', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Schemas
const patientSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  dob: String,
  address: String,
  createdAt: { type: Date, default: Date.now }
});

const appointmentSchema = new mongoose.Schema({
  patientId: String,
  date: String,
  doctor: String,
  reason: String,
  createdAt: { type: Date, default: Date.now }
});

const ehrSchema = new mongoose.Schema({
  patientId: String,
  notes: String,
  diagnosis: String,
  treatment: String,
  createdAt: { type: Date, default: Date.now }
});

const paymentSchema = new mongoose.Schema({
  patientId: String,
  amount: Number,
  date: String,
  description: String,
  createdAt: { type: Date, default: Date.now }
});

const inventorySchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number,
  createdAt: { type: Date, default: Date.now }
});

// Models
const Patient = mongoose.model('Patient', patientSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const EHR = mongoose.model('EHR', ehrSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Inventory = mongoose.model('Inventory', inventorySchema);



// Routes

// Patients
app.get('/api/patients', async (req, res) => {
  try {
    const patients = await Patient.find();
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/patients', async (req, res) => {
  try {
    const patient = new Patient(req.body);
    const savedPatient = await patient.save();
    res.json(savedPatient);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    const savedAppointment = await appointment.save();
    res.json(savedAppointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// EHR
app.get('/api/ehr/:patientId', async (req, res) => {
  try {
    const records = await EHR.find({ patientId: req.params.patientId });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/ehr', async (req, res) => {
  try {
    const record = new EHR(req.body);
    const savedRecord = await record.save();
    res.json(savedRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Payments
app.get('/api/payments', async (req, res) => {
  try {
    const payments = await Payment.find();
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments', async (req, res) => {
  try {
    const payment = new Payment(req.body);
    const savedPayment = await payment.save();
    res.json(savedPayment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Inventory
app.get('/api/inventory', async (req, res) => {
  try {
    const inventory = await Inventory.find();
    res.json(inventory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const item = new Inventory(req.body);
    const savedItem = await item.save();
    res.json(savedItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
