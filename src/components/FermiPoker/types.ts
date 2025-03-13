// src/components/FermiPoker/types.ts
export interface Game {
  id: number;
  created_at: string;
  meta_game_on: boolean;
  status: 'waiting_for_players' | 'active' | 'finished';
}

export interface Question {
  id: number;
  game_id: number;
  question_text: string;
  correct_answer?: number; // Only visible during final_reveal
  ante: number;
  status: 'not_started' | 'guessing_phase' | 'betting_round_1' | 'betting_round_2' | 'betting_round_3' | 'final_reveal';
  order_num: number;
}

export interface Player {
  id: number;
  game_id: number;
  session_id: string;
  display_name: string;
  chips: number;
  status: 'active' | 'bankrupt' | 'left_game';
  correct_preds: number;
}

export interface PlayerQuestionStatus {
  id: number;
  player_id: number;
  question_id: number;
  status: 'active_for_question' | 'folded_for_question' | 'busted_this_question';
}

export interface PlayerGuess {
  id: number;
  player_id: number;
  question_id: number;
  lower_bound: number;
  upper_bound: number;
  final: boolean;
}

export interface Bet {
  id: number;
  player_id: number;
  question_id: number;
  round_number: number;
  action: 'call' | 'raise' | 'check' | 'fold' | 'ante';
  amount: number;
  timestamp: string;
}

export interface Hint {
  id: number;
  question_id: number;
  hint_order: number;
  hint_text: string;
  revealed_at: string | null;
}

export interface Prediction {
  id: number;
  player_id: number;
  question_id: number;
  predicted_winner_player_id: number;
  is_correct: boolean | null;
}
