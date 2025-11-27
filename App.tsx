import React, { useState } from 'react';
import { InputForm } from './components/InputForm';
import { ResultCard } from './components/ResultCard';
import { UserInput, WeatherData, OutfitRecommendation } from './types';
import { fetchCoordinates, fetchWeather } from './services/weatherService';
import { generateOutfitRecommendation } from './services/geminiService';
import { Umbrella } from 'lucide-react';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<UserInput | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [recommendation, setRecommendation] = useState<OutfitRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (input: UserInput) => {
    setLoading(true);
    setError(null);
    setUserInput(input);

    try {
      // 1. Get Coordinates
      const coords = await fetchCoordinates(input.city);
      if (!coords) {
        throw new Error(`Could not find location: ${input.city}`);
      }

      // 2. Get Weather
      const weatherData = await fetchWeather(coords.latitude, coords.longitude);
      if (!weatherData) {
        throw new Error("Could not fetch weather data.");
      }
      setWeather(weatherData);

      // 3. Get Recommendation (Gemini)
      const rec = await generateOutfitRecommendation(input, weatherData);
      if (!rec) {
        throw new Error("Failed to generate AI recommendation. Please try again.");
      }
      setRecommendation(rec);

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setUserInput(null);
    setWeather(null);
    setRecommendation(null);
    setError(null);
  };

  // Determine background based on weather code
  const getBackgroundClass = () => {
    if (!weather) return "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500";
    
    // Rain
    if (weather.weatherCode >= 50 && weather.weatherCode <= 82) {
      return "bg-gradient-to-br from-slate-700 via-blue-800 to-gray-900";
    }
    // Sunny/Clear
    if (weather.weatherCode === 0 || weather.weatherCode === 1) {
      return "bg-gradient-to-br from-blue-400 via-sky-300 to-orange-200";
    }
    // Cloudy/Overcast
    return "bg-gradient-to-br from-gray-400 to-slate-300";
  };

  return (
    <div className={`min-h-screen transition-colors duration-1000 ${getBackgroundClass()} flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden`}>
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <header className="absolute top-0 w-full p-6 flex justify-between items-center text-white z-10">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Umbrella className="text-white/90" />
          <span>StyleCast</span>
        </div>
      </header>

      <main className="z-10 w-full flex flex-col items-center justify-center">
        {!recommendation && (
          <div className="mb-8 text-center text-white space-y-2 animate-fade-in-down">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Wear the <span className="text-indigo-200">Right</span> Look.
            </h1>
            <p className="text-lg text-white/80 max-w-lg mx-auto">
              Smart outfit recommendations powered by real-time weather data and Gemini AI.
            </p>
          </div>
        )}

        {error && (
           <div className="mb-6 bg-red-50/90 backdrop-blur text-red-600 px-6 py-4 rounded-xl shadow-lg border border-red-100 flex items-center gap-3 animate-pulse">
             <div className="bg-red-100 p-2 rounded-full">!</div>
             <p>{error}</p>
             <button onClick={() => setError(null)} className="ml-auto text-sm underline opacity-70 hover:opacity-100">Dismiss</button>
           </div>
        )}

        {!recommendation ? (
          <InputForm onSubmit={handleFormSubmit} isLoading={loading} />
        ) : (
          weather && userInput && (
            <ResultCard 
              weather={weather} 
              recommendation={recommendation} 
              userInput={userInput}
              onReset={handleReset} 
            />
          )
        )}
      </main>

      <footer className="absolute bottom-4 text-white/40 text-xs text-center z-10">
        Powered by Open-Meteo & Google Gemini 2.5 Flash
      </footer>
    </div>
  );
};

export default App;