// src/components/FermiPoker/FinalReveal.tsx
import React from 'react';
import { Question, PlayerGuess, Player, Bet } from './types';

interface FinalRevealProps {
  question: Question;
  playerGuesses: PlayerGuess[];
  players: Player[];
  bets: Bet[];
}

const FinalReveal: React.FC<FinalRevealProps> = ({
  question,
  playerGuesses,
  players,
  bets
}) => {
  if (!question.correct_answer) {
    return <div>Loading answer...</div>;
  }

  const correctAnswer = question.correct_answer;

  // Calculate pot size
  const potSize = bets.reduce((sum, bet) => sum + bet.amount, 0);

  // Calculate which guesses include the correct answer
  const validGuesses = playerGuesses.filter(
    guess => guess.lower_bound <= correctAnswer && guess.upper_bound >= correctAnswer
  );

  let winnerIds: number[] = [];
  let winReason = '';

  if (validGuesses.length > 0) {
    // Find narrowest range
    const rangeWidths = validGuesses.map(guess => ({
      playerId: guess.player_id,
      width: guess.upper_bound - guess.lower_bound
    }));
    
    const minWidth = Math.min(...rangeWidths.map(r => r.width));
    winnerIds = rangeWidths
      .filter(r => r.width === minWidth)
      .map(r => r.playerId);
    
    winReason = `narrowest range containing correct answer (${minWidth.toLocaleString()} units wide)`;
  } else {
    // No valid guesses, find closest median
    const medianDistances = playerGuesses.map(guess => ({
      playerId: guess.player_id,
      median: (guess.lower_bound + guess.upper_bound) / 2,
      distance: Math.abs((guess.lower_bound + guess.upper_bound) / 2 - correctAnswer)
    }));
    
    const minDistance = Math.min(...medianDistances.map(m => m.distance));
    winnerIds = medianDistances
      .filter(m => m.distance === minDistance)
      .map(m => m.playerId);
    
    winReason = `closest median to correct answer (${minDistance.toLocaleString()} units away)`;
  }

  // Get winner names
  const winnerNames = winnerIds.map(id => {
    const player = players.find(p => p.id === id);
    return player ? player.display_name : 'Unknown';
  });

  // Calculate winnings per player
  const winningsPerPlayer = potSize / winnerIds.length;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="text-center mb-4">
        <h3 className="text-2xl font-bold mb-1">The Answer Is:</h3>
        <div className="text-4xl font-bold mb-4 text-blue-600">
          {correctAnswer.toLocaleString()}
        </div>
        
        <div className="mb-2">
          <span className="font-semibold">Winner{winnerIds.length > 1 ? 's' : ''}:</span>{' '}
          {winnerNames.join(', ')}
        </div>
        
        <div className="text-sm text-gray-600 mb-3">
          Won with {winReason}
        </div>
        
        <div className="text-lg">
          <span className="font-semibold">Pot:</span> {potSize.toLocaleString()} chips
          {winnerIds.length > 1 && (
            <span className="text-sm text-gray-600">
              {' '}({winningsPerPlayer.toLocaleString()} per player)
            </span>
          )}
        </div>
      </div>

      <h4 className="font-semibold border-t pt-3 mb-2">All Guesses:</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-2 text-left">Player</th>
              <th className="p-2 text-right">Lower</th>
              <th className="p-2 text-right">Upper</th>
              <th className="p-2 text-right">Range Width</th>
              <th className="p-2 text-right">Median</th>
              <th className="p-2 text-center">Contains Answer?</th>
            </tr>
          </thead>
          <tbody>
            {playerGuesses.map((guess) => {
              const player = players.find(p => p.id === guess.player_id);
              const containsAnswer = guess.lower_bound <= correctAnswer && guess.upper_bound >= correctAnswer;
              const median = (guess.lower_bound + guess.upper_bound) / 2;
              const width = guess.upper_bound - guess.lower_bound;
              const isWinner = winnerIds.includes(guess.player_id);
              
              return (
                <tr 
                  key={guess.id} 
                  className={`border-t ${isWinner ? 'bg-green-50' : ''}`}
                >
                  <td className="p-2 font-medium">
                    {player?.display_name || 'Unknown'}
                    {isWinner && ' 🏆'}
                  </td>
                  <td className="p-2 text-right">{guess.lower_bound.toLocaleString()}</td>
                  <td className="p-2 text-right">{guess.upper_bound.toLocaleString()}</td>
                  <td className="p-2 text-right">{width.toLocaleString()}</td>
                  <td className="p-2 text-right">{median.toLocaleString()}</td>
                  <td className="p-2 text-center">
                    {containsAnswer ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FinalReveal;
