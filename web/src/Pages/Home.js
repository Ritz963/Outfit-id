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
    const [showTopInfo, setShowTopInfo] = useState(false);

    const [selectedBottom, setSelectedBottom] = useState(null);
    const [showBottomInfo, setShowBottomInfo] = useState(false);

    const [selectedShoe, setSelectedShoe] = useState(null);
    const [showShoeInfo, setShowShoeInfo] = useState(false);


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
        setShowTopInfo(true);
    };

    const handleBottomClick = (bottom) => {
        setSelectedBottom(bottom);
        setShowBottomInfo(true);
    };

    const handleShoeClick = (shoe) => {
        setSelectedShoe(shoe);
        setShowShoeInfo(true);
    };

    const sliderSettingsTop = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        beforeChange: (current, next) => setSelectedTop(tops[next])
    };

    const sliderSettingsBottom = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        beforeChange: (current, next) => setSelectedBottom(bottoms[next])
    };

    const sliderSettingsShoe = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        centerMode:false,
        beforeChange: (current, next) => setSelectedShoe(shoes[next])
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
                                <div className = 'clothesItem'>

                                    <div className='topCarousel'>
                                        {/* <h3>Tops</h3> */}
                                        <Slider {...sliderSettingsTop}>
                                            {tops.map((top) => (
                                                <div key={top.id} onClick={() => handleTopClick(top)} >
                                                    <img src={top.imageUrl} alt={top.brand} style={{ objectFit: 'contain', width: '100%', height: '100%'  }} />
                                                    {/* <p>{top.brand} - {top.color}</p> */}
                                                </div>
                                            ))}
                                        </Slider> 
                                    </div>

                                    <div className={`infoCarousel ${showTopInfo ? 'show' : ''}`}>
                                        {/* <h3>Info</h3> */}
                                        {selectedTop && (
                                            <div className='inner'>
                                                <p><b>Brand:</b> {selectedTop.brand}</p>
                                                <p><b>Color:</b> {selectedTop.color}</p>
                                                <p><b>Type:</b> {selectedTop.type}</p>
                                            </div>
                                        )}
                                    </div>

                                </div>
                                
                                <div className='clothesItem'>
                                    <div className='topCarousel'>
                                        {/* <h3>Bottoms</h3> */}
                                        <Slider {...sliderSettingsBottom}>
                                            {bottoms.map((bottom) => (
                                                <div key={bottom.id} onClick={() => handleBottomClick(bottom)}>
                                                    <img src={bottom.imageUrl} alt={bottom.brand} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                                                    {/* <p>{bottom.brand} - {bottom.color}</p> */}
                                                </div>
                                            ))}
                                        </Slider>
                                    </div>

                                    <div className={`infoCarousel ${showBottomInfo ? 'show' : ''}`}>
                                        {/* <h3>Info</h3> */}
                                        {selectedBottom && (
                                            <div className='inner'>
                                                <p><b>Brand:</b> {selectedBottom.brand}</p>
                                                <p><b>Color:</b> {selectedBottom.color}</p>
                                                <p><b>Type:</b> {selectedBottom.type}</p>
                                            </div>
                                        )}
                                    </div>


                                </div>

                                <div className='clothesItem'>
                                    <div className='topCarousel'>
                                        {/* <h3>Shoes</h3> */}
                                        <Slider {...sliderSettingsShoe}>
                                            {shoes.map((shoe) => (
                                                <div key={shoe.id} onClick={() => handleShoeClick(shoe)}>
                                                    <img src={shoe.imageUrl} alt={shoe.brand} style={{ objectFit: 'contain', width: '80%', height: '80%' }} />
                                                    {/* <p>{shoe.brand} - {shoe.color}</p> */}
                                                </div>
                                            ))}
                                        </Slider>
                                    </div>


                                    <div className={`infoCarousel ${showShoeInfo ? 'show' : ''}`}>
                                        {/* <h3>Info</h3> */}
                                        {selectedShoe && (
                                            <div className='inner'>
                                                <p><b>Brand:</b> {selectedShoe.brand}</p>
                                                <p><b>Color:</b> {selectedShoe.color}</p>
                                                <p><b>Type:</b> {selectedShoe.type}</p>
                                            </div>
                                        )}
                                    </div>


                                </div>

                                <buttom type = 'submit' className = 'saveOutfit'>Click here to save outfit</buttom>

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
