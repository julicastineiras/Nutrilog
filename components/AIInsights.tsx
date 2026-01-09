
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { MealEntry } from '../types';

interface AIInsightsProps {
  entries: MealEntry[];
}

const AIInsights: React.FC<AIInsightsProps> = ({ entries }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    if (entries.length === 0) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // We pass the last 15 meal entries for analysis
      const recentEntries = entries.slice(0, 15);
      
      const prompt = `
        Analiza mis registros de comidas recientes y bríndame un resumen amigable sobre mi alimentación.
        Identifica patrones positivos y sugiere 3 pequeñas mejoras saludables basadas en lo que he comido. 
        Mantenlo corto, motivador y estructurado. 
        Usa emojis. Responde en Español.
        
        Mis datos son:
        ${JSON.stringify(recentEntries)}
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setInsight(response.text || 'No se pudo generar el análisis.');
    } catch (error) {
      console.error(error);
      setInsight('Lo siento, hubo un error conectando con el nutricionista virtual.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight">Analítica IA</h2>
            <p className="text-blue-100 text-xs">Análisis basado en tus comidas</p>
          </div>
        </div>
        
        <button 
          onClick={generateInsight}
          disabled={loading || entries.length === 0}
          className="w-full bg-white text-blue-800 font-bold py-3 rounded-2xl shadow-lg hover:bg-blue-50 transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analizando tu dieta...
            </span>
          ) : 'Ver Feedback de Nutrición'}
        </button>
      </div>

      {insight && (
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="prose prose-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {insight}
          </div>
        </div>
      )}

      {entries.length === 0 && (
        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-3xl p-8 text-center">
          <p className="text-gray-400 text-sm">
            Registra al menos una comida para habilitar el análisis de inteligencia artificial.
          </p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
