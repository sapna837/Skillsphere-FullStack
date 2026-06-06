const jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./User'); 
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ SkillSphere Database Connected!"))
  .catch((err) => console.error("❌ Database error:", err));

// 1. Job Schema
const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  budget: Number,
  clientName: String,
  clientEmail: String,
  createdAt: { type: Date, default: Date.now }
});
const Job = mongoose.model('Job', JobSchema);

// 🌟 2. NEW: Application Schema 
const ApplicationSchema = new mongoose.Schema({
  jobId: mongoose.Schema.Types.ObjectId,
  jobTitle: String,
  freelancerName: String,
  freelancerEmail: String,
  clientEmail: String,
  status: { type: String, default: 'Pending' },
  appliedAt: { type: Date, default: Date.now }
});
const Application = mongoose.model('Application', ApplicationSchema);

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, title } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email already exists" });

    const newUser = new User({ name, email, password, role, title });
    await newUser.save();
    res.status(201).json({ message: "Registration successful!" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user" });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || user.password !== password) return res.status(400).json({ message: "Invalid credentials" });

    res.json({
      user: { name: user.name, email: user.email, role: user.role, title: user.title, rate: user.rate }
    });
  } catch (error) {
    res.status(500).json({ message: "Login error" });
  }
});

// --- MARKETPLACE ROUTES ---
app.post('/api/jobs', async (req, res) => {
  const newJob = new Job(req.body);
  await newJob.save();
  res.json({ message: "Job Posted!" });
});

app.get('/api/jobs', async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.json(jobs);
});

// 🌟 3. NEW: APPLICATION ROUTES
app.post('/api/applications', async (req, res) => {
  try {
    const newApp = new Application(req.body);
    await newApp.save();
    res.json({ message: "Application sent successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit application" });
  }
});

app.get('/api/applications/:email', async (req, res) => {
  try {
    // This allows clients to see who applied to their specific jobs
    const apps = await Application.find({ clientEmail: req.params.email });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: "Error fetching applications" });
  }
});
// --- UPDATE APPLICATION STATUS ---
app.put('/api/applications/:id', async (req, res) => {
  try {
    const { status } = req.body; 
    const updatedApp = await Application.findByIdAndUpdate(
      req.params.id, 
      { status: status }, 
      { new: true }
    );
    res.json(updatedApp);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

// --- UPDATE APPLICATION STATUS ---
app.put('/api/applications/:id', async (req, res) => {
  try {
    const { status } = req.body; 
    const updatedApp = await Application.findByIdAndUpdate(
      req.params.id, 
      { status: status }, 
      { new: true }
    );
    res.json(updatedApp);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

// --- UPDATE APPLICATION STATUS ---
app.put('/api/applications/:id', async (req, res) => {
  try {
    const { status } = req.body; 
    const updatedApp = await Application.findByIdAndUpdate(
      req.params.id, 
      { status: status }, 
      { new: true }
    );
    res.json(updatedApp);
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
});

const PORT = 5000;

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));