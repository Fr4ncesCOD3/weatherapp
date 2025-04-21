// Importiamo gli hook necessari da React e i componenti di react-bootstrap
import { useState, useEffect } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
// Importiamo il file CSS per gli stili
import './NextDays.css';

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
      <div className="hourly-forecast d-flex justify-content-center align-items-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </Spinner>
      </div>
    );
  }

  // Se c'è un errore, mostriamo un alert
  if (error) {
    return (
      <div className="hourly-forecast">
        <Alert variant="danger">
          {error}
        </Alert>
      </div>
    );
  }

  // Se non ci sono dati, mostriamo un messaggio informativo
  if (!hourlyData || hourlyData.length === 0) {
    return (
      <div className="hourly-forecast">
        <Alert variant="info">
          Nessuna previsione disponibile al momento.
        </Alert>
      </div>
    );
  }

  // Renderizziamo le previsioni orarie
  return (
    <div className="hourly-forecast">
      <h3 className="mb-4">Previsioni orarie</h3>
      {/* Container scrollabile per le previsioni */}
      <div className="forecast-scroll">
        {/* Mappiamo i dati orari per creare le card */}
        {hourlyData.map((hour, index) => (
          <div key={index} className="forecast-card d-flex flex-column justify-content-between">
            <div className="d-flex flex-column align-items-center">
              {/* Mostriamo l'ora */}
              <p className="hour mb-2">
                {new Date(hour.dt * 1000).toLocaleTimeString('it-IT', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
              {/* Mostriamo l'icona del meteo */}
              <div className="weather-icon-container mb-1">
                <img
                  src={`https://openweathermap.org/img/wn/${hour.weather[0].icon}@2x.png`}
                  alt={hour.weather[0].description}
                  className="img-fluid"
                />
              </div>
              {/* Mostriamo la temperatura arrotondata */}
              <p className="temp mb-0">{Math.round(hour.main.temp)}°</p>
            </div>
            {/* Mostriamo la descrizione del meteo */}
            <p className="description small text-center mb-0">
              {hour.weather[0].description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Esportiamo il componente per usarlo in altre parti dell'app
export default NextDays;
