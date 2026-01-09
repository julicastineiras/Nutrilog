
import React, { useState, useEffect } from 'react';
import { MealType, MealEntry } from '../types';

interface RegisterFormProps {
  onSave: (entry: MealEntry) => void;
  existingEntries: MealEntry[];
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSave, existingEntries }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedMeal, setSelectedMeal] = useState<MealType>(MealType.Breakfast);
  const [content, setContent] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-fill content if it exists for the selected date and meal
  useEffect(() => {
    const existing = existingEntries.find(e => e.date === date && e.type === selectedMeal);
    setContent(existing ? existing.content : '');
  }, [date, selectedMeal, existingEntries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const entry: MealEntry = {
      id: `${date}-${selectedMeal}`,
      date,
      type: selectedMeal,
      content: content.trim(),
      timestamp: Date.now()
    };
    
    onSave(entry);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  const mealOptions = [
    { type: MealType.Breakfast, label: 'Desayuno', icon: '☕' },
    { type: MealType.Lunch, label: 'Almuerzo', icon: '🍲' },
    { type: MealType.Snack, label: 'Merienda', icon: '🥪' },
    { type: MealType.Dinner, label: 'Cena', icon: '🥗' },
    { type: MealType.Extras, label: 'Extras', icon: '🍎' }
  ];

  return (
    <div className="space-y-6 py-2">
      <div className="bg-white">
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
          Fecha
        </label>
        <input 
          type="date" 
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg font-medium"
        />
      </div>

      <div className="grid grid-cols-5 gap-2">
        {mealOptions.map((option) => (
          <button
            key={option.type}
            onClick={() => setSelectedMeal(option.type)}
            className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all border ${
              selectedMeal === option.type 
                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm' 
                : 'bg-white border-gray-100 text-gray-400 hover:bg-gray-50'
            }`}
          >
            <span className="text-xl mb-1">{option.icon}</span>
            <span className="text-[10px] font-bold uppercase truncate w-full text-center">{option.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{mealOptions.find(o => o.type === selectedMeal)?.icon}</span>
          <h3 className="text-lg font-bold text-gray-800">Registrar {mealOptions.find(o => o.type === selectedMeal)?.label}</h3>
        </div>
        
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`¿Qué comiste en tu ${selectedMeal}?`}
          rows={5}
          className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 text-gray-700 resize-none text-lg"
        />

        <button 
          type="submit"
          disabled={!content.trim()}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 ${
            showSuccess 
              ? 'bg-blue-500 text-white' 
              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-200 disabled:shadow-none'
          }`}
        >
          {showSuccess ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
              ¡Guardado!
            </>
          ) : (
            'Guardar Comida'
          )}
        </button>
      </form>
      
      <p className="text-center text-xs text-gray-400">
        Cada comida se guarda individualmente en tu historial.
      </p>
    </div>
  );
};

export default RegisterForm;
