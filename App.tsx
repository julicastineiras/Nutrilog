
import React, { useState, useEffect } from 'react';
import { MealEntry, TabType } from './types';
import Header from './components/Header';
import Navigation from './components/Navigation';
import RegisterForm from './components/RegisterForm';
import HistoryView from './components/HistoryView';
import AIInsights from './components/AIInsights';
import { getEntries, saveEntry, deleteEntry, deleteDayEntries } from './services/storage';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('register');
  const [entries, setEntries] = useState<MealEntry[]>([]);

  useEffect(() => {
    setEntries(getEntries());
  }, []);

  const handleSaveEntry = (entry: MealEntry) => {
    saveEntry(entry);
    setEntries(getEntries());
  };

  const handleDeleteEntry = (id: string) => {
    deleteEntry(id);
    setEntries(getEntries());
  };

  const handleDeleteDay = (date: string) => {
    if (confirm(`¿Estás seguro de eliminar todo el día ${date}?`)) {
      deleteDayEntries(date);
      setEntries(getEntries());
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-md mx-auto bg-white shadow-xl relative pb-20">
      <Header />
      
      <main className="flex-1 overflow-y-auto p-4">
        {activeTab === 'register' && (
          <RegisterForm onSave={handleSaveEntry} existingEntries={entries} />
        )}
        
        {activeTab === 'history' && (
          <HistoryView entries={entries} onDeleteEntry={handleDeleteEntry} onDeleteDay={handleDeleteDay} />
        )}

        {activeTab === 'insights' && (
          <AIInsights entries={entries} />
        )}
      </main>

      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
