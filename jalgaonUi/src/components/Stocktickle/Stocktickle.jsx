import React, { useState, useEffect } from 'react'
import './Stocktickle.css'
import axios from 'axios';
import { resolvePath } from 'react-router-dom';





function Stocktickle() {
  const djangoApi = import.meta.env.VITE_DJANGO_API;
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get(`${djangoApi}/api/v1/finance/data/`)
      .then(response => {
        setData(response.data.financeData);
      })
      .catch(error => {
        console.error('Error fetching finance data:', error);
      });
  }, []);


  return (
    <div className="stocktickle_container">
      {data.map((item) => (
          <div className="stock_tickle" key={item.id}>
            <p className="stock_title">{item.stock_title}</p>
            <div className="hr_line"></div>
            <p className="stock_price">{item.stock_price}</p>
            <p className={`stock_price_updown ${item.isUp ? 'up' : 'down'}`}>
              <i className={`bx ${item.isUp ? 'bxs-up-arrow-alt' : 'bxs-down-arrow-alt'}`}></i> {item.stock_change}
            </p>          
            <p className="stock_price_percentage">{item.stock_price_percentage}</p>
          </div>
        ))}
    </div>
  )
}

export default Stocktickle
