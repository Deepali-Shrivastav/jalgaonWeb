"use client";

import React, { useState } from 'react';

const touristPlaces = [
  {
    name: 'nan',
    type: 'nan',
    address: '',
    image: ''
  },
  {
    name: 'nan',
    type: 'nan',
    address: '',
    image: ''
  },
  {
    name: 'Mahatma Gandhi Udyan',
    type: 'Tourist attraction',
    address: 'Closed',
    image: '/images/mahatma-gandhi-udyan.jpg'
  },
  {
    name: 'Mehrun Lake',
    type: 'Tourist attraction',
    address: '',
    image: '/images/mehrun-lake.jpg'
  },
  {
    name: 'Sunset Point Jalgaon',
    type: 'Tourist attraction',
    address: 'Reshmai Plaza, Sunset Point, near Maruti Mandir',
    image: '/images/sunset-point-jalgaon.jpg'
  },
  {
    name: 'Icchapurti Ganesh Temple',
    type: 'Tourist attraction',
    address: 'Open',
    image: '/images/icchapurti-ganesh-temple.jpg'
  },
  {
    name: 'JCMC Bhaunche Udyan Municipal Garden',
    type: 'Garden',
    address: 'Closed',
    image: '/images/jcmc-bhaunche-udyan.jpg'
  },
  {
    name: 'I Love Jalgaon Selfie Point',
    type: 'Tourist attraction',
    address: 'Open now',
    image: '/images/i-love-jalgaon-selfie-point.jpg'
  },
  {
    name: 'Bahinabai Garden (JMC)',
    type: 'Garden',
    address: 'Closed',
    image: '/images/bahinabai-garden.jpg'
  },
  {
    name: 'Sardar Vallabh bhai patel statue',
    type: 'Tourist attraction',
    address: 'Open now',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAEGcIBU6AxbfnyZAFTmlAZeGbml9XLwL_uZjILJyGvBgIjlLTZtWzb6w8ZhL8I3dg9jmTybetqVasQ8ZcCiY30nxtcYtVsxU29p4MLKi1tBW9akT7YVW0H7bibNYkt4TlNhiKaH=w80-h142-k-no'
  },
  {
    name: 'Icchadevi Chowk',
    type: 'Tourist attraction',
    address: 'Open now',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAFnLTFadsym0b387M4C-L8txkA8-0LqiaifVufNsYl4nNw2wBQez4BhxwqHFZB8X5CdinfXP8fYWRlaGAE1c8htwblbW4U3qom6bXsqZ4Tv5jEHR_DJZerERtvomPQnG9BXeUf5CeM53KAF=w80-h178-k-no'
  },
  {
    name: 'Chhatrapati shivaji maharaj chawk',
    type: 'Tourist attraction',
    address: '',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAHh3KT5l5TriOJeGRHlUf5teoW09oJYn2XJWBw5J4bx4-Uu7v1PX-RPcOGQPaBH097JGUrDfEDV-SgXUPlaA5UoxMGUqt2AFR77Ou-NWXq76qxyblJ4tBltuwMHf5cYYaWYek8zgqWV4jwy=w80-h106-k-no'
  },
  {
    name: 'Dr. B. R. Ambedkar\'s Statue',
    type: 'Tourist attraction',
    address: 'Open now',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAHbC9aRQH-Q6OlNTLfHzAi6rCCsO-VrvSVFhYhf5_ly9uWzCAc6m31DR6HRFtjQJbqKxS6q4oxu8Dz41onL1xIEdO19nhAaV7dTCZZUeuarF4zWLhqZdWSGzehPaq0tZwpIT8p7cQ=w122-h92-k-no'
  },
  {
    name: 'Balsanskar Bal Udyan',
    type: 'Park',
    address: 'Open',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAGP1xHkLM_ZS2Mf3qzd9REEwB6C6rvyS18QnzR87sHeoSvvIsjPtkP8ccJDwyjC0Ys47E1PDaOdHXqaUmSgBKxQWgKOBmjIWpxBvM7Fao-XK7xRMPt8sLk04yUPkBnIQZjNWgL8hw=w122-h92-k-no'
  },
  {
    name: 'Gandhi Research Foundation, Jalgaon',
    type: 'Museum',
    address: 'Open',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAFFyGJs7mu-INAB8kg5gedTJSDhO1TSykVHWCQe8Is0rkmiv3C-5JPwsXKctIehvC1XgYIZg5mfwX0ZMUVoQz-QmDMUD83eOFCsH7HzM-JJ-ty4iZ1YglJxNie0bM8ZT5DkxZmHfQ=w144-h92-k-no'
  },
  {
    name: 'Pimprala flyover Chauk',
    type: 'Tourist attraction',
    address: 'Open now',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAEYNyLxZWNd3cEA3WTivMdJY-pH4qjwvOBc5Ot6hzxhM1OwDSF397cOPhZ32ZNq0molQvbpxeyV8ufU4hmV2eYAlfFElzV6GHKZJINowlXqervwC5xXxvmB05AQ4RXPGv9Qnxmi7vbhJiG2=w80-h106-k-no'
  },
  {
    name: 'Chhatrapati Sambhajiraje Gardan',
    type: 'Park',
    address: 'Open 24 hours',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAF2rAlH8smjquhj8igemirNb2fmFSSz0xmI55G2XQoaqyT9ncZnCYa4hGCE83QxlIN_QN1sFAltyNTE6Q6T3EBsRbUvSzXerIlRmYMBE9ob-C1f0P7WpHGNN2IE9L99ZNpveX0=w163-h92-k-no'
  },
  {
    name: 'Shree Ram Mandir,Jalgaon.',
    type: 'Tourist attraction',
    address: 'Open',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAGhNiQtL9cDPCYvXHP2VqYV2RH-V-bWwnDSlowD5bkv-S4vU7aPD89ag6l4YiPfSjED_NY5jD8MByUUfJoZ7uueHUu1hR2pbZQXiQWvrZOZ8iU2Nz2Y1PDzeqoatgTaIiJDplsZnXqFrlx0=w80-h106-k-no'
  },
  {
    name: 'Sagar Park (JMC)',
    type: 'Park',
    address: 'Open',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAEk_zL3WhGPaiyOTWHOEWbZXKlh_ajkshCcXtlhwHDZj7R52PebplCEaCyfRshvh6zQ1fFqjIkHS4uwz4hSm4bemrseMh4P3GeayBty-3V9bONPwhwt8cjZI6as9B9jr4Xor4bZpA=w163-h92-k-no'
  },
  {
    name: 'Smruti Udyan',
    type: 'Park',
    address: '',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAEKQIEE68yj1byElbD8pqVXrznVAK74K6e7Gvfw5yjFBNmTGmiE7b1hafu9sHCUJQX7nXeIUzHP7hIJJJMh5PJPAqAx9VvcH_W6gn2wju4ucF_ga0dyBWjHEaf-E_QaX6AfOv3rMQ=w122-h92-k-no'
  },
  {
    name: 'NIMBADEVI DAM',
    type: 'Tourist attraction',
    address: 'Open now',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAFp33A1ajQDSWKnFwZBzacROVsFMypPFilJAzOGWmtkgW7X7w1e0a1ec4pkqfwUf_maWMhpUGBKkBV8k82j3gSjO-_Dz4ROq5um1KSiD7wGkBJ7r2yEUHSTlOmeWgPYc5_5uupP=w184-h92-k-no'
  },
  {
    name: 'Parola Fort, Kanhdesh (M.H)',
    type: 'Tourist attraction',
    address: 'Open 24 hours',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAFbnuuT29hddAW4DRDplPWJ4vv-Io0dBMSLFAPTs2arbCrVshwrCp3UorlztTqYo_00eI52DtgVOo4xG410onDY9npWT28U-qQtPEwOpU6CrPEWtrFh_ByO8JgJTHrOvmBEMHI=w164-h92-k-no'
  },
  {
    name: 'Shelgaon barrage',
    type: 'Tourist attraction',
    address: 'Open 24 hours',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAGlJmc7bfPKvpTgacKz6ag9Qu8-J_P65-JXGmb7IudsvTHTB9P6VtqUXL9bmELE46gAMDck0FXya_7YvDWWqbPn-mOF0QchQ4ATkTZshmeY5owXIUHPtxXx-CUf6RqPY33jhXf1=w163-h92-k-no'
  },
  {
    name: 'Omkareshwar temple jalgaon',
    type: 'Hindu temple',
    address: '',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAGESkyR6n-bDKEEm6KTp3BMPTprLUVsnJ8rSyUdAm9CC7q6m1b0Mcyc-oMWToPeqZ371T_iWjfRhuYnkT8SRr0jEoxzmRukZrkmurnbKbvAKDl7UL7SesRzCTCBl0ceX0v3kWThjA=w122-h92-k-no'
  },
  {
    name: 'Hanuman Park',
    type: 'Park',
    address: 'Open now',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAHkBSflfbYZdAxUllOWbLj9CYWOt6WZkyh4SkN5CGBbgB8hHxasi88EPk98zLRr-EKVhJy4oAiItGuawa_Zp1TXIgU8a49hyXYuhN_D2c_csnWC4wzEZQ9jKkV9f_YmYvZeeokXISM54AZr=w122-h92-k-no'
  },
  {
    name: 'AMD THE BETTA AQUARIUM',
    type: 'Aquarium',
    address: 'Open',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAG4aQa6i8F41PHqiKwi6bJ74zzFyzVtl5VyI6J7cEAswv5A61MLY4PuL3ykN3HZMEYdOoGEguOT6NGuDP05n3_mL3t9t2E4K8BnidScV9VNdBvnF5IjS9a2Cj0auYVUIEK350er=w80-h171-k-no'
  },
  {
    name: 'Dr. BABASAHEB AAMBEDKAR GARDEN GANESH COLONY JALGAON MAHARASHTRA INDIA',
    type: 'Park',
    address: 'Closed',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAFs6CpB4B6RszQxyoydfFbE_V7tS3OZYdFl6MAVc043QMxuAgOTCH56RkLWOcbEo2vtR13WD51dlOXvEblUvvgwmZUPmyJcPNh1YmZAcDlevYq-099UEkNFUl1wbKBvAUt6vdF9=w80-h141-k-no'
  },
  {
    name: 'Kamesh Nala',
    type: 'Historical landmark',
    address: 'Open 24 hours',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAHyGl1DwjxlYYSrjiSoGocrhGrxBnK5PxevjXv2L6WmgKCkYnX_b-4ZDcDJT0rq6h-Xd2O70N9euTYAr9EJPQLYjrWnTTGwJxn5xSGUjaL7BUOopDi3eEjaAAGeIoBWU2IQNZTPug=w80-h106-k-no'
  },
  {
    name: 'Gandhi Tirtha Jain hills Jalgaon',
    type: 'Museum',
    address: '',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAEYFmjMnorDUhMp7r3xcoTxBEdPhnkGLR0Op3iyyIBy2on_Ysk09VcmhGLRXAQd6gR_dR_wh5KEr4U2u_RN32MGnYNtdiedDlXmB_-7gaThTIGRwEapzL3Mz37pjAGLK0_BkTdgWA=w122-h92-k-no'
  },
  {
    name: 'Unapdev',
    type: 'Tourist attraction',
    address: 'Open',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAFqxNrZc-hpps_bD2q3X5hx_UqY8YW7TttG59eF1-NX-6wc7Hp094q7Imgi1c-O6qzCI2PwkHvtDWudgdj6gHW9y2kTuEDLB7JGghj75DSJ1Vyqh7UtMYY-lSmAiZv6qjMBhmPUdg=w122-h92-k-no'
  },
  {
    name: 'Kashi Vishweshwar Temple · Visited link',
    type: 'Place of worship',
    address: '',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAFpZATZNJmehNKOo2w1VuCyJU2_LSkSTHcofUS2wDX7foPWUYmSBLZIC8v-hKPpYtbFnXN28mzblhZ8K3Jlp929e2ev5kdXHrfLJ_QYx-DIxwA1sk3p0BrKkhrNMhTLUBN2O953Ow=w122-h92-k-no'
  },
  {
    name: 'Hotel Tourist Resort · Visited link',
    type: 'Hotel',
    address: '',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAFkTsk2heg4nOYD8WlzwdzfIIeAmWbLfQQxmFzFOI7INkZfWwFR3uuD1uzRq0E4CI3G-CPKFUZVMarRFB01t76jc7e3r9Eh2OdYUAfL56JVRuicggGAFf0KmexCl8ESqLmI37Q=w80-h106-k-no'
  },
  {
    name: 'Sant Gadage Baba Udyan',
    type: 'Garden',
    address: '',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/APNQkAHs_OLzMEOdoOw5rTLy7QgXIPSMmK4V-5ATT8jIU9vqyHaMtOWN1amoq7I4MCTIpQMkiTWpv8-Af_SAIOM5uIBNbubomSOo3U1Z2jAia48zREQN7Lk6WkFCIlPEY-32Ue0rN3YV=w80-h106-k-no'
  },
];

