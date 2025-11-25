import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // We fixed this export earlier
import '../components/forms/ExpenseForm.css';

function SignUpPage() {
  // We only pull 'login' and 'PROD_URL' because that's all AuthContext provides
  const { login, PROD_URL } = useAuth(); 
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Send data to your Backend
      const res = await fetch(`${PROD_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      // 2. If successful, log the user in using the context
      login(data.user, data.token);

      // 3. Redirect to Dashboard
      navigate('/');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2>Create Account</h2>
      <p>Start tracking your wealth today.</p>
      
      {error && <p style={{ color: 'red', backgroundColor: '#ffe6e6', padding: '10px', borderRadius: '5px' }}>{error}</p>}

      <form onSubmit={handleSubmit} className="expense-form">
        <div className="form-group">
          <label>Full Name</label>
          <input 
            type="text" 
            value={fullName} 
            onChange={(e) => setFullName(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>

        <button type="submit" className="submit-btn" style={{ marginTop: '20px', width: '100%' }}>
          Sign Up
        </button>
      </form>

      <p style={{ marginTop: '20px' }}>
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  );
}

export default SignUpPage;