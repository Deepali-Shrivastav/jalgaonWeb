import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

import './Search.css'
import axios from 'axios'
function Search() {
  const djangoApi = import.meta.env.VITE_DJANGO_API;
  const navigate = useNavigate();

  const [query, setQuery] = useState('')
  const [searchData, setSearchData] = useState([])

  const getCsrfToken = async () => {
    try {
      const response = await axios.get(`${djangoApi}/api/v1/auth/csrf-token/`);
      return response.data.csrfToken;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      return '';
    }
  };

  const handleSearch = async () => {
    console.log('Search query:', query);
    const csrfToken = await getCsrfToken();

    if (!query) {
      console.log("Query is empty, please enter a search term.");
      return;
    }
  
    try {
      const response = await axios.get(`${djangoApi}/api/v1/search/?search=${query}`);
      console.log(response.data);
      navigate('/searchResults', { state: { searchData: response.data } });
      
      // Set the search data to state
      setSearchData(response.data);
  
      // Navigate to the results page and pass the search data
    } catch (error) {
      console.error('Error fetching data:', error);
      
      if (error.response && error.response.status === 404) {
        console.log("No search results found for the query.");
      }
    }
  };
  
  const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
          event.preventDefault();  // Prevents the default form submission behavior
          handleSearch();  // Call the search function when Enter is pressed

        }
  };


  return (
    <div className="nav_serach">
        <div className="select_city">
            <i class='bx bx-current-location'></i>
            <p>Select City</p>
        </div>
        <div className="main_search">
            <i class='bx bx-search'></i>
            <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}  // Attach the event handler
                placeholder="Search..." 
                type="search" 
                name="input_business" 
                id="input_business" 
                className="input_business" 
            />
        </div>
    </div>
  )
}

export default Search