export default function TouristPlacesList() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter out any invalid "nan" places for a cleaner UI
  const validPlaces = touristPlaces.filter(p => p.name && p.name !== 'nan');
  const totalPages = Math.ceil(validPlaces.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPlaces = validPlaces.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: document.getElementById('more-places')?.offsetTop || 0, behavior: 'smooth' });
  };

  return (
    <section id="more-places" className="py-20 max-w-container-max mx-auto px-4 md:px-8">
      <div className="text-center mb-12">
        <h2 className="font-headline-lg text-headline-lg text-on-background mb-4">More Places to Explore</h2>
        <p className="text-on-surface-variant mx-auto max-w-2xl">Discover various temples, parks, and attractions across Jalgaon.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {currentPlaces.map((place, index) => (
          <div key={index} className="bg-surface border border-outline-variant rounded-[24px] overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="h-48 overflow-hidden bg-surface-container-low relative">
              {place.image && place.image !== 'nan' ? (
                <img src={place.image} alt={place.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-on-surface-variant bg-surface-variant/30">
                  <span className="material-symbols-outlined text-4xl">landscape</span>
                </div>
              )}
            </div>
            <div className="p-6">
              <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2">{place.type !== 'nan' ? place.type : 'Attraction'}</div>
              <h3 className="font-headline-sm text-headline-sm text-on-background mb-2 line-clamp-2" title={place.name}>{place.name}</h3>
              {place.address && place.address.toLowerCase() !== 'nan' && place.address.toLowerCase() !== 'open now' && place.address.toLowerCase() !== 'open 24 hours' && place.address.toLowerCase() !== 'open' && place.address.toLowerCase() !== 'closed' && (
                <p className="text-on-surface-variant text-body-sm flex items-start gap-1">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span className="line-clamp-1" title={place.address}>{place.address}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          <button 
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-outline-variant disabled:opacity-50 hover:bg-surface-container-low transition-colors"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors ${
                currentPage === page 
                  ? 'bg-primary text-white' 
                  : 'border border-outline-variant hover:bg-surface-container-low'
              }`}
            >
              {page}
            </button>
          ))}
          <button 
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-outline-variant disabled:opacity-50 hover:bg-surface-container-low transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
}
