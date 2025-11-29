export type Language = 'en' | 'az' | 'ru';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface PlaceResult {
  title: string;
  address: string;
  uri?: string;
  type?: 'verified' | 'google';
  coordinates?: {
    lat: number;
    lng: number;
  };
  category?: 'plastic' | 'glass' | 'paper' | 'electronics' | 'battery' | 'general' | 'clothing';
}

export interface EcoEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  type: 'cleanup' | 'workshop' | 'market' | 'seminar';
}

export interface SurveyResponse {
  id: number;
  age: number;
  city: string;
  educationLevel: string;
  sortsWaste: boolean;
  knowsRecyclingPoints: boolean;
  participatedInCleanups: boolean;
  mainBarrier: string;
  caresAboutEcology: number; // 1-5
  usesPlastic: string;
}

export enum ViewState {
  HOME = 'HOME',
  FINDER = 'FINDER',
  EVENTS = 'EVENTS',
  ABOUT = 'ABOUT',
  PROFILE = 'PROFILE'
}