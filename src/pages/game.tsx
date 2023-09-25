import React, { useState, useEffect } from 'react';

// Interfaz para el evento SCORE
interface ScoreEvent {
  trivia_id: string;
  type: 'score';
  scores: Record<string, number>;
}

// Interfaz para el evento STREAK
interface StreakEvent {
  trivia_id: string;
  type: 'streak';
  username: string;
  streak: number;
}

interface GameProps {
  socket: WebSocket | null;
}

const Game: React.FC<GameProps> = ({ socket }) => {
  const [scores, setScores] = useState<Record<string, number>>({});
  const [bestStreak, setBestStreak] = useState<StreakEvent | null>(null);

  useEffect(() => {
    const handleScoreMessage = (event: MessageEvent) => {
      const data: ScoreEvent = JSON.parse(event.data);
      if (data.type === 'score') {
        setScores(data.scores);
      }
    };

    const handleStreakMessage = (event: MessageEvent) => {
      const data: StreakEvent = JSON.parse(event.data);
      if (data.type === 'streak') {
        setBestStreak(data);
      }
    };

    if (socket) {
      socket.addEventListener('message', handleScoreMessage);
      socket.addEventListener('message', handleStreakMessage);
    }

    return () => {
      if (socket) {
        socket.removeEventListener('message', handleScoreMessage);
        socket.removeEventListener('message', handleStreakMessage);
      }
    };
  }, [socket]);

  return (
    <div>
      <h1>Juego de Trivia</h1>
      <div>
        <h2>Tabla de Puntuación</h2>
        <table>
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Puntos</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(scores).map(([username, score]) => (
              <tr key={username}>
                <td>{username}</td>
                <td>{score} puntos</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {bestStreak && (
        <div>
          <h2>Jugador con la mejor racha</h2>
          <p>
            {bestStreak.username}: {bestStreak.streak} preguntas correctas consecutivas
          </p>
        </div>
      )}
    </div>
  );
};

export default Game;
