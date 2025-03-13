// src/components/FermiPoker/BettingControls.tsx
import React, { useState } from 'react';

interface BettingControlsProps {
  currentChips: number;
  currentBet: number;
  onSubmitBet: (action: 'call' | 'raise' | 'check' | 'fold', amount?: number) => void;
}

const BettingControls: React.FC<BettingControlsProps> = ({
  currentChips,
  currentBet,
  onSubmitBet
}) => {
  const [raiseAmount, setRaiseAmount] = useState<number>(currentBet > 0 ? currentBet * 2 : 20);

  const handleCheck = () => {
    if (currentBet > 0) {
      alert("You cannot check when there is an active bet. You must call, raise, or fold.");
      return;
    }
    onSubmitBet('check');
  };

  const handleCall = () => {
    if (currentBet === 0) {
      alert("There is no bet to call. You can check instead.");
      return;
    }
    
    if (currentChips < currentBet) {
      alert("You don't have enough chips to call.");
      return;
    }
    
    onSubmitBet('call', currentBet);
  };

  const handleRaise = () => {
    if (raiseAmount <= currentBet) {
      alert("Your raise must be higher than the current bet.");
      return;
    }
    
    if (currentChips < raiseAmount) {
      alert("You don't have enough chips for this raise.");
      return;
    }
    
    onSubmitBet('raise', raiseAmount);
  };

  const handleFold = () => {
    onSubmitBet('fold');
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="font-semibold mb-3">Your Turn</h3>
      
      <div className="flex flex-col space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span>Your Chips: {currentChips}</span>
          <span>Current Bet: {currentBet}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          className={`py-2 px-4 rounded ${
            currentBet > 0 ? 'bg-gray-300 text-gray-700' : 'bg-blue-500 text-white'
          }`}
          onClick={handleCheck}
          disabled={currentBet > 0}
        >
          Check
        </button>
        
        <button
          className={`py-2 px-4 rounded ${
            currentBet === 0 || currentChips < currentBet
              ? 'bg-gray-300 text-gray-700'
              : 'bg-blue-500 text-white'
          }`}
          onClick={handleCall}
          disabled={currentBet === 0 || currentChips < currentBet}
        >
          Call {currentBet}
        </button>
      </div>
      
      <div className="mb-4">
        <div className="flex space-x-2 mb-2">
          <input
            type="number"
            className="flex-1 p-2 border rounded"
            value={raiseAmount}
            onChange={(e) => setRaiseAmount(Number(e.target.value))}
            min={currentBet > 0 ? currentBet * 2 : 20}
            max={currentChips}
            step={10}
          />
          <button
            className={`py-2 px-4 rounded ${
              raiseAmount <= currentBet || currentChips < raiseAmount
                ? 'bg-gray-300 text-gray-700'
                : 'bg-green-500 text-white'
            }`}
            onClick={handleRaise}
            disabled={raiseAmount <= currentBet || currentChips < raiseAmount}
          >
            Raise
          </button>
        </div>
      </div>
      
      <button
        className="w-full py-2 px-4 bg-red-500 text-white rounded"
        onClick={handleFold}
      >
        Fold
      </button>
    </div>
  );
};

export default BettingControls;
