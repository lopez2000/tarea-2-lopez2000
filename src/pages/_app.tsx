// src/pages/_app.tsx
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useState, useEffect } from 'react';

function App({ Component, pageProps }: AppProps) {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socketUrl = 'wss://trivia.tallerdeintegracion.cl/connect';
    const newSocket = new WebSocket(socketUrl);

    newSocket.onopen = () => {
      console.log('Conexión WebSocket abierta');
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <Component {...pageProps} socket={socket} />
  )
}

export default App;
