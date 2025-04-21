// Importiamo i componenti necessari da react-bootstrap e react-router-dom
import { Card, Badge, Button } from 'react-bootstrap';
import { TrashFill } from 'react-bootstrap-icons'; 

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
    <Card 
      className="h-100 shadow-sm cursor-pointer" 
      onClick={(e) => {
        // Se il click è sul bottone elimina, non navigare
        if (e.target.closest('.delete-btn')) return;
        onSelect();
      }}
      style={{ cursor: 'pointer' }}
    >
      <Card.Body>
        {/* Header della card con nome città e badge/bottone elimina */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <Card.Title className="mb-0">{weatherData.name}</Card.Title>
            {/* Badge "La tua posizione" */}
            {isUserLocation && (
              <Badge bg="primary" className="ms-2">La tua posizione</Badge>
            )}
          </div>
          {/* Bottone elimina */}
          {!isUserLocation && (
            <Button 
              variant="link" 
              className="delete-btn p-0 ms-2 text-danger"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              style={{ 
                border: 'none', 
                background: 'none',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="Elimina città"
            >
              <TrashFill size={20} />
            </Button>
          )}
        </div>

        {/* Sezione centrale con icona e temperatura */}
        <div className="text-center mb-3">
          <img
            src={`https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@2x.png`}
            alt={weatherData.weather[0].description}
            loading="lazy"
            width="80"
            height="80"
          />
          <h2>{Math.round(weatherData.main?.temp || 0)}°C</h2>
        </div>

        {/* Dettagli meteo */}
        <div className="weather-details">
          <div className="mb-2 text-capitalize">{weatherData.weather[0].description}</div>
          <div className="mb-2">Umidità: {weatherData.main?.humidity || 'N/A'}%</div>
          <div>Vento: {weatherData.wind?.speed || 'N/A'} m/s</div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default CityCard;
