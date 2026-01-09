
import { MealEntry, MealType } from '../types';

export const exportToCSV = (entries: MealEntry[]) => {
  if (entries.length === 0) return;

  // Group entries by date
  const grouped: Record<string, Partial<Record<MealType, string>>> = {};
  
  entries.forEach(entry => {
    if (!grouped[entry.date]) grouped[entry.date] = {};
    grouped[entry.date][entry.type] = entry.content;
  });

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const headers = ['Fecha', 'Desayuno', 'Almuerzo', 'Merienda', 'Cena', 'Extras'];
  const rows = sortedDates.map(date => [
    date,
    grouped[date][MealType.Breakfast] || '',
    grouped[date][MealType.Lunch] || '',
    grouped[date][MealType.Snack] || '',
    grouped[date][MealType.Dinner] || '',
    grouped[date][MealType.Extras] || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `NutriLog_Export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
