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

// Definición de la interfaz para el evento "question" para iniciar el juego
interface QuestionEvent {
  trivia_id: string;
  type: 'question';
  question: {
    id: number;
    type: string;
    title: string;
    points: number;
    options?: Record<number, string>; // Opciones (solo para preguntas de tipo "button")
  };
}

interface LobbyViewProps {
  socket: WebSocket | null;
}

const LobbyView: React.FC<LobbyViewProps> = ({ socket }) => {
  const [players, setPlayers] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(100); // Valor predeterminado
  const [lobbyMessage, setLobbyMessage] = useState<string>('Esperando jugadores...');
  const [showGame, setShowGame] = useState<boolean>(false); // Estado para mostrar/ocultar el juego

  useEffect(() => {
    console.log('Socket en LobbyView:', socket);
    if (socket) {
      // Escuchar el evento LOBBY desde el WebSocket para obtener información del lobby
      const handleLobbyMessage = (event: MessageEvent) => {
        const data: LobbyEvent = JSON.parse(event.data);
        if (data.type === 'lobby') {
          console.log('Evento LOBBY recibido:', data);
          setPlayers(data.players);
          setTimeRemaining(data.seconds_remaining); // Actualizar timeRemaining con el valor del evento
          setLobbyMessage(data.message);
        } else if (data.type === 'question') {
          // Mostrar el juego cuando se reciba un evento de pregunta
          setShowGame(true);
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
      // Cuando el tiempo restante llega a uno, ocultar el juego
      setShowGame(false);
    }
  }, [timeRemaining]);

  return (
    <div>
      {showGame ? (
        <Game socket={socket} />
      ) : (
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
      )}
    </div>
  );
};

export default LobbyView;
