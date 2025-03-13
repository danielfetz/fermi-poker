// src/pages/JoinGamePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const JoinGamePage: React.FC = () => {
  const navigate = useNavigate();
  const [gameId, setGameId] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gameId || isNaN(Number(gameId))) {
      alert('Please enter a valid game ID');
      return;
    }
    
    navigate(`/game/${gameId}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">Join a Game</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gameId">
              Game ID
            </label>
            <input
              id="gameId"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter game ID"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Join Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinGamePage;
