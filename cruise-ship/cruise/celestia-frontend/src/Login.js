import React, { useState, useEffect } from 'react';
import { auth, db } from './firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('idToken')) {
      // User already logged in, redirect to dashboard or home
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get Firebase ID token and store it for API requests
      const idToken = await user.getIdToken();
      localStorage.setItem('idToken', idToken);

      // Fetch user role and approval status from Firestore using modular API
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        alert('User data not found. Please contact admin.');
        return;
      }
      const userData = userDoc.data();

      if (!userData.approved && userData.role.toLowerCase() !== 'admin') {
        navigate('/', { replace: true });
        alert('Your account is pending admin approval.');
        return;
      }

      // Redirect based on role, using replace to prevent back navigation to login
      switch (userData.role.toLowerCase()) {
        case 'admin':
          navigate('/admin', { replace: true });
          break;
        case 'voyager':
          navigate('/voyager', { replace: true });
          break;
        case 'manager':
          navigate('/manager', { replace: true });
          break;
        case 'head cook':
          navigate('/head-cook', { replace: true });
          break;
        case 'supervisor':
          navigate('/supervisor', { replace: true });
          break;
        case 'guest':
          navigate('/guest', { replace: true });
          break;
        default:
          navigate('/', { replace: true });
          break;
      }
    } catch (error) {
      console.error("Error logging in: ", error);
      alert(error.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      <form onSubmit={handleLogin} className="auth-form">
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
        <button type="submit" className="auth-button">Login</button>
      </form>
      <div className="auth-links">
        <p>New user? <Link to="/signup">Register here</Link></p>
        <p><Link to="/forgot-password">Forgot password?</Link></p>
      </div>
    </div>
  );
};

export default Login;
