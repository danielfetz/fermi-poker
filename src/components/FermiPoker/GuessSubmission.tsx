// src/components/FermiPoker/GuessSubmission.tsx
import React, { useState } from 'react';
import { Player } from './types';

interface GuessSubmissionProps {
  onSubmit: (lowerBound: number, upperBound: number) => void;
  metaGameEnabled: boolean;
  players: Player[];
  onSubmitPrediction: (predictedWinnerId: number) => void;
}

const GuessSubmission: React.FC<GuessSubmissionProps> = ({
  onSubmit,
  metaGameEnabled,
  players,
  onSubmitPrediction
}) => {
  const [lowerBound, setLowerBound] = useState<string>('');
  const [upperBound, setUpperBound] = useState<string>('');
  const [predictedWinnerId, setPredictedWinnerId] = useState<number>(0);
  const [predictionSubmitted, setPredictionSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const lower = parseInt(lowerBound);
    const upper = parseInt(upperBound);
    
    if (isNaN(lower) || isNaN(upper)) {
      alert('Please enter valid numbers for both bounds');
      return;
    }
    
    if (lower >= upper) {
      alert('Lower bound must be less than upper bound');
      return;
    }
    
    onSubmit(lower, upper);
  };

  const handleSubmitPrediction = () => {
    if (predictedWinnerId === 0) {
      alert('Please select a player');
      return;
    }
    
    onSubmitPrediction(predictedWinnerId);
    setPredictionSubmitted(true);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="font-semibold mb-2">Submit Your Guess</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lower Bound
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={lowerBound}
              onChange={(e) => setLowerBound(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upper Bound
            </label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={upperBound}
              onChange={(e) => setUpperBound(e.target.value)}
              required
            />
          </div>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
        >
          Submit Guess
        </button>
      </form>

      {metaGameEnabled && (
        <div className="mt-4 pt-4 border-t">
          <h3 className="font-semibold mb-2">Who do you think will win?</h3>
          <div className="flex space-x-2">
            <select
              className="flex-1 p-2 border rounded"
              value={predictedWinnerId}
              onChange={(e) => setPredictedWinnerId(parseInt(e.target.value))}
              disabled={predictionSubmitted}
            >
              <option value={0}>Select a player</option>
              {players
                .filter(p => p.status === 'active')
                .map(player => (
                  <option key={player.id} value={player.id}>
                    {player.display_name}
                  </option>
                ))}
            </select>
            <button
              className={`px-4 py-2 rounded ${
                predictionSubmitted
                  ? 'bg-gray-300 text-gray-700'
                  : 'bg-green-500 text-white'
              }`}
              onClick={handleSubmitPrediction}
              disabled={predictionSubmitted}
            >
              {predictionSubmitted ? 'Submitted' : 'Predict'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
