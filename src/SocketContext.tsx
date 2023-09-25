import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SocketProviderProps {
  children: ReactNode;
}

const SocketContext = createContext<WebSocket | null>(null);

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const socketUrl = 'wss://trivia.tallerdeintegracion.cl/connect';
    const newSocket = new WebSocket(socketUrl);

    newSocket.onopen = () => {
      console.log('Conexión WebSocket abierta');
      // Resto de la configuración y eventos del socket
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error('useSocket debe usarse dentro de un SocketProvider');
  }
  return socket;
};
