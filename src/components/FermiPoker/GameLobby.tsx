// src/components/FermiPoker/GameLobby.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { Game, Player } from './types';

interface GameLobbyProps {
  gameId: number;
}

const GameLobby: React.FC<GameLobbyProps> = ({ gameId }) => {
  const navigate = useNavigate();
  const [game, setGame] = useState<Game | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [displayName, setDisplayName] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [playerId, setPlayerId] = useState<number | null>(null);

  useEffect(() => {
    // Set up subscription to game updates
    const subscription = supabase
      .channel(`game:${gameId}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'games',
        filter: `id=eq.${gameId}` 
      }, (payload) => {
        setGame(payload.new as Game);
        
        // If game starts, navigate to game play
        if (payload.new.status === 'active' && isJoined) {
          navigate(`/game/${gameId}/play`);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `game_id=eq.${gameId}`
      }, () => {
        fetchPlayers();
      })
      .subscribe();

    // Get initial game data
    fetchGame();
    fetchPlayers();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [gameId]);

  const fetchGame = async () => {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single();
      
    if (error) {
      console.error('Error fetching game:', error);
      return;
    }
    
    setGame(data);
  };

  const fetchPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', gameId);
      
    if (error) {
      console.error('Error fetching players:', error);
      return;
    }
    
    setPlayers(data);

    // Check if current session is joined
    const sessionId = localStorage.getItem('session_id');
    const currentPlayer = data.find(p => p.session_id === sessionId);
    
    if (currentPlayer) {
      setIsJoined(true);
      setPlayerId(currentPlayer.id);
      setDisplayName(currentPlayer.display_name);
    }
    
    // First player is host
    if (data.length > 0 && data[0].session_id === sessionId) {
      setIsHost(true);
    }
  };

  const handleJoinGame = async () => {
    const name = displayName.trim() || `Guest${Math.floor(Math.random() * 1000)}`;
    let sessionId = localStorage.getItem('session_id');
    
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('session_id', sessionId);
    }
    
    const { data, error } = await supabase.rpc('join_game', {
      game_id: gameId,
      session_id: sessionId,
      display_name: name
    });
    
    if (error) {
      console.error('Error joining game:', error);
      return;
    }
    
    setIsJoined(true);
    setPlayerId(data.id);
    fetchPlayers();
  };

  const handleStartGame = async () => {
    if (!isHost) return;
    
    const { error } = await supabase.rpc('start_game', {
      game_id: gameId
    });
    
    if (error) {
      console.error('Error starting game:', error);
    }
  };

  if (!game) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Fermi Poker Game Lobby</h1>
      <div className="mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Game #{gameId}</h2>
          <p className="mb-2">Status: {game.status}</p>
          <p>Meta-game: {game.meta_game_on ? 'Enabled' : 'Disabled'}</p>
        </div>
      </div>

      {!isJoined ? (
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">Join Game</h2>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Your name"
              className="flex-1 p-2 border rounded"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleJoinGame}
            >
              Join
            </button>
          </div>
        </div>
      ) : (
        <p className="mb-4 bg-green-100 p-2 rounded">
          You've joined as <strong>{displayName}</strong>
        </p>
      )}

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Players</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-right">Chips</th>
                <th className="py-2 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player) => (
                <tr key={player.id} className="border-t">
                  <td className="py-2 px-4">
                    {player.display_name}
                    {player.id === playerId && " (You)"}
                  </td>
                  <td className="py-2 px-4 text-right">{player.chips}</td>
                  <td className="py-2 px-4 text-center">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs ${
                        player.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : player.status === 'bankrupt'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {player.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isHost && game.status === 'waiting_for_players' && (
        <div className="mb-6">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleStartGame}
            disabled={players.length < 2}
          >
            Start Game
          </button>
          {players.length < 2 && (
            <p className="mt-2 text-sm text-red-500">
              Need at least 2 players to start
            </p>
          )}
        </div>
      )}

      <div className="bg-yellow-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Game Rules</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Each round, a numerical question will be revealed</li>
          <li>You'll have 60 seconds to submit a guess range</li>
          <li>Betting rounds follow poker rules</li>
          <li>You can fold without going bankrupt</li>
          <li>If your range includes the correct answer and is narrowest, you win</li>
          <li>If no range includes the answer, closest median wins</li>
          {game.meta_game_on && (
            <>
              <li>You can predict who will win each question</li>
              <li>If you go bankrupt but have 3 correct predictions, you can rejoin</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default GameLobby;
