// src/pages/index.tsx
import { useRouter } from 'next/router';
import { useState } from 'react';

const Home = ({ socket }: { socket: WebSocket | null }) => {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [studentNumber, setStudentNumber] = useState('');

  const handleJoinClick = () => {
    if (!studentNumber) {
      alert('Por favor, ingrese un número de alumno antes de unirse a la trivia.');
      return;
    }

    const joinEvent = {
      type: 'join',
      id: studentNumber.toString(),
      username: username || studentNumber.toString(),
    };

    if (socket) {
      socket.send(JSON.stringify(joinEvent));

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'accepted') {
          console.log('Conexión aceptada');
          router.push('/lobby');
        } else if (data.type === 'denied') {
          console.log(`Conexión denegada: ${data.reason}`);
        }
      };

      socket.onclose = () => {
        console.log('Conexión WebSocket cerrada');
      };

      socket.onerror = (error) => {
        console.error('Error en la conexión WebSocket:', error);
      };
    }
  };

  return (
    <div>
      <h1>Dungeons & Trivia</h1>
      <input
        type="text"
        placeholder="Nombre de usuario"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="Número de alumno"
        value={studentNumber}
        onChange={(e) => setStudentNumber(e.target.value)}
      />
      <button onClick={handleJoinClick}>Unirse a la Trivia</button>
    </div>
  );
};

export default Home;
