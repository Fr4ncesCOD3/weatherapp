// Importiamo il componente CityCard che useremo per mostrare i dati di ogni città
import CityCard from './CityCard';
import { useNavigate } from 'react-router-dom';

// Componente CityList che mostra la lista delle città
// Riceve come props:
// - cities: array delle città salvate
// - userLocation: dati della posizione dell'utente
// - setCities: funzione per aggiornare l'array delle città
function CityList({ cities, userLocation, setCities }) {
  const navigate = useNavigate();

  // Funzione che gestisce l'eliminazione di una città
  const handleDelete = (cityId) => {
    // Aggiorna lo state delle città usando setCities
    setCities(prevCities => {
      // Crea un nuovo array escludendo la città da eliminare
      const newCities = prevCities.filter(city => city.id !== cityId);
      // Salva il nuovo array nel localStorage
      localStorage.setItem('cities', JSON.stringify(newCities));
      // Ritorna il nuovo array che verrà usato come nuovo state
      return newCities;
    });
  };

  // Gestisce la selezione di una città
  const handleCitySelect = (city) => {
    navigate(`/city/${city.id}`, { state: { weatherData: city } });
  };

  return (
    <div className="city-list">
      {(cities.length === 0 && !userLocation) && (
        <div className="no-cities-message text-center p-4">
          <p className="fs-4 mb-2">Nessuna città salvata</p>
          <p className="text-light">Cerca una città per visualizzare le previsioni meteo</p>
        </div>
      )}
      
      <div className="row g-4">
        {/* Card della posizione utente */}
        {userLocation && (
          <div className="col-md-4 col-sm-6">
            <CityCard 
              weatherData={userLocation} 
              isUserLocation={true}
              onSelect={() => handleCitySelect(userLocation)}
            />
          </div>
        )}
        
        {/* Card delle città salvate */}
        {cities.map((city) => (
          <div key={city.id} className="col-md-4 col-sm-6">
            <CityCard 
              weatherData={city} 
              isUserLocation={false}
              onSelect={() => handleCitySelect(city)}
              onDelete={() => handleDelete(city.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Esporta il componente per usarlo in altre parti dell'app
export default CityList;
