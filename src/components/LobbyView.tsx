import React, { useState, useEffect } from 'react';
import Game from '../pages/game';

// Definición de la interfaz para el evento "lobby"
interface LobbyEvent {
  trivia_id: string;
  type: "lobby";
  message: string;
  seconds_remaining: number;
  players: string[];
}

interface LobbyViewProps {
  socket: WebSocket | null;
}

const LobbyView: React.FC<LobbyViewProps> = ({ socket }) => {
  const [players, setPlayers] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(100); // Valor predeterminado
  const [lobbyMessage, setLobbyMessage] = useState<string>('Esperando jugadores...');

  useEffect(() => {
    console.log('Socket en LobbyView:', socket);
    if (socket) {
      // Escuchar el evento LOBBY desde el WebSocket para obtener información del lobby
      const handleLobbyMessage = (event: MessageEvent) => {
        const data: LobbyEvent = JSON.parse(event.data);
        console.log(data);
        if (data.type === 'lobby') {
          setPlayers(data.players);
          setTimeRemaining(data.seconds_remaining); // Actualizar timeRemaining con el valor del evento
          console.log(data.message);
          setLobbyMessage(data.message);
        } else if (data.type === 'question') {
          window.location.href = '/game';
        }
      };

      socket.addEventListener('message', handleLobbyMessage);

      return () => {
        socket.removeEventListener('message', handleLobbyMessage);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (timeRemaining === 1) {
      // Cuando el tiempo restante llega a cero, muestra el componente Game
      window.location.href = '/game'; // Redirigir a la ruta del componente Game
    }
  }, [timeRemaining]);

  return (
    <div>
      <div>
        <h1>Lobby</h1>
        <h2>{lobbyMessage}</h2>
        <h3>Lista de Jugadores:</h3>
        <ul>
          {players.map((player, index) => (
            <li key={index}>{player}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LobbyView;
