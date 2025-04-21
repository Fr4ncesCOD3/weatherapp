// Importiamo gli hook necessari da React e i componenti di react-bootstrap
import { useState, useEffect, useMemo } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion';
// Importiamo il file CSS per gli stili
import './NextDays.css';

// Varianti per le animazioni
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      when: "beforeChildren",
      staggerChildren: 0.1
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

// Componente CloudAnimation per le animazioni delle nuvole
const CloudAnimation = () => {
  // Creiamo 5 nuvole con posizioni e dimensioni casuali
  const clouds = useMemo(() => {
    return Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 80}%`,
      size: Math.random() * 15 + 10,
      delay: Math.random() * 3,
      duration: Math.random() * 5 + 10
    }));
  }, []);

  return (
    <motion.div className="cloud-animation-container">
      {clouds.map((cloud) => (
        <motion.div
          key={cloud.id}
          className="cloud"
          style={{
            top: cloud.top,
            width: `${cloud.size}px`,
            height: `${cloud.size}px`,
          }}
          initial={{ x: '-150%' }}
          animate={{ x: '150%' }}
          transition={{
            duration: cloud.duration,
            delay: cloud.delay,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear'
          }}
        />
      ))}
    </motion.div>
  );
};

// Componente RainAnimation per le animazioni della pioggia
const RainAnimation = () => {
  // Creiamo gocce di pioggia con posizioni e tempi casuali
  const raindrops = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 2,
      duration: Math.random() * 0.5 + 0.7
    }));
  }, []);

  return (
    <motion.div className="rain-animation-container">
      {raindrops.map((drop) => (
        <motion.div
          key={drop.id}
          className="raindrop"
          style={{
            left: drop.left,
          }}
          initial={{ y: '-50%', opacity: 0 }}
          animate={{ y: '150%', opacity: [0, 1, 1, 0] }}
          transition={{
            duration: drop.duration,
            delay: drop.delay,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'linear',
            times: [0, 0.1, 0.9, 1]
          }}
        />
      ))}
    </motion.div>
  );
};

// Funzione helper per determinare il tipo di meteo in base all'icona
const getWeatherType = (iconCode) => {
  // Controlla se è nuvoloso: 03d, 03n, 04d, 04n
  if (['03d', '03n', '04d', '04n'].includes(iconCode)) {
    return 'cloudy';
  }
  // Controlla se è piovoso: 09d, 09n, 10d, 10n, 11d, 11n
  if (['09d', '09n', '10d', '10n', '11d', '11n'].includes(iconCode)) {
    return 'rainy';
  }
  // Altrimenti, nessuna animazione speciale
  return 'other';
};

// Componente WeatherCard con animazioni specifiche per il meteo
const WeatherCard = ({ hour, index }) => {
  const weatherType = getWeatherType(hour.weather[0].icon);
  
  return (
    <motion.div
      key={index}
      className="forecast-card d-flex flex-column justify-content-between"
      variants={itemVariants}
      whileHover={{ 
        y: -10, 
        boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
        scale: 1.03
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300,
        damping: 15
      }}
      custom={index}
    >
      {/* Animazioni per il tipo di meteo */}
      {weatherType === 'cloudy' && <CloudAnimation />}
      {weatherType === 'rainy' && <RainAnimation />}
      
      <div className="d-flex flex-column align-items-center">
        {/* Mostriamo l'ora */}
        <motion.p 
          className="hour mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 + index * 0.1 }}
        >
          {new Date(hour.dt * 1000).toLocaleTimeString('it-IT', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </motion.p>
        {/* Mostriamo l'icona del meteo */}
        <motion.div 
          className="weather-icon-container mb-1"
          animate={{ 
            rotate: weatherType === 'other' ? [0, 10, 0, -10, 0] : 0,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 5,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut",
            delay: index * 0.2
          }}
        >
          <img
            src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`}
            alt={hour.weather[0].description}
            className="img-fluid"
          />
        </motion.div>
        {/* Mostriamo la temperatura arrotondata */}
        <motion.p 
          className="temp mb-0"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            delay: 0.4 + index * 0.1,
            type: "spring",
            stiffness: 300
          }}
        >
          {Math.round(hour.main.temp)}°
        </motion.p>
      </div>
      {/* Mostriamo la descrizione del meteo */}
      <motion.p 
        className="description small text-center mb-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 + index * 0.1 }}
      >
        {hour.weather[0].description}
      </motion.p>
    </motion.div>
  );
};

