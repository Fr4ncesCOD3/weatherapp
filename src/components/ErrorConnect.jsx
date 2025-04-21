// Importiamo i componenti necessari da React e il file CSS per gli stili
import React, { useEffect, useState } from 'react';
import './ErrorConnect.css';

// Componente che mostra un messaggio di errore quando l'utente è offline
const ErrorConnect = () => {
  // Creiamo uno state per tenere traccia dello stato della connessione
  // window.navigator.onLine ci dice se il browser è online o offline
  const [isOnline, setIsOnline] = useState(window.navigator.onLine);

  // useEffect viene eseguito quando il componente viene montato
  useEffect(() => {
    // Funzione che viene chiamata quando torna la connessione
    const handleOnline = () => {
      setIsOnline(true); // Aggiorna lo state
      window.location.reload(); // Ricarica la pagina
    };

    // Funzione che viene chiamata quando si perde la connessione
    const handleOffline = () => {
      setIsOnline(false); // Aggiorna lo state
    };

    // Aggiungiamo i listener per monitorare lo stato della connessione
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup: rimuoviamo i listener quando il componente viene smontato
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []); // Array vuoto significa che useEffect viene eseguito solo al mount

  // Renderizziamo l'interfaccia utente
  return (
    // Container principale con classe per lo stile
    <div className="error-connect-container">
      <div className="error-content">
        {/* Icona animata di una nuvola */}
        <div className="cloud-animation">
          <i className="fas fa-cloud-slash"></i>
        </div>
        {/* Titolo del messaggio di errore */}
        <h1>Oops! Sei Offline</h1>
        {/* Messaggio principale con animazione pulse */}
        <p className="pulse-text">
          Sembra che la tua connessione internet sia assente.
        </p>
        {/* Istruzioni per l'utente */}
        <div className="reconnect-message">
          <p>Per continuare ad utilizzare Weather App,</p>
          <p>controlla la tua connessione e riprova.</p>
        </div>
        {/* Indicatore dello stato della connessione */}
        <div className="status-indicator">
          {/* Punto colorato che cambia in base allo stato */}
          <span className={`dot ${isOnline ? 'online' : 'offline'}`}></span>
          {/* Testo che mostra lo stato attuale */}
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>
    </div>
  );
};

// Esportiamo il componente per poterlo utilizzare in altre parti dell'app
export default ErrorConnect;
