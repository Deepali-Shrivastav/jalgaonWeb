import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { UserContext } from '../../context/UserContext'
import { format } from 'date-fns';

function CompanyWork({ businessData }) {
    const djangoApi = import.meta.env.VITE_DJANGO_API;
    const { user } = useContext(UserContext);
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState('');
    const [reviews, setReviews] = useState([]);
    const [hover, setHover] = useState(null);
    const [isClicked, setIsClicked] = useState(false);

    useEffect(() => {
        const fetchReview = async () => {
            const tokenKey = localStorage.getItem('tokenKey');
            const csrfToken = await getCsrfToken();

            try {
                const response = await axios.get(`${djangoApi}/api/v1/reviews/by-shop/`, {
                    params: { shop_listing: businessData.id },
                    headers: {
                        'Authorization': `Token ${tokenKey}`,
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'X-CSRFToken': csrfToken,
                    },
                });
                console.log(response.data);
                const filteredReview = response.data.filter(review => review.shop_listing === businessData.id);
                setReviews(filteredReview);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            }
        };
        fetchReview();
    }, [businessData.id]);

    const handleMouseEnter = (currentRating) => {
        setHover(currentRating);
        setIsClicked(false);
    };

    const handleMouseLeave = () => {
        if (!isClicked) setHover(null);
    };

    const handleMouseDown = (currentRating) => {
        setRating(currentRating);
        setIsClicked(true);
    };

    const getCsrfToken = async () => {
        try {
            const response = await axios.get(`${djangoApi}/api/v1/auth/csrf-token/`);
            return response.data.csrfToken;
        } catch (error) {
            console.error('Error fetching CSRF token:', error);
            return '';
        }
    };

    const submitReview = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const csrfToken = await getCsrfToken();

        const formData = {
            rating_star: rating,
            user_review: review,
            shop_listing: businessData.id,
        };

        try {
            const response = await axios.post(`${djangoApi}/api/v1/reviews/`, formData, {
                headers: {
                    // 'Authorization': `Token ${token}`,
                    'Authorization': `Bearer ${token}`,
                    'X-CSRFToken': csrfToken,
                },
            });
            console.log('Review submitted successfully:', response.data);
            alert("Review submitted");
        } catch (error) {
            console.error('Error submitting review:', error);
        }
    };

    return (
        <div className="companyWork">
            <div className="company_brands">
                <h1>Products and Services</h1>
                <div className="brands">
                    <span>{businessData.sub_domain_one}</span>
                    <span>{businessData.sub_domain_two}</span>
                    <span>{businessData.sub_domain_three}</span>
                    <span>{businessData.sub_domain_four}</span>
                    <span>{businessData.sub_domain_five}</span>
                </div>
            </div>
            <div className="company_profile">
                <h1>Company Profile</h1>
                <div className="profile_info">
                    <div className="business_origin">
                        <p>Country of Origin</p>
                        <span>{businessData.business_origin}</span>
                    </div>
                    <div className="vr_line"></div>
                    <div className="business_estab">
                        <p>Year of Establishment</p>
                        <span>{businessData.business_dob}</span>
                    </div>
                    <div className="vr_line"></div>
                    <div className="business_gst">
                        <p>GST Number</p>
                        <span>{businessData.business_gst}</span>
                    </div>

                </div>
            </div>
            <div className="company_desc">
                <h1>Description</h1>
                <p>{businessData.business_description}</p>
            </div>
            {/* <div className="company_photos">
                <h1>Photos</h1>
                <div className="phtos">
                    <img src={`${djangoApi}/${businessData.business_img_one}`} alt="" />
                    <img src={`${djangoApi}/${businessData.business_img_two}`} alt="" />
                    <img src={`${djangoApi}/${businessData.business_img_three}`} alt="" />
                </div>
            </div> */}
            {/* Rest of your component code */}
            <div className="company_reviw">
                <h1>Add Your Review</h1>
                <div className="rating_star">
                    <span>{rating}</span>
                    {[...Array(5)].map((star, index) => {
                        const currentRating = index + 1;
                        return (
                            <label key={index}>
                                <input type="radio" onClick={() => setRating(currentRating)} value={currentRating} name='rating' />
                                <i
                                    className={`bx bxs-star ${currentRating <= (hover || rating) ? 'star_fill' : ''}`}
                                    onMouseEnter={() => handleMouseEnter(currentRating)}
                                    onMouseDown={() => handleMouseDown(currentRating)}
                                    onMouseLeave={handleMouseLeave}>
                                </i>
                            </label>
                        );
                    })}
                </div>
                <div className="review_form">
                    <form onSubmit={submitReview}>
                        <textarea
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder='Write a review....'
                        ></textarea><br />
                        <input className='review_btn' type="submit" value="Add Review" />
                    </form>
                </div>
            </div>
            <div className="review_data">
                <h1>Review ({reviews.length})</h1>
                {reviews.map((review, index) => (
                    <div key={index} className="user_review_card">
                        <div className="review_name">
                            <p>{review.user.phone_number}</p>
                            <div className="user_review_star">
                                {[...Array(parseInt(review.rating_star))].map((star, idx) => (
                                    <i key={idx} className='bx bxs-star'></i>
                                ))}
                            </div>
                        </div>
                        <div className="user_review">
                            <p>{review.user_review}</p>
                        </div>
                        <div className="review_date">
                            <p>-{format(new Date(review.timestamp), 'dd MMMM yyyy')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CompanyWork;
