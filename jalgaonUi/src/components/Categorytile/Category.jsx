import React, { useEffect, useState } from 'react';
import './Category.css'
import axios from 'axios';

function Category({ name }) {
    const djangoApi = import.meta.env.VITE_DJANGO_API
    const [subCategories, setSubCategories] = useState([]);

    useEffect(()=>{
        if (name) {
            axios.get(`${djangoApi}/api/v1/listings/subcategories/`)
              .then(sub_response => {
                const filteredSubCategories = sub_response.data.categories.filter(
                  subCategory => subCategory.main_category === name
                );
                setSubCategories(filteredSubCategories);
                console.log("datasdfsdfsdf get");
              })
              .catch(error => {
                console.error('Error fetching sub-categories:', error);
              });
          }
    }, [])
    return (
        <div className="category">
            <p className="category_name">{name}</p>
            <div className="category_cards">
                {subCategories.map(category=>(
                <div className="category_business">
                    <div className="category_img">
                    <img src={`${djangoApi}/${category.sub_category_img}`} alt="" />
                    </div>
                    <p className="business_name">{category.sub_category}</p>
                </div>
                ))}



                {/* <div className="category_business">
                    <div className="category_img">
                    <img src="https://s3-alpha-sig.figma.com/img/faaf/b430/01cbe0776cac848cd04bc2be68bc78a3?Expires=1721001600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=QI5fGRARE-Id4MLIyscn7PE8CqrXb4FxCW4Z3xzfV6WFUrZz07xWNAnD9n535F2wZoSauC3Kiid4aqw1TZhh29uXwUpGTGLXh90TCFH5jrSnIXQ9YRyWfbZzdFVQzjykeBg9735hUTHXmGNN3y-En~fXQqEQQy~LpSSqhXMujv2RJn~qsYA-W5rez2v6RAu1B4xoggAGpNc5yNvDuD8p9bFPop66tMhCgPvei3~NfahPigkugIs2itXF36cyYPvDMnRSF2MkX6vtlhUadRotRxwa2G7bgnRfPZD4DX3qJa1QFyNBnMo6~OC~cOJ3aMH7BWTfdxy9j316-dV2Lbzdlw__" alt="" />
                    </div>
                    <p className="business_name">Cars 24</p>
                </div>
                <div className="category_business">
                    <div className="category_img">
                    <img src="https://s3-alpha-sig.figma.com/img/faaf/b430/01cbe0776cac848cd04bc2be68bc78a3?Expires=1722211200&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=RUcop~H3G5RNp7UaMyY9g~GaKEDKsIeEnNLd9zsxSl4pk9fDMm~iZha3xjlhChOICizXBkno36rLt21eVI~mtu6~31A5nLI0dTWxZbl-Q8TrNM~SXGcFaTf5nVyyTXdEqIZ6PsqcZWToUvaGbJEEXh1AhHwcHTGger7Ua5eDcMZXpBuvOrfdrFWTLavn1SPoeOBDRRJyRixXTjN~BJUbEfrUdWBci7w0c0p~afeohr69BfEpADuyQxZSZ9JtZ1dGZq6AbK9hFbOon6BXu53MbjjJXmfnpt7c2KeSKWxyeIAyMoNO1NhZjEWTlsxRkDmtcemJexxTEwor-VhgPrD5Fw__" alt="" />
                    </div>
                    <p className="business_name">Cars 24</p>
                </div>
                <div className="category_business">
                    <div className="category_img">
                    <img src="https://s3-alpha-sig.figma.com/img/d614/8a5f/927a8274863e8d928950a2617b5a6993?Expires=1721001600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=E-bQ~juDm7MzBxCoGOH2qUWhcF6nbmawueKvCGD0FG6hIiGKAdhe7pa3fdhGAABFe~LNa3yV4L8BHtEnE10S69RAIL5zMUMUHGZJGjRFyjByTWPt1~Jgwf5ZOmvOYY-ZLnoL77R2DCA90FizCetQOyuVI0Y6WzZNi5nw71GiXdu~ke-hvrzaHNpTK~YTOfiZW4hYKbq5CFzwHLYoS-v3Gwul42nVEzoT9ToyNDU6qPIjcOEzXoZNs9-TB6paLWwP-0Nk5tnK1Nvfy7ch1Ix~8eGhqOKd0lcPsFjyR5sSs1JEM4klHoC0GTHSiK~GrnOpcBLVlIjgBBfrjjk0-ADfFw__" alt="" />
                    </div>
                    <p className="business_name">Cars 24</p>
                </div>
                <div className="category_business">
                    <div className="category_img">
                    <img src="https://s3-alpha-sig.figma.com/img/faaf/b430/01cbe0776cac848cd04bc2be68bc78a3?Expires=1721001600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=QI5fGRARE-Id4MLIyscn7PE8CqrXb4FxCW4Z3xzfV6WFUrZz07xWNAnD9n535F2wZoSauC3Kiid4aqw1TZhh29uXwUpGTGLXh90TCFH5jrSnIXQ9YRyWfbZzdFVQzjykeBg9735hUTHXmGNN3y-En~fXQqEQQy~LpSSqhXMujv2RJn~qsYA-W5rez2v6RAu1B4xoggAGpNc5yNvDuD8p9bFPop66tMhCgPvei3~NfahPigkugIs2itXF36cyYPvDMnRSF2MkX6vtlhUadRotRxwa2G7bgnRfPZD4DX3qJa1QFyNBnMo6~OC~cOJ3aMH7BWTfdxy9j316-dV2Lbzdlw__" alt="" />
                    </div>
                    <p className="business_name">Cars 24</p>
                </div>
                <div className="category_business">
                    <div className="category_img">
                    <img src="https://s3-alpha-sig.figma.com/img/c428/a281/a2137cffbf26387b127bf7eb727590a9?Expires=1721001600&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=cDl0gUlTtIDs80C0wkptoRrBoRLlw5nWVRgNZnsHz0tB0xnsH6GZ4pbG2JdaTnYKk~k74lpW63OhKQPYhomU0QKkoLsY3kMYYVNcrJuQMis5vDpDk6JEnvoG4As5-kWQLvslRz9adzm-f~CahSjBaqY4U68To77fW9EcPdBiucCiVsBhsNVyUlaHgCwqIOBvc9AkhFwhNI0oDZzIy8rIwb~i-H5Y1vYLmp1cpE4dH2k7acK5TeMZ~DMa6ye9qRb7nNtpRHfUh463kWsUgQyTmmy6DWC5ey32R4PjRkS6O34a1qdsJwZSJNlp8yq7NKJt5hiZZ3gIfFB3xCjFY3nhsw__" alt="" />
                    </div>
                    <p className="business_name">Cars 24</p>
                </div> */}
            </div>
        </div>
    )
}

export default Category
