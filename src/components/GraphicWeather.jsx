// Importiamo gli hook necessari da React e i componenti per il grafico
import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Alert } from 'react-bootstrap';
// Importiamo tutti i componenti necessari per Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
// Importiamo il file CSS per gli stili
import './GraphicWeather.css';

// Registriamo i componenti di Chart.js che useremo
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Componente principale che mostra un grafico dell'andamento della temperatura
// Riceve come props le coordinate geografiche (lat, lon)
function GraphicWeather({ lat, lon }) {
  // State per memorizzare i dati della temperatura
  const [tempData, setTempData] = useState(null);
  // State per memorizzare il consiglio del giorno
  const [advice, setAdvice] = useState('');

  // useEffect viene eseguito quando cambiano lat o lon
  useEffect(() => {
    // Funzione asincrona per recuperare i dati meteo
    const fetchDailyData = async () => {
      try {
        // Chiamata API a OpenWeatherMap per ottenere le previsioni
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${import.meta.env.VITE_W_KEY}&units=metric&lang=it`
        );
        const data = await response.json();
        
        // Prendiamo solo la data di oggi (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];
        // Filtriamo i dati per avere solo quelli di oggi
        const todayData = data.list.filter(item => 
          item.dt_txt.split(' ')[0] === today
        );

        // Salviamo i dati filtrati nello state
        setTempData(todayData);
        
        // Calcoliamo la temperatura media del giorno
        const avgTemp = todayData.reduce((acc, curr) => 
          acc + curr.main.temp, 0) / todayData.length;
        
        // In base alla temperatura media, settiamo un consiglio diverso
        if (avgTemp >= 25) {
          setAdvice('🌊 È ora di andare al mare! Prepara l\'ombrellone, la crema solare e tanta acqua fresca. Non dimenticare di idratati frequentemente!');
        } else if (avgTemp >= 15 && avgTemp < 25) {
          setAdvice('🌸 Temperatura primaverile perfetta! Togli la giacca, è il momento ideale per una passeggiata al parco o un pic-nic all\'aria aperta.');
        } else {
          setAdvice('☕ Torna a casa! Con queste temperature è il momento perfetto per una cioccolata calda con panna e un bel letargo sotto il plaid.');
        }
      } catch (error) {
        console.error('Errore nel caricamento dei dati:', error);
      }
    };

    // Chiamiamo la funzione per recuperare i dati
    fetchDailyData();
  }, [lat, lon]);

  // Se i dati non sono ancora caricati, mostriamo un messaggio di caricamento
  if (!tempData) {
    return <div>Caricamento...</div>;
  }

  // Prepariamo i dati per il grafico
  const chartData = {
    // Sull'asse X mostriamo le ore (formato HH:mm)
    labels: tempData.map(item => item.dt_txt.split(' ')[1].slice(0, 5)),
    datasets: [
      {
        label: 'Temperatura (°C)',
        // Sull'asse Y mostriamo le temperature
        data: tempData.map(item => item.main.temp),
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  // Configurazione delle opzioni del grafico
  const options = {
    responsive: true, // Il grafico si adatta alle dimensioni del contenitore
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false // Nascondiamo la legenda
      },
      title: {
        display: false // Nascondiamo il titolo
      },
      // Configurazione dei tooltip (le info che appaiono al passaggio del mouse)
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#000',
        bodyColor: '#000',
        titleFont: {
          size: 16,
          weight: 'bold'
        },
        bodyFont: {
          size: 14
        },
        padding: 12,
        borderColor: 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          // Personalizzazione del testo nel tooltip
          title: (items) => {
            return `Ore ${items[0].label}`;
          },
          label: (item) => {
            return `${item.formattedValue}°C`;
          }
        }
      }
    },
    // Configurazione degli assi
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12
          },
          callback: (value) => `${value}°`
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12
          }
        }
      }
    },
    // Stile degli elementi del grafico (linea e punti)
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        fill: 'start',
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
      },
      point: {
        radius: 6,
        hitRadius: 6,
        borderWidth: 3,
        backgroundColor: 'rgba(255, 255, 255, 1)',
        borderColor: 'rgba(255, 255, 255, 0.8)',
        hoverRadius: 8,
        hoverBorderWidth: 4
      }
    }
  };

  // Renderizziamo il grafico e il consiglio
  return (
    <div className="graphic-weather">
      <h3>Andamento Temperatura</h3>
      <div className="chart-container">
        <Line data={chartData} options={options} />
      </div>
      {/* Mostriamo il consiglio del giorno in un alert */}
      <Alert variant="info">
        <strong>Consiglio del giorno</strong> {advice}
      </Alert>
    </div>
  );
}

export default GraphicWeather;
