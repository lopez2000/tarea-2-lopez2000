import React, { useEffect, useState } from 'react';

interface Winner {
  username: string;
  score: number;
  streak: number;
}

interface HighscoreEvent {
  trivia_id: string;
  type: 'highscore';
  // winners es una lista de jsons con los campos username, score y streak
  winners: Winner[];
}

interface FinalScoreboardProps {
  socket: WebSocket | null;
  winners: Winner[];
}

const FinalScoreboard: React.FC<FinalScoreboardProps> = ({ socket, winners }) => {

  useEffect(() => {
    const handleHighscoreMessage = (event: MessageEvent) => {
      const data: HighscoreEvent = JSON.parse(event.data);
      if (data.type === 'highscore') {
        console.log('Evento HIGHSCORE recibido:', data);
      }
    };

    if (socket) {
      socket.onmessage = handleHighscoreMessage;
    }

    return () => {
      if (socket) {
        socket.onmessage = null;
      }
    };
  }, [socket]);

  // Iniciar un temporizador de 10 segundos para la redirección automática
  useEffect(() => {
    const redirectTimer = setTimeout(() => {
      handleExitTrivia();
    }, 10000); // 10 segundos

    // Limpia el temporizador si el componente se desmonta antes de que se complete
    return () => clearTimeout(redirectTimer);
  }, []);

  const handleExitTrivia = () => {
    // Aquí puedes realizar cualquier limpieza o desconexión necesaria antes de redirigir al usuario.
    // Por ejemplo, cerrar la conexión del socket si es necesario.

    // Redirigir al usuario a la página de inicio
    window.location.href = '/';
  };

  // Muestra los top tres ganadores, winners solamente tiene a los top tres
  return (
    <div>
      <h1>Trivia finalizada</h1>
      <h2>Top 3</h2>
      <ol>
        {winners.map((winner, index) => (
          <li key={index}>
            {index + 1}. {winner.username} - {winner.score} puntos
          </li>
        ))}
      </ol>
      <button onClick={handleExitTrivia}>Salir</button>
    </div>
  );
};

export default FinalScoreboard;
