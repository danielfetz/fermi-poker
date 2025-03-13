// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Fermi Poker</h1>
          <p className="text-xl text-gray-600">
            A poker-like game based on numerical questions and range guessing.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">How to Play</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Game Concept</h3>
              <p>
                Fermi Poker is like poker, but instead of cards, players make guesses 
                about numerical questions.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Gameplay</h3>
              <ol className="list-decimal list-inside space-y-2 pl-4">
                <li>A numerical question is revealed (e.g., "How many cars were sold in 2023?")</li>
                <li>Players have 60 seconds to submit a range guess (lower and upper bound)</li>
                <li>Betting rounds occur, with hints revealed between rounds</li>
                <li>After all bets, the correct answer is revealed</li>
                <li>The pot goes to the player with the narrowest range that includes the correct answer</li>
                <li>If no one's range includes the answer, the player whose range median is closest wins</li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Multiple Questions</h3>
              <p>
                A game consists of multiple questions. Even if you fold or lose a question,
                you can continue playing in subsequent questions as long as you have chips.
              </p>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Meta-Game Option</h3>
              <p>
                In games with meta-game enabled, players can predict who will win each question.
                With 3 correct predictions, bankrupt players can rejoin the game with a small stack.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <Link
            to="/create"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-center"
          >
            Create a Game
          </Link>
          <Link
            to="/join"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg text-center"
          >
            Join with Code
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
