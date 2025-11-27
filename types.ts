export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
  OTHERS = 'Others'
}

export interface UserInput {
  city: string;
  age: number;
  gender: Gender;
  userImage?: string;
}

export interface WeatherData {
  temperature: number;
  weatherCode: number;
  isDay: number;
  description: string;
}

export interface OutfitRecommendation {
  headline: string;
  top: string;
  bottom: string;
  footwear: string;
  accessories: string[];
  foodItems: string[];
  reasoning: string;
  colorPalette: string;
}

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
}