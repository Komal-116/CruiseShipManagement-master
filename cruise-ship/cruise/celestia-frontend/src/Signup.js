import React, { useState } from 'react';
import { auth, db } from './firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('Voyager'); // Default role

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let approvedStatus = false;
      if (role === 'Admin') {
        // Check if an approved admin already exists
        const adminQuery = query(collection(db, 'users'), where('role', '==', 'Admin'), where('approved', '==', true));
        const adminSnapshot = await getDocs(adminQuery);
        if (adminSnapshot.empty) {
          // No approved admin exists, approve this admin
          approvedStatus = true;
        } else {
          // Approved admin exists, new admin needs approval
          approvedStatus = false;
        }
      }

      // Save user data to Firestore using modular API
      await setDoc(doc(db, 'users', user.uid), {
        name: name,
        email: user.email,
        phone: phone,
        role: role,
        approved: role === 'Admin' ? approvedStatus : false
      });

      if (role === 'Admin' && approvedStatus) {
        alert('Signup successful! You are approved as Admin.');
      } else if (role === 'Admin' && !approvedStatus) {
        alert('Signup successful! Admin approval is required from the existing admin.');
      } else {
        alert('Signup successful! Please wait for admin approval.');
      }
    } catch (error) {
      console.error("Error signing up: ", error);
      alert(error.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Signup</h2>
      <form onSubmit={handleSignup} className="auth-form">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="auth-input"
        />
        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="auth-input"
        />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="auth-select">
          <option value="Voyager">Voyager</option>
          <option value="Admin">Admin</option>
          <option value="Manager">Manager</option>
          <option value="Head Cook">Head Cook</option>
          <option value="Supervisor">Supervisor</option>
        </select>
        <button type="submit" className="auth-button">Sign Up</button>
      </form>
      <div className="auth-links">
        <p>Already have an account? <Link to="/login">Login here</Link></p>
      </div>
    </div>
  );
};

export default Signup;
