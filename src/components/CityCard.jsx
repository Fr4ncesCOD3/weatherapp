// Importiamo i componenti necessari da react-bootstrap e react-router-dom
import { Card, Badge, Button } from 'react-bootstrap';
import { TrashFill } from 'react-bootstrap-icons'; 
import { motion } from 'framer-motion';

// Varianti per l'animazione della card
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 20,
      duration: 0.5
    }
  },
  hover: { 
    scale: 1.05, 
    boxShadow: "0px 10px 20px rgba(0,0,0,0.15)",
    transition: { duration: 0.3 }
  },
  tap: { scale: 0.98, transition: { duration: 0.1 } }
};

// Varianti per l'icona meteo
const iconVariants = {
  initial: { rotate: -10, opacity: 0 },
  animate: { 
    rotate: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      duration: 0.8,
      delay: 0.2
    }
  },
  hover: { 
    scale: 1.1,
    rotate: 5,
    transition: { 
      yoyo: Infinity,
      duration: 3,
      ease: "easeInOut"
    }
  }
};

// Componente CityCard che mostra le informazioni meteo di una città
// Riceve come props:
// - weatherData: dati meteo della città
// - isUserLocation: booleano che indica se è la posizione dell'utente 
// - onSelect: funzione per selezionare la città
// - onDelete: funzione per eliminare la città
function CityCard({ weatherData, isUserLocation, onSelect, onDelete }) {
  // Verifichiamo che weatherData e le sue proprietà esistano
  if (!weatherData || !weatherData.weather || !weatherData.weather[0]) {
    return (
      <Card className="h-100 shadow-sm">
        <Card.Body>
          <div className="text-center">
            <p>Dati meteo non disponibili</p>
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      onClick={(e) => {
        // Se il click è sul bottone elimina, non navigare
        if (e.target.closest('.delete-btn')) return;
        onSelect();
      }}
      layout
    >
      <Card className="h-100 cursor-pointer">
        <Card.Body>
          {/* Header della card con nome città e badge/bottone elimina */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div className="d-flex align-items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card.Title className="mb-0">{weatherData.name}</Card.Title>
              </motion.div>
              {/* Badge "La tua posizione" */}
              {isUserLocation && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, delay: 0.3 }}
                >
                  <Badge bg="primary" className="ms-2">La tua posizione</Badge>
                </motion.div>
              )}
            </div>
            {/* Bottone elimina */}
            {!isUserLocation && (
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="link" 
                  className="delete-btn p-0 ms-2 text-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  style={{ 
                    border: 'none', 
                    background: 'none'
                  }}
                  aria-label="Elimina città"
                >
                  <TrashFill size={20} />
                </Button>
              </motion.div>
            )}
          </div>

          {/* Sezione centrale con icona e temperatura */}
          <div className="text-center mb-3">
            <motion.div
              variants={iconVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <img
                src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
                alt={weatherData.weather[0].description}
                loading="lazy"
                width="80"
                height="80"
              />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.4 }}
            >
              {Math.round(weatherData.main?.temp || 0)}°C
            </motion.h2>
          </div>

          {/* Dettagli meteo */}
          <motion.div 
            className="weather-details"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <div className="mb-2 text-capitalize">{weatherData.weather[0].description}</div>
            <div className="mb-2">Umidità: {weatherData.main?.humidity || 'N/A'}%</div>
            <div>Vento: {weatherData.wind?.speed || 'N/A'} m/s</div>
          </motion.div>
        </Card.Body>
      </Card>
    </motion.div>
  );
}

export default CityCard;
