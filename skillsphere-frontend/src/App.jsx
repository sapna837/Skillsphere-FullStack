import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  // 1. States
  const [isLoginView, setIsLoginView] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [currentUser, setCurrentUser] = useState(null);
  const [allJobs, setAllJobs] = useState([]);
  const [applicants, setApplicants] = useState([]); // 🌟 NEW: To store applications
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', role: 'Freelancer', title: '' 
  });
  const [newJob, setNewJob] = useState({ title: '', description: '', budget: '' });

  // 2. Load Session
  useEffect(() => {
    const saved = sessionStorage.getItem('skillsphere_user');
    if (saved) { 
      setCurrentUser(JSON.parse(saved)); 
      setIsLoggedIn(true); 
    }
  }, []);

  // 3. Handlers
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    const url = isLoginView ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await axios.post(`http://localhost:5000${url}`, formData);
      if (isLoginView) {
        setCurrentUser(res.data.user);
        setIsLoggedIn(true);
        
        // 🌟 FIX: Change from localStorage to sessionStorage to match your useEffect loading logic
        sessionStorage.setItem('skillsphere_user', JSON.stringify(res.data.user));
        
      } else {
        // Reset the form data state so the login screen is empty and clean
        setFormData({ name: '', email: '', password: '', role: 'Freelancer', title: '' });
        setIsLoginView(true);
        alert("Registration complete! Please login.");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Auth Error");
    }
  };

  const fetchJobs = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/jobs');
      setAllJobs(res.data);
    } catch (err) {
      console.error("Fetch error");
    }
  };

  // 🌟 NEW: Fetch applications for the Client
  const fetchApplicants = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/applications/${currentUser.email}`);
      setApplicants(res.data);
    } catch (err) {
      console.error("Error fetching applicants");
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/jobs', {
        ...newJob,
        clientName: currentUser.name,
        clientEmail: currentUser.email // Added this so freelancers can reference it
      });
      alert("Job Published!");
      setNewJob({ title: '', description: '', budget: '' });
      fetchJobs();
    } catch (err) {
      alert("Post failed");
    }
  };

  // 🌟 NEW: Handle Apply logic for Freelancers
  const handleApply = async (job) => {
    try {
      await axios.post('http://localhost:5000/api/applications', {
        jobId: job._id,
        jobTitle: job.title,
        freelancerName: currentUser.name,
        freelancerEmail: currentUser.email,
        clientEmail: job.clientEmail
      });
      alert(`Applied for ${job.title}!`);
    } catch (err) {
      alert("Application failed.");
    }
  };

  const handleStatusUpdate = async (appId, newStatus) => {
  try {
    await axios.put(`http://localhost:5000/api/applications/${appId}`, { status: newStatus });
    alert(`Application ${newStatus}!`);
    fetchApplicants(); // Refresh the list to show the updated status
  } catch (err) {
    alert("Error updating status");
  }
};

  // 4. Render
  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      {isLoggedIn ? (
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <nav style={{ display: 'flex', gap: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
            <button onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#2563EB', fontWeight: activeTab === 'profile' ? 'bold' : 'normal' }}>Profile</button>
            <button onClick={() => { setActiveTab('jobs'); fetchJobs(); }} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#2563EB', fontWeight: activeTab === 'jobs' ? 'bold' : 'normal' }}>Marketplace</button>
            
            {/* 🌟 NEW: Client-only Applications Tab */}
            {currentUser.role === 'Client' && (
              <button onClick={() => { setActiveTab('applicants'); fetchApplicants(); }} style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#2563EB', fontWeight: activeTab === 'applicants' ? 'bold' : 'normal' }}>Applicants</button>
            )}

            <button onClick={() => { sessionStorage.clear(); setIsLoggedIn(false); }} style={{ marginLeft: 'auto', color: 'red', cursor: 'pointer', border: 'none', background: 'none' }}>Logout</button>
          </nav>

          {activeTab === 'profile' && (
            <div>
              <h2>Welcome, {currentUser.name}!</h2>
              <div style={{ backgroundColor: '#F0FDF4', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <p>Role: <strong>{currentUser.role}</strong></p>
                {currentUser.role === 'Freelancer' && <p>Profession: <strong>{currentUser.title}</strong></p>}
              </div>

              {currentUser.role === 'Client' && (
                <div style={{ borderTop: '2px solid #eee', paddingTop: '20px' }}>
                  <h3>Post a Project</h3>
                  <form onSubmit={handlePostJob} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <input placeholder="Project Title" value={newJob.title} onChange={(e) => setNewJob({...newJob, title: e.target.value})} required style={{ padding: '8px' }} />
                    <textarea placeholder="Description" value={newJob.description} onChange={(e) => setNewJob({...newJob, description: e.target.value})} required style={{ padding: '8px' }} />
                    <input type="number" placeholder="Budget ($)" value={newJob.budget} onChange={(e) => setNewJob({...newJob, budget: e.target.value})} required style={{ padding: '8px' }} />
                    <button type="submit" style={{ backgroundColor: '#166534', color: 'white', padding: '10px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>Publish</button>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              <h3>Job Marketplace</h3>
              {allJobs.length === 0 ? <p>No jobs available yet.</p> : allJobs.map(job => (
                <div key={job._id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '10px' }}>
                  <h4>{job.title}</h4>
                  <p>{job.description}</p>
                  <p>💰 Budget: ${job.budget} | Client: {job.clientName}</p>
                  
                  {/* 🌟 NEW: Apply Button for Freelancers */}
                  {currentUser.role === 'Freelancer' && (
                    <button 
                      onClick={() => handleApply(job)}
                      style={{ marginTop: '10px', backgroundColor: '#2563EB', color: 'white', padding: '8px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'applicants' && (
  <div>
    <h3>Who Applied to Your Projects</h3>
    {applicants.length === 0 ? <p>No one has applied yet.</p> : applicants.map(app => (
      <div key={app._id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', marginBottom: '10px', backgroundColor: '#F9FAFB' }}>
        <p><strong>Job:</strong> {app.jobTitle}</p>
        <p><strong>Freelancer:</strong> {app.freelancerName}</p>
        <p><strong>Status:</strong> <span style={{ color: app.status === 'Accepted' ? 'green' : app.status === 'Rejected' ? 'red' : 'orange' }}>{app.status}</span></p>
        
        {/* Only show buttons if the status is still Pending */}
        {app.status === 'Pending' && (
          <div style={{ marginTop: '10px' }}>
            <button 
              onClick={() => handleStatusUpdate(app._id, 'Accepted')}
              style={{ backgroundColor: '#166534', color: 'white', marginRight: '10px', padding: '8px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
              Accept
            </button>
            <button 
              onClick={() => handleStatusUpdate(app._id, 'Rejected')}
              style={{ backgroundColor: '#991B1B', color: 'white', padding: '8px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}
            >
              Reject
            </button>
          </div>
        )}
      </div>
    ))}
  </div>
)}

        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h2>{isLoginView ? 'Login' : 'Create Account'}</h2>
          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {!isLoginView && (
              <>
                <input name="name" placeholder="Full Name" onChange={handleChange} required style={{ padding: '8px' }} />
                <select name="role" onChange={handleChange} style={{ padding: '8px' }}>
                  <option value="Freelancer">I am a Freelancer</option>
                  <option value="Client">I am a Client</option>
                </select>
                {formData.role === 'Freelancer' && (
                  <select name="title" onChange={handleChange} required style={{ padding: '8px' }}>
                    <option value="">Select Profession</option>
                    <option value="Web Developer">Web Developer</option>
                    <option value="Graphic Designer">Graphic Designer</option>
                    <option value="Content Writer">Content Writer</option>
                    <option value="Video Editor">Video Editor</option>
                  </select>
                )}
              </>
            )}
             <input 
  name="email" 
  type="email" 
  placeholder="Email" 
  value={formData.email} 
  onChange={handleChange} 
  autoComplete="off"
  required 
  style={{ padding: '8px' }} 
/>
<input 
  name="password" 
  type="password" 
  placeholder="Password" 
  value={formData.password} 
  onChange={handleChange} 
  autoComplete="new-password"
  required 
  style={{ padding: '8px' }} 
/>
            <button type="submit" style={{ backgroundColor: '#2563EB', color: 'white', padding: '10px', borderRadius: '5px', border: 'none', cursor: 'pointer' }}>
              {isLoginView ? 'Login' : 'Join SkillSphere'}
            </button>
          </form>
          <p onClick={() => setIsLoginView(!isLoginView)} style={{ color: '#2563EB', cursor: 'pointer', marginTop: '15px' }}>
            {isLoginView ? "New here? Register" : "Have an account? Login"}
          </p>
        </div>
      )}
    </div>
  );
}