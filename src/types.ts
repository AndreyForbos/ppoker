export interface Player {
  id: string;
  name: string;
  vote: string | null;
}

export interface Issue {
  id: number;
  game_id: string;
  title: string;
  is_voting: boolean;
  votes_revealed: boolean;
}