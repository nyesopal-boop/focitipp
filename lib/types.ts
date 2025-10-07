export interface HeadToHeadMatch {
  date: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  cornersHome: number | null;
  cornersAway: number | null;
  yellowHome: number | null;
  yellowAway: number | null;
}

export interface HeadToHeadResponse {
  matches: HeadToHeadMatch[];
  error?: string;
}

export interface TipsResponse {
  text: string;
  isPro?: boolean;
  error?: string;
}

export interface Team {
  id: number;
  name: string;
}

export interface SportsApiAdapter {
  searchTeam(name: string): Promise<Team | null>;
  getHeadToHead(teamId1: number, teamId2: number): Promise<HeadToHeadMatch[]>;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  subscription?: {
    status: string;
    currentPeriodEnd?: Date;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  subscription?: {
    status: string;
    currentPeriodEnd?: Date;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}