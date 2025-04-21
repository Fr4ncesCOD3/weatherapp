// Importiamo i componenti Modal e Button dalla libreria react-bootstrap
import { Modal, Button } from 'react-bootstrap';

// Componente ModalCheck che mostra una finestra modale per chiedere il permesso di geolocalizzazione
// Riceve due props:
// - onAccept: funzione chiamata quando l'utente accetta
// - onDecline: funzione chiamata quando l'utente rifiuta
function ModalCheck({ onAccept, onDecline }) {
  return (
    // Componente Modal sempre visibile (show={true}) e centrato sullo schermo
    <Modal show={true} centered>
      {/* Header della modale con il titolo */}
      <Modal.Header>
        <Modal.Title>Richiesta di Geolocalizzazione</Modal.Title>
      </Modal.Header>

      {/* Corpo della modale con il messaggio per l'utente */}
      <Modal.Body>
        Vuoi permettere all'applicazione di accedere alla tua posizione per fornirti informazioni meteo più accurate?
      </Modal.Body>

      {/* Footer della modale con i pulsanti di azione */}
      <Modal.Footer>
        {/* Pulsante per rifiutare in grigio (secondary) */}
        <Button variant="secondary" onClick={onDecline}>
          Rifiuta
        </Button>
        {/* Pulsante per accettare in blu (primary) */}
        <Button variant="primary" onClick={onAccept}>
          Accetta
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

// Esportiamo il componente per poterlo utilizzare in altre parti dell'app
export default ModalCheck;
