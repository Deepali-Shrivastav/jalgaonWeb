import React, { useState, useContext, useEffect } from 'react';
import './LoginSignup.css';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { FormContext } from '../../context/FormContext';
import { UserContext } from '../../context/UserContext';
import { MdPhone, MdLock, MdVisibility, MdVisibilityOff, MdAdminPanelSettings } from 'react-icons/md';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const client = axios.create({ baseURL: import.meta.env.VITE_DJANGO_API });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

function LoginSignup() {
  const djangoApi = import.meta.env.VITE_DJANGO_API;
  const { user, setUser, isLogin, setIsLogin } = useContext(UserContext);
  const { closeForm, setCloseForm } = useContext(FormContext);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [isNumber, setIsNumber] = useState(false); // Default to Login now
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${djangoApi}/api/v1/auth/csrf-token/`);
      return response.data.csrfToken;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      return '';
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    const csrfToken = await getCsrfToken();

    try {
      await axios.post(`${djangoApi}/api/v1/auth/register/`, {
        phone_number: phoneNumber,
        password: userPassword
      }, {
        headers: { 'X-CSRFToken': csrfToken }
      });
      handleLoginSubmit(e); // auto login after register
    } catch (error) {
      console.error('Registration failed', error);
      setErrorMessage(error.response?.data?.error || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    const csrfToken = await getCsrfToken();

    try {
      const response = await axios.post(`${djangoApi}/api/v1/auth/login/`, {
        phone_number: phoneNumber,
        password: userPassword
      }, {
        headers: { 'X-CSRFToken': csrfToken },
        withCredentials: true
      });

      const { user, token } = response.data;
      setUser(user);
      setIsLogin(true);
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // If user is admin/staff, route them to /admin immediately or just close form
      if (['super_admin', 'admin', 'moderator', 'content_manager'].includes(user.role)) {
          window.location.href = '/admin'; // Force redirect to admin dashboard
      } else {
          setCloseForm(true);
      }

      await getTokenKey(csrfToken);
    } catch (error) {
      console.error('Login failed', error);
      setErrorMessage(error.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTokenKey = async (csrfToken) => {
    try {
      const response = await axios.post(`${djangoApi}/api/v1/auth/token-key/`, {
        phone_number: phoneNumber,
        password: userPassword
      },{
        headers: {
          'X-CSRFToken': csrfToken,
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (response.status === 200) {
        localStorage.setItem('tokenKey', response.data.token);
      }
    } catch (error) {
      console.error('Error fetching token key:', error);
    }
  };

  useEffect(() => {
    const checkUserSession = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await client.get('/api/v1/auth/user/');
          setUser(res.data.user);
          setIsLogin(true);
        } catch (error) {
          setUser(null);
          setIsLogin(false);
        }
      }
    };
    checkUserSession();
  }, [setUser, setIsLogin]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (!closeForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [closeForm]);

  return (
    <div className={`login_signup_container ${closeForm ? "close_form" : ""}`}>
      <div className="login_form">
        <div className="close_btn" onClick={() => setCloseForm(true)}>
          <i className='bx bx-x'></i>
        </div>
        
        {/* Registration Form */}
        <form onSubmit={handleSubmit} className={`${isNumber ? "activeForm" : "noForm"}`}>
          <div className="login_header">
            <div className="login_logo_container">
                <img src={assets.logo} alt="Jalgaon Logo" className="login_brand_logo" />
            </div>
            <h1>Create Account</h1>
            <p>Join Jalgaon.com to get started</p>
          </div>

          <div className="input_group">
            <label htmlFor="reg-mobile">Mobile Number</label>
            <div className="input_wrapper">
              <MdPhone className="input_icon" />
              <input 
                type="tel" 
                value={phoneNumber} 
                id="reg-mobile" 
                placeholder="Enter 10-digit number"
                onChange={(e) => setPhoneNumber(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="input_group">
            <label htmlFor="reg-password">Password</label>
            <div className="input_wrapper">
              <MdLock className="input_icon" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={userPassword} 
                id="reg-password" 
                placeholder="Create a strong password"
                onChange={(e) => setUserPassword(e.target.value)} 
                required 
              />
              <div className="password_toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </div>
            </div>
          </div>

          <span className="terms_text">By registering, you accept our terms and conditions.</span>
          {errorMessage && <p className="error_message">{errorMessage}</p>}
          
          <button type="submit" className="submit_button" disabled={isLoading}>
            {isLoading ? <span className="loader_spinner"></span> : <span>Create Account</span>}
          </button>
          
          <div className="switch_form_text">
            <p>Already have an account? <span onClick={() => {setIsNumber(false); setErrorMessage('');}}>Log In</span></p>
          </div>
        </form>

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className={`${!isNumber ? "activeForm" : "noForm"}`}>
          <div className="login_header">
            <div className="login_logo_container">
                <MdAdminPanelSettings className="login_admin_icon" />
            </div>
            <h1>Welcome Back</h1>
            <p>Log in to your account or admin portal</p>
          </div>

          <div className="input_group">
            <label htmlFor="login-mobile">Mobile Number</label>
            <div className="input_wrapper">
              <MdPhone className="input_icon" />
              <input 
                type="tel" 
                value={phoneNumber} 
                id="login-mobile" 
                placeholder="Enter your registered number"
                onChange={(e) => setPhoneNumber(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="input_group">
            <label htmlFor="login-password">Password</label>
            <div className="input_wrapper">
              <MdLock className="input_icon" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={userPassword} 
                id="login-password" 
                placeholder="Enter your password"
                onChange={(e) => setUserPassword(e.target.value)} 
                required 
              />
              <div className="password_toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </div>
            </div>
          </div>

          <div className="form_extras">
            <span className="terms_text">Secure login portal.</span>
          </div>
          
          {errorMessage && <p className="error_message">{errorMessage}</p>}
          
          <button type="submit" className="submit_button" disabled={isLoading}>
            {isLoading ? <span className="loader_spinner"></span> : <span>Access Dashboard</span>}
          </button>
          
          <div className="switch_form_text">
            <p>Don't have an account? <span onClick={() => {setIsNumber(true); setErrorMessage('');}}>Sign Up</span></p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginSignup;
