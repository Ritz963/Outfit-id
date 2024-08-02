import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { IoIosArrowBack } from "react-icons/io"; //<IoIosArrowBack />
import { IoIosArrowForward } from "react-icons/io"; //<IoIosArrowForward />
import ClothesInfo from '../Components/ClothesInfo';
import Navigation from '../Components/Navigation';
import Slider from "react-slick";


function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div onClick={onClick} className={`arrow ${className}`} >
            <IoIosArrowForward className="arrows"/>
        </div>
    );
  }
  
  function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div onClick={onClick} className={`arrow ${className}`} >
            <IoIosArrowBack className="arrows"/>
        </div>
    );
  }


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
        lazyLoad: true,
        nextArrow: <SampleNextArrow to="next"/>,
        prevArrow: <SamplePrevArrow to="prev" />,
        beforeChange: (current, next) => setSelectedTop(tops[next])
    };

    const sliderSettingsBottom = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        lazyLoad: true,
        nextArrow: <SampleNextArrow to="next"/>,
        prevArrow: <SamplePrevArrow to="prev" />,
        beforeChange: (current, next) => setSelectedBottom(bottoms[next])
    };

    const sliderSettingsShoe = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        lazyLoad: true,
        nextArrow: <SampleNextArrow to="next"/>,
        prevArrow: <SamplePrevArrow to="prev" />,
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

                                    <div className='imgCarousel'>
                                        <Slider {...sliderSettingsTop}>
                                            {tops.map((top) => (
                                                <div key={top.id} onClick={() => handleTopClick(top)} >
                                                    <img src={top.imageUrl} alt={top.brand} style={{ objectFit: 'contain', width: '90%', height: '90%'  }} />
                                                </div>
                                            ))}
                                        </Slider> 
                                    </div>

                                    <div className={`infoCarousel ${showTopInfo ? 'show' : ''}`}>
                                        {selectedTop && (
                                            <ClothesInfo item={selectedTop} />
                                        )}
                                    </div>

                                </div>
                                
                                <div className='clothesItem'>
                                    <div className='imgCarousel'>
                                        <Slider {...sliderSettingsBottom}>
                                            {bottoms.map((bottom) => (
                                                <div key={bottom.id} onClick={() => handleBottomClick(bottom)}>
                                                    <img src={bottom.imageUrl} alt={bottom.brand} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
                                                </div>
                                            ))}
                                        </Slider>
                                    </div>

                                    <div className={`infoCarousel ${showBottomInfo ? 'show' : ''}`}>
                                        {selectedBottom && (
                                            <ClothesInfo item={selectedBottom} />
                                        )}
                                    </div>


                                </div>

                                <div className='clothesItem'>
                                    <div className='imgCarousel'>
                                        <Slider {...sliderSettingsShoe}>
                                            {shoes.map((shoe) => (
                                                <div key={shoe.id} onClick={() => handleShoeClick(shoe)}>
                                                    <img src={shoe.imageUrl} alt={shoe.brand} style={{ objectFit: 'contain', width: '80%', height: '80%' }} />
                                                </div>
                                            ))}
                                        </Slider>
                                    </div>


                                    <div className={`infoCarousel ${showShoeInfo ? 'show' : ''}`}>
                                        {selectedShoe && (
                                            <ClothesInfo item={selectedShoe} />
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
