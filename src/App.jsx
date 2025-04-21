import { useState, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import './App.css'
import SearchCity from './components/SearchCity'
import CityList from './components/CityList'
import SingleCity from './components/SingleCity'
import ErrorConnect from './components/ErrorConnect'
import ModalCheck from './components/ModalCheck'

// Varianti per animazioni
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0
  },
  exit: {
    opacity: 0,
    y: -20
  }
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.5
}

function App() {
  const location = useLocation()
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
      <AnimatePresence mode="wait">
        {showModal && (
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <ModalCheck 
              onAccept={handleAcceptLocation} 
              onDecline={handleDeclineLocation} 
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={
            <motion.div
              className="home-container"
              initial="initial"
              animate="in"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <div className="city-backdrop"></div>
              <div className="content-container">
                <motion.h1 
                  className="app-title"
                  initial={{ y: -50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
                >
                  Weather App
                </motion.h1>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <SearchCity onCitySelect={(city) => {
                    setCities(prev => {
                      if (prev.some(c => c.id === city.id)) return prev;
                      const newCities = [...prev, city];
                      localStorage.setItem('cities', JSON.stringify(newCities));
                      return newCities;
                    });
                  }} setError={setError} />
                </motion.div>
                
                {error && 
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <ErrorConnect message={error} />
                  </motion.div>
                }
                
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <CityList 
                    cities={cities} 
                    userLocation={userLocation}
                    setCities={setCities}
                  />
                </motion.div>
              </div>
            </motion.div>
          } />
          
          <Route path="/city/:cityId" element={
            <motion.div
              initial="initial"
              animate="in"
              exit="exit"
              variants={pageVariants}
              transition={pageTransition}
            >
              <SingleCity />
            </motion.div>
          } />
        </Routes>
      </AnimatePresence>
    </div>
  )
}

export default App
