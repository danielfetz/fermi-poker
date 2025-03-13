// src/components/FermiPoker/CreateGameForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient';

interface Question {
  questionText: string;
  correctAnswer: number;
  ante: number;
  orderNum: number;
  hints: Array<{
    hintOrder: number;
    hintText: string;
  }>;
}

const CreateGameForm: React.FC = () => {
  const navigate = useNavigate();
  const [metaGameOn, setMetaGameOn] = useState<boolean>(true);
  const [questions, setQuestions] = useState<Question[]>([
    {
      questionText: '',
      correctAnswer: 0,
      ante: 10,
      orderNum: 1,
      hints: [{ hintOrder: 1, hintText: '' }]
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleQuestionChange = (index: number, field: keyof Question, value: string | number | boolean) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const handleHintChange = (questionIndex: number, hintIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].hints[hintIndex].hintText = value;
    setQuestions(updatedQuestions);
  };

  const addHint = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    const newHintOrder = updatedQuestions[questionIndex].hints.length + 1;
    updatedQuestions[questionIndex].hints.push({
      hintOrder: newHintOrder,
      hintText: ''
    });
    setQuestions(updatedQuestions);
  };

  const removeHint = (questionIndex: number, hintIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].hints.splice(hintIndex, 1);
    
    // Re-number remaining hints
    updatedQuestions[questionIndex].hints.forEach((hint, idx) => {
      hint.hintOrder = idx + 1;
    });
    
    setQuestions(updatedQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        correctAnswer: 0,
        ante: 10,
        orderNum: questions.length + 1,
        hints: [{ hintOrder: 1, hintText: '' }]
      }
    ]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) {
      alert('You need at least one question');
      return;
    }
    
    const updatedQuestions = questions.filter((_, i) => i !== index);
    
    // Re-number remaining questions
    updatedQuestions.forEach((q, idx) => {
      q.orderNum = idx + 1;
    });
    
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        alert(`Question ${i + 1} text is required`);
        return;
      }
      if (q.correctAnswer <= 0) {
        alert(`Question ${i + 1} needs a valid correct answer`);
        return;
      }
      for (let j = 0; j < q.hints.length; j++) {
        if (!q.hints[j].hintText.trim()) {
          alert(`Hint ${j + 1} for Question ${i + 1} is required`);
          return;
        }
      }
    }
    
    setIsSubmitting(true);
    
    try {
      // Create game
      const { data: game, error: gameError } = await supabase.rpc('create_game', {
        meta_game_on: metaGameOn
      });
      
      if (gameError) throw gameError;
      
      // Add questions
      for (const question of questions) {
        const { data: newQuestion, error: questionError } = await supabase.rpc('add_question', {
          game_id: game.id,
          question_text: question.questionText,
          correct_answer: question.correctAnswer,
          ante: question.ante,
          order_num: question.orderNum
        });
        
        if (questionError) throw questionError;
        
        // Add hints for this question
        for (const hint of question.hints) {
          const { error: hintError } = await supabase.rpc('add_hint', {
            question_id: newQuestion.id,
            hint_order: hint.hintOrder,
            hint_text: hint.hintText
          });
          
          if (hintError) throw hintError;
        }
      }
      
      // Navigate to the game lobby
navigate(`/game/${game.id}`);
} catch (error: unknown) {
  console.error('Error creating game:', error);
  
  // TypeScript safe error handling
  if (error instanceof Error) {
    alert(`Error creating game: ${error.message}`);
  } else {
    alert(`Error creating game: ${String(error)}`);
  }
} finally {
  setIsSubmitting(false);
}

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Fermi Poker Game</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Game Settings</h2>
          
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={metaGameOn}
                onChange={(e) => setMetaGameOn(e.target.checked)}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">Enable Meta-Game</span>
            </label>
          </div>
          
          <p className="text-sm text-gray-600 mt-2">
            Meta-game allows bankrupt players to rejoin if they correctly predict 3 winners.
          </p>
        </div>
        
        {questions.map((question, questionIndex) => (
          <div key={questionIndex} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Question {questionIndex + 1}</h2>
              <button
                type="button"
                className="text-red-600 hover:text-red-800"
                onClick={() => removeQuestion(questionIndex)}
              >
                Remove
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={question.questionText}
                  onChange={(e) => handleQuestionChange(questionIndex, 'questionText', e.target.value)}
                  placeholder="e.g., How many cars were sold worldwide in 2023?"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correct Answer
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={question.correctAnswer}
                    onChange={(e) => handleQuestionChange(questionIndex, 'correctAnswer', Number(e.target.value))}
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ante (Chips)
                  </label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded"
                    value={question.ante}
                    onChange={(e) => handleQuestionChange(questionIndex, 'ante', Number(e.target.value))}
                    min="1"
                    required
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Hints
                  </label>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800"
                    onClick={() => addHint(questionIndex)}
                  >
                    + Add Hint
                  </button>
                </div>
                
                {question.hints.map((hint, hintIndex) => (
                  <div 
                    key={hintIndex} 
                    className="flex items-center space-x-2 mb-2"
                  >
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">
                        Hint #{hint.hintOrder}
                      </div>
                      <input
                        type="text"
                        className="w-full p-2 border rounded"
                        value={hint.hintText}
                        onChange={(e) => handleHintChange(questionIndex, hintIndex, e.target.value)}
                        placeholder={`Hint ${hint.hintOrder} for this question`}
                        required
                      />
                    </div>
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => removeHint(questionIndex, hintIndex)}
                      disabled={question.hints.length <= 1}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex justify-center">
          <button
            type="button"
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg"
            onClick={addQuestion}
          >
            + Add Another Question
          </button>
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Game...' : 'Create Game'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGameForm;
