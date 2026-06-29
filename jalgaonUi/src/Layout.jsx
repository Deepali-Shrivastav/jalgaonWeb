import React, { useEffect, useContext } from 'react';
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Bottomnav from './components/Bottomnav/Bottomnav'
import axios from 'axios';
import { FormContext } from './context/FormContext';
import { UserContext } from './context/UserContext';
import { LoginContext } from './context/LoginContext';
import LoginSignup from './components/LoginSignup/LoginSignup';


axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';
axios.defaults.withCredentials = true;

const client = axios.create({ baseURL: import.meta.env.VITE_DJANGO_API });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

function Layout() {
    // const { isLogin, setIsLogin } = useContext(LoginContext);
    // const { user, setUser } = useContext(UserContext);
    // const { closeForm, setCloseForm } = useContext(FormContext);


    // useEffect(() => {
    //     const fetchUserData = async () => {
    //         const token = localStorage.getItem('authToken');
    //         if (token) {
    //             try {
    //                 const response = await axios.get('http://127.0.0.1:8000/api/v1/auth/user/', {
    //                     headers: { Authorization: `Bearer ${token}` }
    //                 });
    //                 setUser(response.data.user);
    //                 setIsLogin(true);
    //             } catch (error) {
    //                 console.error('Error fetching protected data:', error);
    //                 setIsLogin(false);
    //             }
    //         }
    //     };
    //     fetchUserData();
    // }, []);


    return (
        <div className='main_section'>
            <Navbar/>
            <Outlet />
            <Footer />
            <Bottomnav />
            {/* <LoginSignup /> */}
        </div>
    )
}

export default Layout
