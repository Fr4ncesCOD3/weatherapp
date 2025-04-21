import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import './App.css'
import SearchCity from './components/SearchCity'
import CityList from './components/CityList'
import SingleCity from './components/SingleCity'
import ErrorConnect from './components/ErrorConnect'
import ModalCheck from './components/ModalCheck'

function App() {
  const [cities, setCities] = useState([])
  const [userLocation, setUserLocation] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [error, setError] = useState(null)
  
  // Carica le città salvate dal localStorage all'avvio
  useEffect(() => {
    const savedCities = localStorage.getItem('cities')
    if (savedCities) {
      setCities(JSON.parse(savedCities))
    }
    
    // Verifica se l'utente ha già deciso sulla geolocalizzazione
    const locationDecision = localStorage.getItem('locationDecision')
    if (locationDecision === null) {
      setShowModal(true)
    } else if (locationDecision === 'accepted') {
      getUserLocation()
    }
  }, [])
  
  // Funzione per ottenere la posizione dell'utente
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            const response = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${import.meta.env.VITE_W_KEY}&units=metric`
            )
            const data = await response.json()
            setUserLocation(data)
          } catch (err) {
            console.error('Errore durante il recupero dei dati meteo:', err)
            setError('Impossibile recuperare i dati meteo per la tua posizione')
          }
        },
        (err) => {
          console.error('Errore di geolocalizzazione:', err)
          setError('Impossibile recuperare la tua posizione')
        }
      )
    } else {
      setError('Geolocalizzazione non supportata dal tuo browser')
    }
  }
  
  // Funzioni per la gestione del modale di geolocalizzazione
  const handleAcceptLocation = () => {
    localStorage.setItem('locationDecision', 'accepted')
    setShowModal(false)
    getUserLocation()
  }
  
  const handleDeclineLocation = () => {
    localStorage.setItem('locationDecision', 'declined')
    setShowModal(false)
  }

  return (
    <div className="app-container">
      {showModal && (
        <ModalCheck 
          onAccept={handleAcceptLocation} 
          onDecline={handleDeclineLocation} 
        />
      )}
      
      <Routes>
        <Route path="/" element={
          <div className="home-container">
            <div className="city-backdrop"></div>
            <div className="content-container">
              <h1 className="app-title">Weather App</h1>
              
              <SearchCity onCitySelect={(city) => {
                setCities(prev => {
                  if (prev.some(c => c.id === city.id)) return prev;
                  const newCities = [...prev, city];
                  localStorage.setItem('cities', JSON.stringify(newCities));
                  return newCities;
                });
              }} setError={setError} />
              
              {error && <ErrorConnect message={error} />}
              
              <CityList 
                cities={cities} 
                userLocation={userLocation}
                setCities={setCities}
              />
            </div>
          </div>
        } />
        
        <Route path="/city/:cityId" element={<SingleCity />} />
      </Routes>
    </div>
  )
}

export default App
