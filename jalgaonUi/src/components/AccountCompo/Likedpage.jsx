import React, { useEffect, useContext, useState } from 'react';
import BusinessCard from '../Categorysection/BusinessCard';
import axios from 'axios';
import { UserContext } from '../../context/UserContext';

function Likedpage() {
  const djangoApi = import.meta.env.VITE_DJANGO_API;
  // const apiUrl = ;
  const { user } = useContext(UserContext);
  const [likedPosts, setLikedPosts] = useState([]);

  useEffect(() => {
    console.log(djangoApi);
    const token = localStorage.getItem('token');

    console.log("Token:", token);
    console.log("User ID:", user.id);

    if (!token) {
      console.error('No token found in localStorage');
      return;
    }
    // http://127.0.0.1:8000/api/v1/listings/favorites/
    const fetchLikedShops = async () => {
      try {
        const response = await axios.get(`${djangoApi}/api/v1/listings/favorites/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          params: {
            user_id: user.id,
          },
        });

        console.log(response.data);
        setLikedPosts(response.data.results || response.data);
      } catch (error) {
        console.error('Error fetching liked shops:', error.response ? error.response.data : error.message);
      }
    };

    fetchLikedShops();
  }, [user]);

  return (
    <div className="likedPage_content">
      {likedPosts.length === 0 ? (
        <p>No liked shops found.</p>
      ) : (
        likedPosts.map((likedShop) => (
          <BusinessCard key={likedShop.shop_listing.id} businessData={likedShop.shop_listing} is_like={true} />
        ))
      )}
    </div>
  );
}

export default Likedpage;
