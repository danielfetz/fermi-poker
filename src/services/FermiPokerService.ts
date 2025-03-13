// src/services/FermiPokerService.ts
import { supabase } from '../supabaseClient';
import { 
  Game, 
  Question, 
  Player, 
  PlayerGuess, 
  Bet, 
  Hint,
  PlayerQuestionStatus,
  Prediction
} from '../components/FermiPoker/types';

/**
 * Create a new Fermi Poker game
 */
export const createGame = async (metaGameOn: boolean): Promise<Game> => {
  const { data, error } = await supabase.functions.invoke('create-game', {
    body: { meta_game_on: metaGameOn }
  });
  
  if (error) throw error;
  return data.data as Game;
};

/**
 * Add a question to a game
 */
export const addQuestion = async (
  gameId: number,
  questionText: string,
  correctAnswer: number,
  ante: number = 10,
  orderNum: number,
  hints: Array<{ hintOrder: number; hintText: string }>
): Promise<Question> => {
  const { data, error } = await supabase.functions.invoke('add-question', {
    body: {
      game_id: gameId,
      question_text: questionText,
      correct_answer: correctAnswer,
      ante,
      order_num: orderNum,
      hints
    }
  });
  
  if (error) throw error;
  return data.data as Question;
};

/**
 * Join a game as a player
 */
export const joinGame = async (
  gameId: number,
  sessionId: string,
  displayName: string
): Promise<Player> => {
  const { data, error } = await supabase.functions.invoke('join-game', {
    body: {
      game_id: gameId,
      session_id: sessionId,
      display_name: displayName
    }
  });
  
  if (error) throw error;
  return data.data as Player;
};

/**
 * Start a game
 */
export const startGame = async (gameId: number): Promise<{ 
  message: string; 
  questionId: number 
}> => {
  const { data, error } = await supabase.functions.invoke('start-game', {
    body: { game_id: gameId }
  });
  
  if (error) throw error;
  return data.data;
};

/**
 * Submit a guess for a question
 */
export const submitGuess = async (
  playerId: number,
  questionId: number,
  lowerBound: number,
  upperBound: number
): Promise<PlayerGuess> => {
  const { data, error } = await supabase.functions.invoke('submit-guess', {
    body: {
      player_id: playerId,
      question_id: questionId,
      lower_bound: lowerBound,
      upper_bound: upperBound
    }
  });
  
  if (error) throw error;
  return data.data as PlayerGuess;
};

/**
 * Submit a prediction for who will win a question (meta-game)
 */
export const submitPrediction = async (
  playerId: number,
  questionId: number,
  predictedWinnerPlayerId: number
): Promise<Prediction> => {
  const { data, error } = await supabase.functions.invoke('submit-prediction', {
    body: {
      player_id: playerId,
      question_id: questionId,
      predicted_winner_player_id: predictedWinnerPlayerId
    }
  });
  
  if (error) throw error;
  return data.data as Prediction;
};

/**
 * Submit a bet
 */
export const submitBet = async (
  playerId: number,
  questionId: number,
  roundNumber: number,
  action: 'call' | 'raise' | 'check' | 'fold',
  amount: number = 0
): Promise<Bet> => {
  const { data, error } = await supabase.functions.invoke('submit-bet', {
    body: {
      player_id: playerId,
      question_id: questionId,
      round_number: roundNumber,
      action,
      amount
    }
  });
  
  if (error) throw error;
  return data.data as Bet;
};

/**
 * Rejoin game as a bankrupt player with 3+ correct predictions
 */
export const rejoinBankruptPlayer = async (
  playerId: number
): Promise<Player> => {
  const { data, error } = await supabase.functions.invoke('rejoin-bankrupt-player', {
    body: { player_id: playerId }
  });
  
  if (error) throw error;
  return data.data as Player;
};

/**
 * Manually reveal and resolve a question (for admin/testing)
 */
export const revealAndResolveQuestion = async (
  questionId: number
): Promise<{
  message: string;
  winners: number[];
  potSize: number;
  winAmount: number;
  correctAnswer: number;
}> => {
  const { data, error } = await supabase.functions.invoke('reveal-and-resolve', {
    body: { question_id: questionId }
  });
  
  if (error) throw error;
  return data.data;
};

/**
 * Fetch a game by ID
 */
export const fetchGame = async (gameId: number): Promise<Game> => {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', gameId)
    .single();
    
  if (error) throw error;
  return data as Game;
};

/**
 * Fetch all players in a game
 */
