// Importiamo i componenti e gli hook necessari
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons'; 
import { motion, AnimatePresence } from 'framer-motion';
import NextDays from './NextDays';
import GraphicWeather from './GraphicWeather';
import './SingleCity.css';

// Varianti per l'animazione del contenuto
const contentVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    y: -50,
    transition: {
      duration: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

// Componente che mostra i dettagli di una singola città
function SingleCity() {
  const { cityId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Se abbiamo già i dati passati tramite state, li usiamo
    if (location.state?.weatherData) {
      setWeatherData(location.state.weatherData);
      setLoading(false);
    } else {
      // Altrimenti facciamo una chiamata API per ottenerli
      const fetchCityData = async () => {
        try {
          setLoading(true);
          // Prima dobbiamo trovare lat/lon della città
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?id=${cityId}&appid=${import.meta.env.VITE_W_KEY}&units=metric&lang=it`
          );
          
          if (!response.ok) {
            throw new Error('Errore nel recupero dati');
          }
          
          const data = await response.json();
          setWeatherData(data);
          setLoading(false);
        } catch (err) {
          console.error('Errore:', err);
          setError('Impossibile recuperare i dati della città');
          setLoading(false);
        }
      };
      
      fetchCityData();
    }
  }, [cityId, location.state]);

  if (loading) {
    return (
      <motion.div 
        className="single-city-container d-flex justify-content-center align-items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          animate={{ 
            rotate: 360,
            transition: { duration: 1.5, repeat: Infinity, ease: "linear" }
          }}
        >
          <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Caricamento...</span>
          </Spinner>
        </motion.div>
      </motion.div>
    );
  }

  if (error || !weatherData) {
    return (
      <motion.div 
        className="single-city-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Container className="text-center py-5">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-white mb-4">Errore: {error || 'Dati non disponibili'}</h3>
            <Button variant="light" onClick={() => navigate('/')} className="mt-3">
              Torna alla home
            </Button>
          </motion.div>
        </Container>
      </motion.div>
    );
  }

  return (
    <div className="single-city-container">
      {/* Sfondo decorativo */}
      <div className="city-backdrop"></div>
      
      <Container className="position-relative py-4">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Button 
            variant="link" 
            className="back-button"
            onClick={() => navigate('/')} // Quando cliccato, torna alla home
          >
            <ArrowLeft size={25} className="me-2" />
            Torna alla home
          </Button>
        </motion.div>

        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div className="city-header text-center" variants={itemVariants}>
            <motion.h1 
              className="city-name"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                delay: 0.2,
                duration: 0.8
              }}
            >
              {weatherData.name}
            </motion.h1>
            <motion.div 
              className="temperature-display"
              variants={itemVariants}
            >
              <motion.h2 
                className="current-temp"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
              >
                {Math.round(weatherData.main.temp)}°
              </motion.h2>
              <motion.p 
                className="weather-description"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                {weatherData.weather[0].description}
              </motion.p>
            </motion.div>
            <motion.div 
              className="temp-range"
              variants={itemVariants}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <span>Min: {Math.round(weatherData.main.temp_min)}° </span>
              <span className="mx-2">|</span>
              <span>Max: {Math.round(weatherData.main.temp_max)}°</span>
            </motion.div>
          </motion.div>

          <motion.div 
            className="weather-details-grid"
            variants={itemVariants}
          >
            <Row className="g-3">
              <Col md={4} sm={6}>
                <motion.div 
                  className="weather-detail-card"
                  whileHover={{ y: -10, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h5>Umidità</h5>
                  <p>{weatherData.main.humidity}%</p>
                  <motion.div 
                    className="detail-icon humidity-icon"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  ></motion.div>
                </motion.div>
              </Col>
              <Col md={4} sm={6}>
                <motion.div 
                  className="weather-detail-card"
                  whileHover={{ y: -10, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h5>Vento</h5>
                  <p>{weatherData.wind.speed} m/s</p>
                  <motion.div 
                    className="detail-icon wind-icon"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  ></motion.div>
                </motion.div>
              </Col>
              <Col md={4} sm={12}>
                <motion.div 
                  className="weather-detail-card"
                  whileHover={{ y: -10, boxShadow: "0px 10px 20px rgba(0,0,0,0.2)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <h5>Pressione</h5>
                  <p>{weatherData.main.pressure} hPa</p>
                  <motion.div 
                    className="detail-icon pressure-icon"
                    animate={{ scale: [1, 0.9, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  ></motion.div>
                </motion.div>
              </Col>
            </Row>
          </motion.div>

          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <NextDays lat={weatherData.coord.lat} lon={weatherData.coord.lon} />
          </motion.div>
          
          <motion.div
            variants={itemVariants}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
          >
            <GraphicWeather lat={weatherData.coord.lat} lon={weatherData.coord.lon} />
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
}

// Esportiamo il componente per usarlo in altre parti dell'app
export default SingleCity;
