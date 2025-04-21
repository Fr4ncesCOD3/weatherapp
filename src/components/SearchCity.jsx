// Importiamo gli hook e i componenti necessari da React e react-bootstrap
import { useState } from 'react';
import { Form, ListGroup, Spinner } from 'react-bootstrap';

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
    <div className="search-container mb-4 position-relative">
      {/* Campo di input per la ricerca */}
      <Form.Control
        type="text"
        placeholder="Cerca una città..."
        value={searchTerm}
        onChange={handleSearch}
        autoComplete="off"
        aria-label="Cerca città"
      />
      
      {loading && (
        <div className="position-absolute top-0 end-0 me-3 mt-2">
          <Spinner animation="border" size="sm" />
        </div>
      )}
      
      {suggestions.length > 0 && (
        <ListGroup className="mt-2 city-suggestions">
          {/* Mappiamo i suggerimenti per creare la lista */}
          {suggestions.map((city, index) => (
            <ListGroup.Item
              key={`${city.lat}-${city.lon}-${index}`}
              action
              onClick={() => handleCitySelect(city)}
              className="d-flex justify-content-between align-items-center"
            >
              <span>{city.name}, {city.country}</span>
              {city.state && <small className="text-muted">{city.state}</small>}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
}

// Esportiamo il componente per usarlo in altre parti dell'app
export default SearchCity;
