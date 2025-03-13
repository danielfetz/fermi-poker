// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateGamePage from './pages/CreateGamePage';
import GameLobbyPage from './pages/GameLobbyPage';
import GamePlayPage from './pages/GamePlayPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateGamePage />} />
          <Route path="/game/:gameId" element={<GameLobbyPage />} />
          <Route path="/game/:gameId/play" element={<GamePlayPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
