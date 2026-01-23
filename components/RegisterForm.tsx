
import React, { useState, useEffect, useRef } from 'react';
import { MealType, MealEntry } from '../types';

interface RegisterFormProps {
  onSave: (entry: MealEntry) => void;
  existingEntries: MealEntry[];
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSave, existingEntries }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(MealType.Breakfast);
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | undefined>(undefined);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const existing = existingEntries.find(e => e.date === date && e.type === selectedMeal);
    if (existing) {
      setContent(existing.content);
      setImage(existing.image);
    } else {
      setContent('');
      setImage(undefined);
    }
  }, [date, selectedMeal, existingEntries]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar imagen para no saturar LocalStorage
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Calidad 0.7 para balance peso/calidad
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setImage(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const entry: MealEntry = {
      id: `${date}-${selectedMeal}`,
      date,
      type: selectedMeal,
      content: content.trim(),
      image,
      timestamp: Date.now()
    };
    
    onSave(entry);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const mealOptions = [
    { type: MealType.Breakfast, label: 'Desay.', icon: '☕' },
    { type: MealType.Lunch, label: 'Almuer.', icon: '🍲' },
    { type: MealType.Snack, label: 'Merien.', icon: '🥪' },
    { type: MealType.Dinner, label: 'Cena', icon: '🥗' },
    { type: MealType.Extras, label: 'Extra', icon: '🍎' }
  ];

  return (
    <div className="flex flex-col h-full space-y-4 py-1">
      <div className="bg-white shrink-0">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">
          Fecha
        </label>
        <input 
          type="date" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm font-semibold"
        />
      </div>

      <div className="grid grid-cols-5 gap-1.5 shrink-0">
        {mealOptions.map((option) => (
          <button
            key={option.type}
            type="button"
            onClick={() => setSelectedMeal(option.type)}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all border ${
              selectedMeal === option.type 
                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
            }`}
          >
            <span className="text-lg mb-0.5">{option.icon}</span>
            <span className="text-[9px] font-bold uppercase truncate w-full text-center">{option.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col flex-1 min-h-0 space-y-3">
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">{mealOptions.find(o => o.type === selectedMeal)?.icon}</span>
            <h3 className="text-base font-bold text-gray-800">
              Registrar {mealOptions.find(o => o.type === selectedMeal)?.label.replace('.', 'o')}
            </h3>
          </div>
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-full transition-all ${image ? 'text-blue-600 bg-blue-50' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {image && (
          <div className="relative w-full h-32 rounded-xl overflow-hidden group shrink-0 animate-in fade-in zoom-in duration-300">
            <img src={image} alt="Comida" className="w-full h-full object-cover" />
            <button 
              type="button"
              onClick={() => setImage(undefined)}
              className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`¿Qué comiste en tu ${selectedMeal}?`}
          className="w-full flex-1 p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-gray-700 resize-none text-sm leading-snug"
        />

        <button 
          type="submit"
          disabled={!content.trim()}
          className={`w-full py-3.5 rounded-xl font-bold text-base shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 shrink-0 ${
            showSuccess 
              ? 'bg-blue-500 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-200 disabled:shadow-none'
          }`}
        >
          {showSuccess ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              ¡Guardado!
            </>
          ) : (
            'Guardar Comida'
          )}
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
