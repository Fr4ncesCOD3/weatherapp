// Importiamo gli hook e i componenti necessari da React e react-bootstrap
import { useState } from 'react';
import { Form, ListGroup, Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'react-bootstrap-icons';

// Varianti per animazioni
const containerVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  },
  hover: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    scale: 1.02,
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.98,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    transition: { duration: 0.1 }
  }
};

// Componente SearchCity che permette di cercare e selezionare città
// Riceve come prop onCitySelect per aggiornare la lista delle città
// Riceve come prop setError per gestire eventuali errori
function SearchCity({ onCitySelect, setError }) {
  // State per gestire il testo inserito nella ricerca
  const [searchTerm, setSearchTerm] = useState('');
  // State per gestire l'elenco dei suggerimenti delle città
  const [suggestions, setSuggestions] = useState([]);
  // State per gestire lo stato di caricamento
  const [loading, setLoading] = useState(false);

  // Funzione che gestisce la ricerca quando l'utente digita
  const handleSearch = async (e) => {
    const value = e.target.value;
    setSearchTerm(value); // Aggiorniamo il testo di ricerca
    setError(null); // Resetta eventuali errori precedenti

    // Facciamo la ricerca solo se sono stati inseriti almeno 3 caratteri
    if (value.length > 2) {
      try {
        setLoading(true);
        const response = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${value}&limit=5&appid=${import.meta.env.VITE_W_KEY}`
        );
        
        if (!response.ok) {
          throw new Error(`Errore nella ricerca: ${response.status}`);
        }
        
        const data = await response.json();
        setSuggestions(data);
        setLoading(false);
      } catch (err) {
        console.error('Errore nella ricerca:', err);
        setError('Impossibile completare la ricerca. Riprova più tardi.');
        setSuggestions([]);
        setLoading(false);
      }
    } else {
      setSuggestions([]); // Se il testo è troppo corto, svuotiamo i suggerimenti
    }
  };

  // Funzione chiamata quando l'utente seleziona una città
  const handleCitySelect = async (city) => {
    try {
      setLoading(true);
      const weatherResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${import.meta.env.VITE_W_KEY}&units=metric&lang=it`
      );
      
      if (!weatherResponse.ok) {
        throw new Error(`Errore nel recupero dati meteo: ${weatherResponse.status}`);
      }
      
      const weatherData = await weatherResponse.json();
      onCitySelect(weatherData);
      
      // Resettiamo il form di ricerca
      setSearchTerm('');
      setSuggestions([]);
      setLoading(false);
    } catch (err) {
      console.error('Errore nel recupero dati meteo:', err);
      setError('Impossibile recuperare i dati meteo per questa città.');
      setLoading(false);
    }
  };

  // Renderizziamo l'interfaccia di ricerca
  return (
    <motion.div 
      className="search-container mb-4 position-relative"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="search-input-wrapper position-relative">
        <Form.Control
          type="text"
          placeholder="Cerca una città..."
          value={searchTerm}
          onChange={handleSearch}
          autoComplete="off"
          aria-label="Cerca città"
          className="search-input pr-4"
        />
        <motion.div 
          className="search-icon position-absolute d-flex align-items-center justify-content-center" 
          style={{ 
            right: '15px', 
            top: '0', 
            bottom: '0', 
            height: '100%',
            pointerEvents: 'none' 
          }}
          initial={{ opacity: 0.5 }}
          animate={{ 
            opacity: loading ? 0 : 1,
            rotate: searchTerm.length > 0 ? [0, -10, 10, -10, 0] : 0
          }}
          transition={{ 
            duration: 0.5,
            rotate: { repeat: searchTerm.length > 0 ? 0 : Infinity, repeatDelay: 5 }
          }}
        >
          <Search size={18} />
        </motion.div>
        
        {loading && (
          <motion.div 
            className="position-absolute d-flex align-items-center justify-content-center" 
            style={{ 
              right: '15px', 
              top: '0', 
              bottom: '0', 
              height: '100%'
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <Spinner animation="border" size="sm" />
          </motion.div>
        )}
      </div>
      
      <AnimatePresence>
        {suggestions.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
          >
            <ListGroup className="mt-2 city-suggestions">
              {suggestions.map((city, index) => (
                <motion.div
                  key={`${city.lat}-${city.lon}-${index}`}
                  variants={itemVariants}
                  whileHover="hover"
                  whileTap="tap"
                  layout
                >
                  <ListGroup.Item
                    action
                    onClick={() => handleCitySelect(city)}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <span>{city.name}, {city.country}</span>
                    {city.state && <small className="text-muted">{city.state}</small>}
                  </ListGroup.Item>
                </motion.div>
              ))}
            </ListGroup>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Esportiamo il componente per usarlo in altre parti dell'app
export default SearchCity;
