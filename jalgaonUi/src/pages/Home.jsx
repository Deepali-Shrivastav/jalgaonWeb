import React, { useState, useEffect } from 'react'
import Advertise from '../components/Advertise/Advertise'
import Categorytile from '../components/Categorytile/Categorytile'
import Navbar from '../components/Navbar/Navbar'
import Stocktickle from '../components/Stocktickle/Stocktickle'
import LatestNewsSection from '../components/News/LatestNewsSection'
import Footer from '../components/Footer/Footer'
import Services from '../components/Services/Services'
import Bottomnav from '../components/Bottomnav/Bottomnav'
import LoginSignup from '../components/LoginSignup/LoginSignup'


import axios from 'axios'
import SpecialSections from '../components/SpecialSections/SpecialSections'
import AddListingForm from '../components/AllForms/AddListingForm'
function Home() {
  const [stuednts, setStudent] = useState([])

  return (
    <div className="main_section">
      <Stocktickle />
      <Advertise/>
      <Services />
      <Categorytile/>
      <LatestNewsSection />
      <LoginSignup />
      <SpecialSections />

    </div>
  )
}

export default Home
