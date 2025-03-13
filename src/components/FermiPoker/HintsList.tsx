// src/components/FermiPoker/HintsList.tsx
import React from 'react';
import { Hint } from './types';

interface HintsListProps {
  hints: Hint[];
}

const HintsList: React.FC<HintsListProps> = ({ hints }) => {
  if (hints.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="font-semibold mb-2">Hints</h3>
      <ul className="space-y-2">
        {hints.map((hint) => (
          <li key={hint.id} className="bg-yellow-50 p-3 rounded border border-yellow-200">
            <div className="text-sm text-gray-600 mb-1">
              Hint #{hint.hint_order} · Revealed {new Date(hint.revealed_at!).toLocaleTimeString()}
            </div>
            <div>{hint.hint_text}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default HintsList;
