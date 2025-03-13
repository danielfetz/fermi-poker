// src/components/FermiPoker/GamePlay.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../supabaseClient';
import { Game, Question, Player, PlayerQuestionStatus, PlayerGuess, Hint, Bet } from './types';
import GuessSubmission from './GuessSubmission';
import BettingControls from './BettingControls';
import PlayersList from './PlayersList';
import QuestionDisplay from './QuestionDisplay';
import HintsList from './HintsList';
import FinalReveal from './FinalReveal';

const GamePlay: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [playerStatuses, setPlayerStatuses] = useState<PlayerQuestionStatus[]>([]);
  const [hints, setHints] = useState<Hint[]>([]);
  const [playerGuesses, setPlayerGuesses] = useState<PlayerGuess[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [sessionId] = useState<string>(localStorage.getItem('session_id') || '');
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentPlayerStatus, setCurrentPlayerStatus] = useState<PlayerQuestionStatus | null>(null);
  const [currentPlayerGuess, setCurrentPlayerGuess] = useState<PlayerGuess | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isGuessingPhase, setIsGuessingPhase] = useState<boolean>(false);
  const [isFinalReveal, setIsFinalReveal] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!gameId) return;

      // Fetch game data
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', parseInt(gameId))
        .single();
        
      if (gameError) {
        console.error('Error fetching game:', gameError);
        return;
      }
      
      setGame(gameData);

      // Fetch current active question
      const { data: questionData, error: questionError } = await supabase
        .from('game_questions')
        .select('*')
        .eq('game_id', parseInt(gameId))
        .not('status', 'eq', 'not_started')
        .order('order_num', { ascending: true })
        .limit(1)
        .single();
        
      if (questionError) {
        console.error('Error fetching current question:', questionError);
        return;
      }
      
      setCurrentQuestion(questionData);
      
      if (questionData.status === 'guessing_phase') {
        setIsGuessingPhase(true);
        startGuessingTimer();
      } else if (questionData.status === 'final_reveal') {
        setIsFinalReveal(true);
      }

      // Fetch players
      fetchPlayers();
      
      // Fetch hints, guesses, bets, and player statuses
      if (questionData.id) {
        fetchQuestionData(questionData.id);
      }
    };

    fetchInitialData();
    
    // Set up real-time subscriptions
    const gameChannel = supabase.channel(`game-play-${gameId}`);
    
    gameChannel
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'games',
        filter: `id=eq.${gameId}` 
      }, (payload) => {
        setGame(payload.new as Game);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_questions',
        filter: `game_id=eq.${gameId}`
      }, (payload) => {
        const question = payload.new as Question;
        setCurrentQuestion(question);
        
        if (question.status === 'guessing_phase') {
          setIsGuessingPhase(true);
          setIsFinalReveal(false);
          startGuessingTimer();
        } else if (question.status === 'final_reveal') {
          setIsGuessingPhase(false);
          setIsFinalReveal(true);
        } else {
          setIsGuessingPhase(false);
        }
        
        fetchQuestionData(question.id);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `game_id=eq.${gameId}`
      }, () => {
        fetchPlayers();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'hints'
      }, () => {
        if (currentQuestion) {
          fetchHints(currentQuestion.id);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bets'
      }, () => {
        if (currentQuestion) {
          fetchBets(currentQuestion.id);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'player_question_status'
      }, () => {
        if (currentQuestion) {
          fetchPlayerStatuses(currentQuestion.id);
        }
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'player_guesses'
      }, () => {
        if (currentQuestion) {
          fetchPlayerGuesses(currentQuestion.id);
        }
      })
      .subscribe();
    
    return () => {
      gameChannel.unsubscribe();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameId]);

  useEffect(() => {
    // Update current player when players list changes
    if (players.length > 0 && sessionId) {
      const player = players.find(p => p.session_id === sessionId);
      if (player) {
        setCurrentPlayer(player);
      }
    }
  }, [players, sessionId]);

  useEffect(() => {
    // Update current player status when statuses change
    if (playerStatuses.length > 0 && currentPlayer) {
      const status = playerStatuses.find(s => s.player_id === currentPlayer.id);
      if (status) {
        setCurrentPlayerStatus(status);
      }
    }
  }, [playerStatuses, currentPlayer]);

  useEffect(() => {
    // Update current player guess when guesses change
    if (playerGuesses.length > 0 && currentPlayer) {
      const guess = playerGuesses.find(g => g.player_id === currentPlayer.id);
      if (guess) {
        setCurrentPlayerGuess(guess);
      }
    }
  }, [playerGuesses, currentPlayer]);

  const fetchPlayers = async () => {
    if (!gameId) return;
    
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('game_id', parseInt(gameId));
      
    if (error) {
      console.error('Error fetching players:', error);
      return;
    }
    
    setPlayers(data);
  };

  const fetchQuestionData = (questionId: number) => {
    fetchHints(questionId);
    fetchPlayerGuesses(questionId);
    fetchBets(questionId);
    fetchPlayerStatuses(questionId);
  };

  const fetchHints = async (questionId: number) => {
    const { data, error } = await supabase
      .from('hints')
      .select('*')
      .eq('question_id', questionId)
      .order('hint_order', { ascending: true });
      
    if (error) {
      console.error('Error fetching hints:', error);
      return;
    }
    
    setHints(data);
  };

  const fetchPlayerGuesses = async (questionId: number) => {
    const { data, error } = await supabase
      .from('player_guesses')
      .select('*')
      .eq('question_id', questionId);
      
    if (error) {
      console.error('Error fetching player guesses:', error);
      return;
    }
    
    setPlayerGuesses(data);
  };

  const fetchBets = async (questionId: number) => {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('question_id', questionId)
      .order('timestamp', { ascending: true });
      
    if (error) {
      console.error('Error fetching bets:', error);
      return;
    }
    
    setBets(data);
  };

  const fetchPlayerStatuses = async (questionId: number) => {
    const { data, error } = await supabase
      .from('player_question_status')
      .select('*')
      .eq('question_id', questionId);
      
    if (error) {
      console.error('Error fetching player statuses:', error);
      return;
    }
    
    setPlayerStatuses(data);
  };

  const startGuessingTimer = () => {
    setTimeLeft(60);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmitGuess = async (lowerBound: number, upperBound: number) => {
    if (!currentPlayer || !currentQuestion) return;
    
    try {
      const { error } = await supabase.rpc('submit_guess', {
        player_id: currentPlayer.id,
        question_id: currentQuestion.id,
        lower_bound: lowerBound,
        upper_bound: upperBound
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error submitting guess:', error);
    }
  };

  const handleSubmitBet = async (action: 'call' | 'raise' | 'check' | 'fold', amount: number = 0) => {
    if (!currentPlayer || !currentQuestion) return;
    
    const roundNumber = currentQuestion.status === 'betting_round_1' ? 1 :
                         currentQuestion.status === 'betting_round_2' ? 2 :
                         currentQuestion.status === 'betting_round_3' ? 3 : 0;
    
    if (roundNumber === 0) return;
    
    try {
      const { error } = await supabase.rpc('submit_bet', {
        player_id: currentPlayer.id,
        question_id: currentQuestion.id,
        round_number: roundNumber,
        action,
        amount
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error submitting bet:', error);
    }
  };

  const handleSubmitPrediction = async (predictedWinnerId: number) => {
    if (!currentPlayer || !currentQuestion || !game?.meta_game_on) return;
    
    try {
      const { error } = await supabase.rpc('submit_prediction', {
        player_id: currentPlayer.id,
        question_id: currentQuestion.id,
        predicted_winner_player_id: predictedWinnerId
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error submitting prediction:', error);
    }
  };

  const handleRejoin = async () => {
    if (!currentPlayer) return;
    
    try {
      const { error } = await supabase.rpc('rejoin_bankrupt_player', {
        player_id: currentPlayer.id
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error rejoining game:', error);
    }
  };

  const calculatePotSize = () => {
    return bets.reduce((sum, bet) => sum + bet.amount, 0);
  };

  const getCurrentBettingRound = () => {
    if (!currentQuestion) return 0;
    
    if (currentQuestion.status === 'betting_round_1') return 1;
    if (currentQuestion.status === 'betting_round_2') return 2;
    if (currentQuestion.status === 'betting_round_3') return 3;
    return 0;
  };

  const getCurrentHighestBet = () => {
    const currentRound = getCurrentBettingRound();
    if (currentRound === 0) return 0;
    
    const roundBets = bets.filter(bet => bet.round_number === currentRound);
    return Math.max(...roundBets.map(bet => bet.amount), 0);
  };

  if (!game || !currentQuestion) {
    return <div className="text-center p-8">Loading game...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left column - Players and Info */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h2 className="text-xl font-bold mb-2">Game #{gameId}</h2>
            <p className="text-sm text-gray-600 mb-1">Status: {game.status}</p>
            <p className="text-sm text-gray-600">
              Meta-game: {game.meta_game_on ? 'Enabled' : 'Disabled'}
            </p>
          </div>
          
          <PlayersList 
            players={players}
            playerStatuses={playerStatuses}
            currentQuestionId={currentQuestion.id}
            currentPlayerId={currentPlayer?.id || 0}
          />
          
          {game.meta_game_on && currentPlayer?.status === 'bankrupt' && 
           currentPlayer.correct_preds >= 3 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
              <h3 className="font-semibold mb-2">You can rejoin!</h3>
              <p className="text-sm mb-2">
                You have {currentPlayer.correct_preds} correct predictions. 
                You can rejoin with 50 chips.
              </p>
              <button
                className="bg-green-500 text-white px-3 py-1 rounded"
                onClick={handleRejoin}
              >
                Rejoin Game
              </button>
            </div>
          )}
        </div>
        
        {/* Middle column - Current Question */}
        <div className="md:col-span-2">
          <QuestionDisplay 
            question={currentQuestion} 
            timeLeft={isGuessingPhase ? timeLeft : 0}
          />
          
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="font-semibold mb-2">
              Current Pot: {calculatePotSize()} chips
            </h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Question: {currentQuestion.order_num}</div>
              <div>Ante: {currentQuestion.ante} chips</div>
              <div>
                Phase: {
                  currentQuestion.status === 'guessing_phase' ? 'Guessing' :
                  currentQuestion.status === 'betting_round_1' ? 'Betting Round 1' :
                  currentQuestion.status === 'betting_round_2' ? 'Betting Round 2' :
                  currentQuestion.status === 'betting_round_3' ? 'Betting Round 3' :
                  currentQuestion.status === 'final_reveal' ? 'Final Reveal' : 
                  'Unknown'
                }
              </div>
              <div>
                Highest Bet: {getCurrentHighestBet()} chips
              </div>
            </div>
          </div>
          
          {hints.filter(h => h.revealed_at).length > 0 && (
            <HintsList hints={hints.filter(h => h.revealed_at)} />
          )}
          
          {/* Conditionally show appropriate controls based on game state */}
          {currentPlayer && currentPlayer.status === 'active' && (
            <>
              {isGuessingPhase && !currentPlayerGuess?.final && (
                <GuessSubmission 
                  onSubmit={handleSubmitGuess}
                  metaGameEnabled={game.meta_game_on}
                  players={players}
                  onSubmitPrediction={handleSubmitPrediction}
                />
              )}
              
              {!isGuessingPhase && !isFinalReveal && 
               currentPlayerStatus?.status === 'active_for_question' && (
                <BettingControls
                  currentChips={currentPlayer.chips}
                  currentBet={getCurrentHighestBet()}
                  onSubmitBet={handleSubmitBet}
                />
              )}
            </>
          )}
          
          {isFinalReveal && (
            <FinalReveal
              question={currentQuestion}
              playerGuesses={playerGuesses}
              players={players}
              bets={bets}
            />
          )}
          
          <div className="bg-white rounded-lg shadow p-4 mt-4">
            <h3 className="font-semibold mb-2">Betting History</h3>
            <div className="max-h-60 overflow-y-auto">
              {bets.length === 0 ? (
                <p className="text-gray-500 text-sm">No bets yet</p>
              ) : (
                <ul className="space-y-1 text-sm">
                  {bets.map(bet => {
                    const player = players.find(p => p.id === bet.player_id);
                    return (
                      <li key={bet.id} className="flex items-center justify-between">
                        <span>
                          <strong>{player?.display_name || 'Unknown'}</strong>: {bet.action}
                          {(bet.action === 'raise' || bet.action === 'call' || bet.action === 'ante') && 
                           ` ${bet.amount} chips`}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(bet.timestamp).toLocaleTimeString()}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
