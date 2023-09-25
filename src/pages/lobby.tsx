import React from 'react';
import LobbyView from '../../src/components/LobbyView';

interface LobbyProps {
  socket: WebSocket | null;
}

const Lobby: React.FC<LobbyProps> = ({ socket }) => {
  return (
    <div>
      <LobbyView socket={socket} />
    </div>
  );
};

export default Lobby;
