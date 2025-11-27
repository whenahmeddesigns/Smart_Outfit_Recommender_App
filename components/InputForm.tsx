import React, { useState } from 'react';
import { Gender, UserInput } from '../types';
import { MapPin, User, Calendar, Search, Upload, X } from 'lucide-react';

interface InputFormProps {
  onSubmit: (data: UserInput) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onSubmit, isLoading }) => {
  const [city, setCity] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [userImage, setUserImage] = useState<string | undefined>(undefined);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setUserImage(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city && age) {
      onSubmit({ city, age: parseInt(age), gender, userImage });
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl w-full max-w-md border border-white/50">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Style Parameters</h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Location Input */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <MapPin size={16} className="text-gray-900" /> Location
          </label>
          <input
            type="text"
            required
            placeholder="e.g. London, Tokyo"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all bg-white text-gray-900 placeholder-gray-500 font-medium shadow-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Age Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Calendar size={16} className="text-gray-900" /> Age
            </label>
            <input
              type="number"
              required
              min="1"
              max="120"
              placeholder="25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all bg-white text-gray-900 placeholder-gray-500 font-medium shadow-sm"
            />
          </div>

          {/* Gender Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <User size={16} className="text-gray-900" /> Gender
            </label>
            <div className="relative">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-all appearance-none bg-white text-gray-900 font-medium shadow-sm cursor-pointer"
              >
                {Object.values(Gender).map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-900">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
             <Upload size={16} className="text-gray-900" /> Your Photo (Optional)
          </label>
          
          {!userImage ? (
             <div className="relative group">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 font-medium flex items-center justify-center gap-2 group-hover:bg-gray-100 group-hover:border-gray-400 transition-colors">
                   <span className="text-sm">Click to upload a selfie for AI try-on</span>
                </div>
             </div>
          ) : (
             <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group">
                <img src={userImage} alt="User upload" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                <button 
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
                >
                   <X size={14} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 px-3 text-center backdrop-blur-sm">
                   Using this photo for visualization
                </div>
             </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Styling You...
            </>
          ) : (
            <>
              <Search size={20} />
              Get Recommendation
            </>
          )}
        </button>
      </form>
    </div>
  );
};