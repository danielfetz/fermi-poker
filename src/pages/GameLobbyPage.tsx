// src/pages/GameLobbyPage.tsx
import React from 'react';
import { useParams } from 'react-router-dom';
import GameLobby from '../components/FermiPoker/GameLobby';

const GameLobbyPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  
  if (!gameId) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-2xl font-bold">Invalid Game ID</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <GameLobby gameId={Number(gameId)} />
    </div>
  );
};

export default GameLobbyPage;
