import React from 'react'
import Advertise from '../components/Advertise/Advertise'
import HeroAdBanner from '../components/Ads/HeroAdBanner'
import Categorytile from '../components/Categorytile/Categorytile'
import Stocktickle from '../components/Stocktickle/Stocktickle'
import LatestNewsSection from '../components/News/LatestNewsSection'
import UpcomingEventsSection from '../components/Events/UpcomingEventsSection'
import Services from '../components/Services/Services'
import LoginSignup from '../components/LoginSignup/LoginSignup'
import SpecialSections from '../components/SpecialSections/SpecialSections'

function Home() {
  return (
    <div className="main_section">
      <Stocktickle />
      <HeroAdBanner />
      <Advertise />
      <Services />
      <Categorytile />
      <LatestNewsSection />
      <UpcomingEventsSection />
      <LoginSignup />
      <SpecialSections />
    </div>
  )
}

export default Home
