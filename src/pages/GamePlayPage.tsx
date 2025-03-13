// src/pages/GamePlayPage.tsx
import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import GamePlay from '../components/FermiPoker/GamePlay';

const GamePlayPage: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  
  if (!gameId) {
    return <Navigate to="/" />;
  }

  return (
    <div className="container mx-auto py-4">
      <GamePlay />
    </div>
  );
};

export default GamePlayPage;
