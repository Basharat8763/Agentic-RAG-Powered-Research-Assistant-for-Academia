import React, { useState } from 'react';
import '../css/Login.css';


const Login = () => {
  const BASRURL = 'http://127.0.0.1:8000'
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    uni: '',
    field: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!isLogin) {
        // Registration logic with GET method
        const params = new URLSearchParams({
          name: formData.name,
          email: formData.email,
          uni: formData.uni,
          field: formData.field,
          pass: formData.password
        });

        const response = await fetch(`${BASRURL}/signup?${params}`);

        const data = await response.json();
        console.log(response.ok);

        if (response.ok) {
          if (data.message === 'Success') {
            setSuccess('Account created successfully! You can now login.');
            // Reset form
            setFormData({
              name: '',
              email: '',
              uni: '',
              field: '',
              password: ''
            });
            // Switch to login after successful registration
            setTimeout(() => setIsLogin(true), 2000);
          } else if (data.message === 'Try with another email') {
            setError('This email is already registered. Please try with another email.');
          } else {
            setError(data.message || 'Registration failed. Please try again.');
          }
        } else {
          setError(data.message || 'Registration failed. Please try again.');
        }
      } else {
        const params = new URLSearchParams({
          'mail': formData.email,
          'pass': formData.password,
        })

        const ff = await fetch(`${BASRURL}/login?${params}`)
        const data=await ff.json()
        console.log(data.message);
        
        if(data.message === 'Invalid User'){
            setError("Invalid User")
        }else{
          localStorage.setItem('authToken',data.message)
          location.href='/dashboard'
          setSuccess('Login SuccessFully Done');
        }
        // For now, just log the data
      }
    } catch (err) {
      setError(err.message || 'Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    if (!isLogin) {
      if (!formData.name || !formData.email || !formData.uni || !formData.field || !formData.password) {
        setError('All fields are required');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    } else {
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        return false;
      }
    }
    return true;
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (validateForm()) {
      handleSubmit(e);
    }
  };

  // Clear messages when switching between login/register
  const handleToggle = (isLoginMode) => {
    setIsLogin(isLoginMode);
    setError('');
    setSuccess('');
    // Clear form when switching to login
    if (isLoginMode) {
      setFormData({
        name: '',
        email: '',
        uni: '',
        field: '',
        password: ''
      });
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="background-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="login-card">
        <div className="card-header">
          <div className="logo-section">
            <div className="logo-icon">📚</div>
            <div className="logo-text">
              <h1>ScholarCite</h1>
              <p>Academic Citation Platform</p>
            </div>
          </div>
        </div>

        <div className="toggle-section">
          <div className="toggle-buttons">
            <button
              className={`toggle-btn ${isLogin ? 'active' : ''}`}
              onClick={() => handleToggle(true)}
              type="button"
            >
              Login
            </button>
            <button
              className={`toggle-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => handleToggle(false)}
              type="button"
            >
              Register
            </button>
          </div>
          <div className="toggle-indicator"></div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="success-message">
            ✅ {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={submitHandler} className={`login-form ${isLoading ? 'loading' : ''}`}>
          <h2 className="form-title">
            {isLogin ? 'Welcome Back' : 'Join ScholarCite'}
            <span>{isLogin ? 'Sign in to your account' : 'Create your research account'}</span>
          </h2>

          {!isLogin && (
            <div className="input-group">
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-input"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="input-group">
            <input
              type="email"
              name="email"
              placeholder="Institutional Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              disabled={isLoading}
            />
          </div>

          {!isLogin && (
            <>
              <div className="input-group">
                <input
                  type="text"
                  name="uni"
                  placeholder="University/Institution"
                  value={formData.uni}
                  onChange={handleChange}
                  required
                  className="form-input"
                  disabled={isLoading}
                />
              </div>
              <div className="input-group">
                <select
                  name="field"
                  value={formData.field}
                  onChange={handleChange}
                  required
                  className="form-select"
                  disabled={isLoading}
                >
                  <option value="">Select Research Field</option>
                  <option value="computer-science">Computer Science</option>
                  <option value="biology">Biology</option>
                  <option value="physics">Physics</option>
                  <option value="medicine">Medicine</option>
                  <option value="engineering">Engineering</option>
                  <option value="social-sciences">Social Sciences</option>
                  <option value="humanities">Humanities</option>
                  <option value="mathematics">Mathematics</option>
                  <option value="chemistry">Chemistry</option>
                  <option value="business">Business</option>
                  <option value="law">Law</option>
                  <option value="education">Education</option>
                  <option value="other">Other</option>
                </select>
                <div className="select-arrow">▼</div>
              </div>
            </>
          )}

          <div className="input-group">
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
              disabled={isLoading}
              minLength="6"
            />
          </div>

          <button
            type="submit"
            className={`submit-btn ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
            <div className="btn-loader"></div>
          </button>

        </form>

        <div className="card-footer">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button
                onClick={() => handleToggle(false)}
                className="link-btn"
                disabled={isLoading}
              >
                Register now
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => handleToggle(true)}
                className="link-btn"
                disabled={isLoading}
              >
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;