// Componente NextDays che mostra le previsioni orarie
// Riceve come props le coordinate geografiche (lat, lon)
function NextDays({ lat, lon }) {
  // State per memorizzare i dati orari
  const [hourlyData, setHourlyData] = useState(null);
  // State per gestire lo stato di caricamento
  const [loading, setLoading] = useState(true);
  // State per gestire gli errori
  const [error, setError] = useState(null);

  // useEffect viene eseguito quando cambiano lat o lon
  useEffect(() => {
    // Funzione asincrona per recuperare i dati meteo
    const fetchHourlyData = async () => {
      try {
        // Impostiamo loading a true mentre carichiamo i dati
        setLoading(true);
        // Resettiamo eventuali errori precedenti
        setError(null);
        
        // Prima chiamata API per ottenere i dati meteo attuali
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_W_KEY}&units=metric&lang=it`
        );

        // Verifichiamo se la risposta è ok
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Convertiamo la risposta in JSON
        const currentData = await response.json();

        // Seconda chiamata API per ottenere le previsioni future
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_W_KEY}&units=metric&lang=it`
        );

        if (!forecastResponse.ok) {
          throw new Error(`HTTP error! status: ${forecastResponse.status}`);
        }

        const forecastData = await forecastResponse.json();
        
        // Combiniamo i dati attuali con le previsioni future
        const combinedData = [
          {
            dt: currentData.dt,
            main: currentData.main,
            weather: currentData.weather,
            dt_txt: new Date(currentData.dt * 1000).toISOString()
          },
          ...forecastData.list.slice(0, 7) // Prendiamo solo le prime 7 previsioni
        ];

        // Aggiorniamo lo state con i dati combinati
        setHourlyData(combinedData);
        // Impostiamo loading a false perché abbiamo finito
        setLoading(false);
      } catch (error) {
        // Gestiamo eventuali errori
        console.error('Errore nel caricamento dei dati orari:', error);
        setError('Impossibile caricare le previsioni orarie. Riprova più tardi.');
        setLoading(false);
      }
    };

    // Chiamiamo la funzione solo se abbiamo le coordinate
    if (lat && lon) {
      fetchHourlyData();
    }
  }, [lat, lon]);

  // Se stiamo caricando, mostriamo uno spinner
  if (loading) {
    return (
      <motion.div 
        className="hourly-forecast d-flex justify-content-center align-items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          animate={{ 
            rotate: 360
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </Spinner>
        </motion.div>
      </motion.div>
    );
  }

  // Se c'è un errore, mostriamo un alert
  if (error) {
    return (
      <motion.div 
        className="hourly-forecast"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20
        }}
      >
        <Alert variant="danger">
          {error}
        </Alert>
      </motion.div>
    );
  }

  // Se non ci sono dati, mostriamo un messaggio informativo
  if (!hourlyData || hourlyData.length === 0) {
    return (
      <motion.div 
        className="hourly-forecast"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 20
        }}
      >
        <Alert variant="info">
          Nessuna previsione disponibile al momento.
        </Alert>
      </motion.div>
    );
  }

  // Renderizziamo le previsioni orarie
  return (
    <motion.div 
      className="hourly-forecast"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h3 
        className="mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 24
        }}
      >
        Previsioni orarie
      </motion.h3>
      {/* Container scrollabile per le previsioni */}
      <motion.div className="forecast-scroll">
        {/* Utilizziamo il componente WeatherCard per ciascuna previsione */}
        {hourlyData.map((hour, index) => (
          <WeatherCard key={hour.dt} hour={hour} index={index} />
        ))}
      </motion.div>
    </motion.div>
  );
}

// Esportiamo il componente per usarlo in altre parti dell'app
export default NextDays;
