// Importiamo i componenti e gli hook necessari
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { ArrowLeft } from 'react-bootstrap-icons'; 
import NextDays from './NextDays';
import GraphicWeather from './GraphicWeather';
import './SingleCity.css';

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
      <div className="single-city-container d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </div>
    );
  }

  if (error || !weatherData) {
    return (
      <div className="single-city-container">
        <Container className="text-center py-5">
          <h3 className="text-white">Errore: {error || 'Dati non disponibili'}</h3>
          <Button variant="light" onClick={() => navigate('/')} className="mt-3">
            Torna alla home
          </Button>
        </Container>
      </div>
    );
  }

  return (
    <div className="single-city-container">
      {/* Sfondo decorativo */}
      <div className="city-backdrop"></div>
      
      <Container className="position-relative py-4">
        {/* Pulsante per tornare alla home */}
        <Button 
          variant="link" 
          className="back-button"
          onClick={() => navigate('/')} // Quando cliccato, torna alla home
        >
          <ArrowLeft size={25} className="me-2" />
          Torna alla home
        </Button>

        {/* Intestazione con nome città e temperature */}
        <div className="city-header text-center">
          <h1 className="city-name">{weatherData.name}</h1>
          <div className="temperature-display">
            {/* Temperatura attuale arrotondata */}
            <h2 className="current-temp">{Math.round(weatherData.main.temp)}°</h2>
            {/* Descrizione del tempo (es. "nuvoloso", "soleggiato") */}
            <p className="weather-description">{weatherData.weather[0].description}</p>
          </div>
          {/* Range di temperatura (minima e massima) */}
          <div className="temp-range">
            <span>Min: {Math.round(weatherData.main.temp_min)}° </span>
            <span className="mx-2">|</span>
            <span>Max: {Math.round(weatherData.main.temp_max)}°</span>
          </div>
        </div>

        {/* Griglia con dettagli meteo aggiuntivi */}
        <div className="weather-details-grid">
          <Row className="g-3">
            {/* Card per l'umidità */}
            <Col md={4} sm={6}>
              <div className="weather-detail-card">
                <h5>Umidità</h5>
                <p>{weatherData.main.humidity}%</p>
                <div className="detail-icon humidity-icon"></div>
              </div>
            </Col>
            {/* Card per il vento */}
            <Col md={4} sm={6}>
              <div className="weather-detail-card">
                <h5>Vento</h5>
                <p>{weatherData.wind.speed} m/s</p>
                <div className="detail-icon wind-icon"></div>
              </div>
            </Col>
            {/* Card per la pressione */}
            <Col md={4} sm={12}>
              <div className="weather-detail-card">
                <h5>Pressione</h5>
                <p>{weatherData.main.pressure} hPa</p>
                <div className="detail-icon pressure-icon"></div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Componenti per previsioni future e grafico */}
        <NextDays lat={weatherData.coord.lat} lon={weatherData.coord.lon} />
        <GraphicWeather lat={weatherData.coord.lat} lon={weatherData.coord.lon} />
      </Container>
    </div>
  );
}

// Esportiamo il componente per usarlo in altre parti dell'app
export default SingleCity;
