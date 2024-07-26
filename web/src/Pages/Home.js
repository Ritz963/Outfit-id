import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Navigation from '../Components/Navigation';
import Slider from "react-slick";

const Home = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [tops, setTops] = useState([]);
    const [bottoms, setBottoms] = useState([]);
    const [shoes, setShoes] = useState([]);

    const [selectedTop, setSelectedTop] = useState(null);
    const [showInfo, setShowInfo] = useState(false);


    const navigate = useNavigate();

    console.log('gonna try to load user data')

    const loadUserData = async (uid) => {
        try {
            console.log('UID:', uid);
            console.log('gonna get user data rn');

            const userDocSnap = await getDoc(doc(db, 'users', uid));
            if (userDocSnap.exists()) {
                console.log('Doc data:', userDocSnap.data());
                setUserData(userDocSnap.data());
            } else {
                console.log('doc does not exist');
            }

            const fetchClothingData = async (clothingType) => {
                const clothingCollectionRef = collection(db, 'users', uid, 'closets', 'Main', clothingType);
                const clothingSnapshot = await getDocs(clothingCollectionRef);
                return clothingSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            };

            const topsData = await fetchClothingData('tops');
            const bottomsData = await fetchClothingData('bottoms');
            const shoesData = await fetchClothingData('shoes');

            setTops(topsData);
            setBottoms(bottomsData);
            setShoes(shoesData);
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                loadUserData(user.uid);
            } else {
                navigate('/');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleTopClick = (top) => {
        setSelectedTop(top);
        setShowInfo(true);
    };

    const sliderSettings = {
        dots: false,
        infinite: true,
        speed: 0,
        slidesToShow: 1,
        slidesToScroll: 1,
        beforeChange: (current, next) => setSelectedTop(tops[next])
    };

    return (
        <div className='Home'>
            <Navigation/>
            <div>
                <h2>User Data:</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    userData ? (
                        <div>
                            <h1>Welcome, {userData.name}</h1>
                            <p>Email: {userData.email}</p>
                            <div className='showClothes'>
                                <div className = 'topItem'>

                                    <div className='topCarousel'>
                                        <h3>Tops</h3>
                                        <Slider {...sliderSettings}>
                                            {tops.map((top) => (
                                                <div key={top.id} onClick={() => handleTopClick(top)} >
                                                    <img src={top.imageUrl} alt={top.brand} style={{ width: '100px', height: 'auto' }} />
                                                    <p>{top.brand} - {top.color}</p>
                                                </div>
                                            ))}
                                        </Slider> 
                                    </div>

                                    <div className={`infoCarousel ${showInfo ? 'show' : ''}`}>
                                        <h3>Info</h3>
                                        {selectedTop && (
                                            <div>
                                                <p>Brand: {selectedTop.brand}</p>
                                                <p>Color: {selectedTop.color}</p>
                                                <p>Type: {selectedTop.type}</p>
                                            </div>
                                        )}
                                    </div>

                                </div>

                                {/* <div className='bottomCarousel'>
                                    <h3>Bottoms</h3>
                                    <Slider {...sliderSettings}>
                                        {bottoms.map((bottom) => (
                                            <div key={bottom.id}>
                                                <img src={bottom.imageUrl} alt={bottom.brand} style={{ width: '100%', height: 'auto' }} />
                                                <p>{bottom.brand} - {bottom.color}</p>
                                            </div>
                                        ))}
                                    </Slider>
                                </div>
                                <div className='shoesCarousel'>
                                    <h3>Shoes</h3>
                                    <Slider {...sliderSettings}>
                                        {shoes.map((shoe) => (
                                            <div key={shoe.id}>
                                                <img src={shoe.imageUrl} alt={shoe.brand} style={{ width: '100%', height: 'auto' }} />
                                                <p>{shoe.brand} - {shoe.color}</p>
                                            </div>
                                        ))}
                                    </Slider>
                                </div> */}

                            </div>
                        </div>
                    ) : (
                        <p>No user data found</p>
                    )
                )}
            </div>
        </div>
    );
};

export default Home;
