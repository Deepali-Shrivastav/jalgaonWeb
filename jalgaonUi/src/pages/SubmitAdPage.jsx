import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import AddAdvertiseForm from '../components/AllForms/AddAdvertiseForm';
import LoginSignup from '../components/LoginSignup/LoginSignup';
import { UserContext } from '../context/UserContext';
import { FormContext } from '../context/FormContext';
import './SubmitAdPage.css';

const SubmitAdPage = () => {
    const { isLogin, loading } = useContext(UserContext);
    const { setCloseForm } = useContext(FormContext);

    return (
        <div className="submit-ad-page">
            <Helmet>
                <title>Submit Advertisement | Jalgaon.com</title>
                <meta name="description" content="Submit your business advertisement details and creative for promotion on Jalgaon.com." />
            </Helmet>

            <Navbar />

            <div className="submit-ad-container">
                <div className="submit-ad-breadcrumbs">
                    <Link to="/">Home</Link> &gt; <Link to="/advertise">Advertise</Link> &gt; <span>Submit Ad</span>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                        Loading...
                    </div>
                ) : !isLogin ? (
                    <div className="auth-banner-card">
                        <div className="auth-banner-icon">
                            <i className='bx bx-lock-alt'></i>
                        </div>
                        <h2>Authentication Required</h2>
                        <p>You must be logged in to submit an advertisement request and manage your campaigns.</p>
                        <button
                            className="btn-login-cta"
                            onClick={() => setCloseForm(false)}
                        >
                            Log In or Register to Submit Ad
                        </button>
                    </div>
                ) : (
                    <AddAdvertiseForm />
                )}
            </div>

            <LoginSignup />
            <Footer />
        </div>
    );
};

export default SubmitAdPage;
