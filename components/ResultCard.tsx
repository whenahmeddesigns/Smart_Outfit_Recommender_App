import React, { useState } from 'react';
import { OutfitRecommendation, UserInput, WeatherData } from '../types';
import { CloudRain, Sun, Cloud, Shirt, Footprints, Palette, Sparkles, Wind, Camera, Utensils, User, AlertCircle } from 'lucide-react';
import { generateOutfitImage } from '../services/geminiService';

interface ResultCardProps {
  weather: WeatherData;
  recommendation: OutfitRecommendation;
  userInput: UserInput;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ weather, recommendation, userInput, onReset }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGeneratingImg, setIsGeneratingImg] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);
  
  // Helper to choose weather icon
  const WeatherIcon = () => {
    const code = weather.weatherCode;
    if (code === 0 || code === 1) return <Sun className="text-yellow-500 w-16 h-16" />;
    if (code > 50) return <CloudRain className="text-blue-500 w-16 h-16" />;
    return <Cloud className="text-gray-400 w-16 h-16" />;
  };

  const handleGenerateImage = async () => {
    setIsGeneratingImg(true);
    setImgError(null);
    setImageUrl(null);
    
    const result = await generateOutfitImage(userInput, weather, recommendation);
    
    if (result.url) {
      setImageUrl(result.url);
    } else {
      setImgError(result.error || "Failed to generate image.");
    }
    
    setIsGeneratingImg(false);
  };

  return (
    <div className="w-full max-w-5xl animate-fade-in-up flex flex-col md:flex-row gap-6">
      
      {/* Main Info Column */}
      <div className="flex-1 space-y-6">
        {/* Weather Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 border border-gray-100 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-2xl shadow-inner">
              <WeatherIcon />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{userInput.city}</h1>
              <p className="text-gray-500 font-medium capitalize flex items-center gap-2">
                {weather.description}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-gray-800 tracking-tight">
               {Math.round(weather.temperature)}°
            </div>
          </div>
        </div>

        {/* Recommendation Content */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-xl">
          <div className="mb-6">
            <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold tracking-wider uppercase mb-3">
              AI Stylist Says
            </span>
            <h2 className="text-2xl font-bold text-gray-800 leading-tight">
              "{recommendation.headline}"
            </h2>
            <p className="text-gray-600 mt-3 text-sm leading-relaxed">
              {recommendation.reasoning}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 bg-orange-50/50 rounded-xl border border-orange-100">
              <div className="p-2 bg-white rounded-full text-orange-600 shadow-sm"><Shirt size={18} /></div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Top</h3>
                <p className="text-sm text-gray-600">{recommendation.top}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="p-2 bg-white rounded-full text-blue-600 shadow-sm"><Wind size={18} /></div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Bottom</h3>
                <p className="text-sm text-gray-600">{recommendation.bottom}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
              <div className="p-2 bg-white rounded-full text-purple-600 shadow-sm"><Footprints size={18} /></div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm">Footwear</h3>
                <p className="text-sm text-gray-600">{recommendation.footwear}</p>
              </div>
            </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-pink-50/50 rounded-xl border border-pink-100">
                   <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-white rounded-full text-pink-600 shadow-sm"><Sparkles size={16} /></div>
                      <h3 className="font-bold text-gray-800 text-sm">Accessories</h3>
                   </div>
                   <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside marker:text-pink-400">
                    {recommendation.accessories.map((acc, idx) => (
                      <li key={idx}>{acc}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-green-50/50 rounded-xl border border-green-100">
                   <div className="flex items-center gap-2 mb-2">
                      <div className="p-1.5 bg-white rounded-full text-green-600 shadow-sm"><Utensils size={16} /></div>
                      <h3 className="font-bold text-gray-800 text-sm">Carry On Food</h3>
                   </div>
                   <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside marker:text-green-400">
                    {recommendation.foodItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
             </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
              <Palette size={14} />
              <span>Palette: <span className="text-gray-800">{recommendation.colorPalette}</span></span>
            </div>
            <button onClick={onReset} className="text-sm font-semibold text-gray-900 underline decoration-gray-300 underline-offset-4 hover:decoration-gray-900 transition-all">
              New Search
            </button>
          </div>
        </div>
      </div>

      {/* Visualizer Column */}
      <div className="w-full md:w-80 flex flex-col gap-4">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-xl h-full flex flex-col items-center justify-center text-center">
            {!imageUrl ? (
              <>
                <div className="w-full aspect-[3/4] bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6 mb-6 relative overflow-hidden">
                  {userInput.userImage && (
                    <div className="absolute inset-0 opacity-20">
                      <img src={userInput.userImage} className="w-full h-full object-cover" alt="User reference" />
                    </div>
                  )}
                  <div className={`w-16 h-16 ${imgError ? 'bg-red-50 text-red-500' : 'bg-indigo-50 text-indigo-500'} rounded-full flex items-center justify-center mb-4 z-10 relative transition-colors`}>
                    {isGeneratingImg ? 
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div> : 
                      (imgError ? <AlertCircle size={32} /> : (userInput.userImage ? <User size={32} /> : <Camera size={32} />))
                    }
                  </div>
                  <h3 className="font-bold text-gray-800 mb-2 z-10 relative">
                    {userInput.userImage ? "Try On Look" : "AI Visualizer"}
                  </h3>
                  <p className="text-xs text-gray-500 z-10 relative px-2">
                    {imgError ? 
                      <span className="text-red-500 font-medium">{imgError}</span> :
                      (isGeneratingImg ? "Designing your look..." : 
                        (userInput.userImage ? "Generate an image of YOU wearing this exact outfit." : "Generate an AI image of this outfit on a model.")
                      )
                    }
                  </p>
                </div>
                <button 
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImg}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95 disabled:opacity-70 disabled:grayscale"
                >
                   {isGeneratingImg ? "Generating..." : (userInput.userImage ? "Visualize on Me" : "Visualize Look")}
                </button>
              </>
            ) : (
              <div className="w-full h-full flex flex-col">
                 <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-lg mb-4 group">
                    <img src={imageUrl} alt="AI Outfit Visualization" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all"></div>
                 </div>
                 <button 
                  onClick={() => setImageUrl(null)}
                  className="mt-auto w-full py-2 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors"
                >
                   Generate New
                </button>
              </div>
            )}
        </div>
      </div>

    </div>
  );
};