import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import BusinessCard from '../Categorysection/BusinessCard';
import { UserContext } from '../../context/UserContext';

function Listingspage() {
  const apiUrl = `${import.meta.env.VITE_DJANGO_API}/api/v1/listings/my-listings/`;

  const { user } = useContext(UserContext);
  const [listedPosts, setListedPosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');

    console.log("Token:", token);
    console.log("User ID:", user?.id);

    if (!token) {
      console.error('No token found in localStorage');
      setError('No token found in localStorage');
      return;
    }

    if (!user || !user.id) {
      console.error('User is not logged in');
      setError('User is not logged in');
      return;
    }

    const fetchLikedShops = async () => {
      try {
        const response = await axios.get(apiUrl, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          params: {
            user_id: user.id,
          },
        });

        console.log(response.data);
        setListedPosts(response.data);
      } catch (error) {
        console.error('Error fetching liked shops:', error.response ? error.response.data : error.message);
        setError('Error fetching liked shops');
      }
    };

    fetchLikedShops();
  }, [user, apiUrl]);

  return (
    <div className="listingPage_content">
      {error ? (
        <p>{error}</p>
      ) : listedPosts.length === 0 ? (
        <p>No listed shops found.</p>
      ) : (
        listedPosts.map((listedShop) => (
          // Directly use listedShop since it is already the shop object
          listedShop.id ? (
            <BusinessCard key={listedShop.id} businessData={listedShop} is_like={true} is_edit={true} />
          ) : (
            <p key={Math.random()}>Shop listing is missing data</p>
          )
        ))
      )}
    </div>
  );
}

export default Listingspage;
