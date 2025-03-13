// src/components/FermiPoker/PlayersList.tsx
import React from 'react';
import { Player, PlayerQuestionStatus } from './types';

interface PlayersListProps {
  players: Player[];
  playerStatuses: PlayerQuestionStatus[];
  currentQuestionId: number;
  currentPlayerId: number;
}

const PlayersList: React.FC<PlayersListProps> = ({
  players,
  playerStatuses,
  currentQuestionId,
  currentPlayerId
}) => {
  // Get status for a specific player in current question
  const getPlayerQuestionStatus = (playerId: number) => {
    const status = playerStatuses.find(
      s => s.player_id === playerId && s.question_id === currentQuestionId
    );
    return status ? status.status : 'unknown';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <h2 className="font-semibold">Players</h2>
      </div>
      <ul>
        {players.map((player) => {
          const questionStatus = getPlayerQuestionStatus(player.id);
          const isCurrentPlayer = player.id === currentPlayerId;
          
          return (
            <li 
              key={player.id} 
              className={`p-3 border-b border-gray-100 last:border-0 ${
                isCurrentPlayer ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">
                    {player.display_name}
                    {isCurrentPlayer && " (You)"}
                  </span>
                  
                  {/* Player status badges */}
                  <div className="flex mt-1 space-x-1">
                    {/* Game status badge */}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        player.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : player.status === 'bankrupt'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {player.status}
                    </span>
                    
                    {/* Question status badge - only show if folded/busted */}
                    {questionStatus === 'folded_for_question' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">
                        folded
                      </span>
                    )}
                    {questionStatus === 'busted_this_question' && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                        busted
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-semibold">{player.chips}</div>
                  <div className="text-xs text-gray-500">
                    {player.correct_preds > 0 && `${player.correct_preds} correct`}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PlayersList;
