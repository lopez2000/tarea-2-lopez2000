import React, { useEffect, useState } from 'react';

interface Winner {
  username: string;
  score: number;
  streak: number;
}

interface FinalScoreboardProps {
  socket: WebSocket | null;
}

const FinalScoreboard: React.FC<FinalScoreboardProps> = ({ socket }) => {
  const [winners, setWinners] = useState<Winner[]>([]);

  useEffect(() => {
    const handleHighscoreMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === 'highscore') {
        setWinners(data.winners);
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

  return (
    <div>
      <h2>Tabla de Posiciones Final</h2>
      <table>
        <thead>
          <tr>
            <th>Nombre de Usuario</th>
            <th>Puntuación</th>
            <th>Racha</th>
          </tr>
        </thead>
        <tbody>
          {winners.map((winner, index) => (
            <tr key={index}>
              <td>{winner.username}</td>
              <td>{winner.score}</td>
              <td>{winner.streak}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FinalScoreboard;
