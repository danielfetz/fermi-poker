// src/components/FermiPoker/QuestionDisplay.tsx
import React from 'react';
import { Question } from './types';

interface QuestionDisplayProps {
  question: Question;
  timeLeft: number;
}

const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ question, timeLeft }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="mb-2 flex justify-between items-center">
        <span className="text-sm text-gray-500">Question #{question.order_num}</span>
        
        {timeLeft > 0 && (
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {timeLeft}s left to guess
          </div>
        )}
      </div>
      
      <h2 className="text-xl font-bold">{question.question_text}</h2>
      
      <div className="mt-2 text-sm text-gray-600">
        {question.status === 'guessing_phase' && 'Submit your range guess'}
        {question.status === 'betting_round_1' && 'Betting Round 1'}
        {question.status === 'betting_round_2' && 'Betting Round 2'}
        {question.status === 'betting_round_3' && 'Betting Round 3'}
        {question.status === 'final_reveal' && 'Final Answer Revealed'}
      </div>
    </div>
  );
};

export default QuestionDisplay;
