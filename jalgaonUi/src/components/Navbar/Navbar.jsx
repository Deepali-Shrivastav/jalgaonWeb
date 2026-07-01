import React, { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import './Navbar.css';
import { assets } from '../../assets/assets';
import Search from './Search';
import axios from 'axios';
import { FormContext } from '../../context/FormContext';
import { UserContext } from '../../context/UserContext';
import { LoginContext } from '../../context/LoginContext';

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

const Navbar = () => {
    const { isLogin, setIsLogin } = useContext(LoginContext);
    const { user, setUser, isStaff } = useContext(UserContext);
    const { closeSpecial, setCloseSpecial } = useContext(FormContext);
    const { closeForm, setCloseForm } = useContext(FormContext);

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('authToken');
            await client.post('/api/v1/auth/logout/', {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            localStorage.removeItem('authToken');
            setUser(null);
            setIsLogin(false);
            console.log('Logout successful');
        } catch (error) {
            console.error('Error during logout', error);
        }
    };

    return (
        <div className='header'>
            <div className="navbar">
                <Link to='/'>
                    <div className="nav_logo">
                        <img className="icon" src={assets.icon} alt="" />
                        <img className="logo" src={assets.logo} alt="" />
                    </div>
                </Link>
                <div className="nav_links">
                    <ul className="navbar_menu">
                        <NavLink to='/'>
                            <li>Home</li>
                        </NavLink>
                        <NavLink to='/addListig'>
                            <li>Add Listing</li>
                        </NavLink>
                        <NavLink to='/advertise'>
                            <li>Advertise</li>
                        </NavLink>
                        <NavLink to='/news'>
                            <li>News</li>
                        </NavLink>
                    </ul>
                    <div className="nav_login">
                        <i className='bx bx-heart'></i>
                        {user ? (
                            <>
                                {isStaff && (
                                    <NavLink to='/admin'><p className="login_btn" style={{backgroundColor: '#dc2626'}}>Admin Panel</p></NavLink>
                                )}
                                <NavLink to='/account'><p className="login_btn">Account: {user?.phone_number}</p></NavLink>
                                {/* <form onSubmit={handleLogout}>
                                    <button type='submit' className="login_btn">Logout</button>
                                </form> */}
                            </>
                        ) : (
                            <p onClick={() => setCloseForm(!closeForm)} className="login_btn">Signup/Login</p>
                        )}
                        <i onClick={()=>setCloseSpecial(!closeSpecial)}  className='menu bx bx-menu'></i>
                    </div>
                </div>
            </div>
            <Search />
        </div>
    );
}

export default Navbar;