export const fetchPlayers = async (gameId: number): Promise<Player[]> => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId);
    
  if (error) throw error;
  return data as Player[];
};

/**
 * Fetch current active question for a game
 */
export const fetchCurrentQuestion = async (gameId: number): Promise<Question | null> => {
  const { data, error } = await supabase
    .from('game_questions')
    .select('*')
    .eq('game_id', gameId)
    .not('status', 'eq', 'not_started')
    .order('order_num', { ascending: true })
    .limit(1)
    .maybeSingle();
    
  if (error) throw error;
  return data as Question | null;
};

/**
 * Fetch all player guesses for a question
 */
export const fetchPlayerGuesses = async (questionId: number): Promise<PlayerGuess[]> => {
  const { data, error } = await supabase
    .from('player_guesses')
    .select('*')
    .eq('question_id', questionId);
    
  if (error) throw error;
  return data as PlayerGuess[];
};

/**
 * Fetch hints for a question
 */
export const fetchHints = async (questionId: number): Promise<Hint[]> => {
  const { data, error } = await supabase
    .from('hints')
    .select('*')
    .eq('question_id', questionId)
    .order('hint_order', { ascending: true });
    
  if (error) throw error;
  return data as Hint[];
};

/**
 * Fetch bets for a question
 */
export const fetchBets = async (questionId: number): Promise<Bet[]> => {
  const { data, error } = await supabase
    .from('bets')
    .select('*')
    .eq('question_id', questionId)
    .order('timestamp', { ascending: true });
    
  if (error) throw error;
  return data as Bet[];
};

/**
 * Fetch player question statuses for a question
 */
export const fetchPlayerStatuses = async (questionId: number): Promise<PlayerQuestionStatus[]> => {
  const { data, error } = await supabase
    .from('player_question_status')
    .select('*')
    .eq('question_id', questionId);
    
  if (error) throw error;
  return data as PlayerQuestionStatus[];
};

/**
 * Fetch predictions for a question
 */
export const fetchPredictions = async (questionId: number): Promise<Prediction[]> => {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('question_id', questionId);
    
  if (error) throw error;
  return data as Prediction[];
};

/**
 * Set up realtime subscriptions for game updates
 */
export const setupGameSubscriptions = (
  gameId: number,
  callbacks: {
    onGameUpdate?: (game: Game) => void;
    onPlayerUpdate?: () => void;
    onQuestionUpdate?: (question: Question) => void;
    onHintRevealed?: (questionId: number) => void;
    onBetPlaced?: (questionId: number) => void;
    onPlayerStatusChanged?: (questionId: number) => void;
    onGuessSubmitted?: (questionId: number) => void;
  }
) => {
  const channel = supabase.channel(`game:${gameId}`);
  
  // Game updates
  if (callbacks.onGameUpdate) {
    channel.on('postgres_changes', { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'games',
      filter: `id=eq.${gameId}` 
    }, (payload) => {
      callbacks.onGameUpdate?.(payload.new as Game);
    });
  }

  // Player updates
  if (callbacks.onPlayerUpdate) {
    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'players',
      filter: `game_id=eq.${gameId}`
    }, () => {
      callbacks.onPlayerUpdate?.();
    });
  }

  // Question updates
  if (callbacks.onQuestionUpdate) {
    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'game_questions',
      filter: `game_id=eq.${gameId}`
    }, (payload) => {
      callbacks.onQuestionUpdate?.(payload.new as Question);
    });
  }

  // Hint reveals
  if (callbacks.onHintRevealed) {
    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'hints'
    }, (payload) => {
      const hint = payload.new as Hint;
      callbacks.onHintRevealed?.(hint.question_id);
    });
  }

  // Bet updates
  if (callbacks.onBetPlaced) {
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'bets'
    }, (payload) => {
      const bet = payload.new as Bet;
      callbacks.onBetPlaced?.(bet.question_id);
    });
  }

  // Player status updates
  if (callbacks.onPlayerStatusChanged) {
    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'player_question_status'
    }, (payload) => {
      const status = payload.new as PlayerQuestionStatus;
      callbacks.onPlayerStatusChanged?.(status.question_id);
    });
  }

  // Guess submissions
  if (callbacks.onGuessSubmitted) {
    channel.on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'player_guesses'
    }, (payload) => {
      const guess = payload.new as PlayerGuess;
      callbacks.onGuessSubmitted?.(guess.question_id);
    });
  }

  channel.subscribe();
  
  // Return unsubscribe function
  return () => {
    channel.unsubscribe();
  };
};
