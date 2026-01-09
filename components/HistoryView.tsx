
import React, { useState } from 'react';
import { MealEntry, MealType } from '../types';
import { exportToCSV } from '../services/export';

interface HistoryViewProps {
  entries: MealEntry[];
  onDeleteEntry: (id: string) => void;
  onDeleteDay: (date: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ entries, onDeleteEntry, onDeleteDay }) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    setIsExporting(true);
    exportToCSV(entries);
    setTimeout(() => setIsExporting(false), 2000);
  };

  // Group entries by date
  const grouped: Record<string, Partial<Record<MealType, MealEntry>>> = {};
  entries.forEach(entry => {
    if (!grouped[entry.date]) grouped[entry.date] = {};
    grouped[entry.date][entry.type] = entry;
  });

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const mealOrder = [
    MealType.Breakfast,
    MealType.Lunch,
    MealType.Snack,
    MealType.Dinner,
    MealType.Extras
  ];

  const mealIcons: Record<MealType, string> = {
    [MealType.Breakfast]: '☕',
    [MealType.Lunch]: '🍲',
    [MealType.Snack]: '🥪',
    [MealType.Dinner]: '🥗',
    [MealType.Extras]: '🍎'
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="bg-gray-100 p-8 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-800">Historial vacío</h3>
        <p className="text-gray-500 max-w-xs mt-2">Empieza a registrar tus comidas una a una para completar tu planilla.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md py-2 z-10">
        <h2 className="text-xl font-bold text-gray-800">Mi Planilla</h2>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full font-bold text-sm shadow-md hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {isExporting ? 'Exportando...' : 'Exportar Excel'}
        </button>
      </div>

      <div className="space-y-8">
        {sortedDates.map(date => (
          <div key={date} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm relative">
            <div className="flex justify-between items-center mb-6 border-b border-gray-50 pb-3">
              <div>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">
                  {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long' })}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">
                  {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                </h3>
              </div>
              <button 
                onClick={() => onDeleteDay(date)}
                className="text-gray-300 hover:text-red-400 transition-colors"
                title="Eliminar todo el día"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {mealOrder.map(type => {
                const entry = grouped[date][type];
                return (
                  <div key={type} className="group relative">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 ${entry ? 'bg-blue-50' : 'bg-gray-50 text-gray-300'}`}>
                        {mealIcons[type]}
                      </div>
                      <div className="flex-1 min-w-0 border-b border-gray-50 pb-3 group-last:border-none">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">
                            {type}
                          </span>
                          {entry && (
                            <button 
                              onClick={() => onDeleteEntry(entry.id)}
                              className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all p-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          )}
                        </div>
                        {entry ? (
                          <p className="text-gray-700 text-sm font-medium leading-relaxed">{entry.content}</p>
                        ) : (
                          <p className="text-gray-300 text-xs italic">Vacío</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
