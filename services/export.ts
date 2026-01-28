
import { MealEntry, MealType } from '../types';

export const exportToCSV = (entries: MealEntry[]) => {
  if (entries.length === 0) return;

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

export const exportToPDF = async (entries: MealEntry[], fromDate: string, toDate: string) => {
  const filteredEntries = entries.filter(e => e.date >= fromDate && e.date <= toDate);
  if (filteredEntries.length === 0) return;

  const grouped: Record<string, Partial<Record<MealType, MealEntry>>> = {};
  filteredEntries.forEach(entry => {
    if (!grouped[entry.date]) grouped[entry.date] = {};
    grouped[entry.date][entry.type] = entry;
  });

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const mealIcons: Record<MealType, string> = {
    [MealType.Breakfast]: '☕', [MealType.Lunch]: '🍲', [MealType.Snack]: '🥪', [MealType.Dinner]: '🥗', [MealType.Extras]: '🍎'
  };

  const renderArea = document.getElementById('pdf-render-area');
  if (!renderArea) return;

  // Construir el HTML temporal para el PDF
  renderArea.innerHTML = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h1 style="color: #2563eb; margin-bottom: 5px;">NutriLog - Reporte de Comidas</h1>
      <p style="color: #666; margin-bottom: 20px;">Rango: ${fromDate} al ${toDate}</p>
      ${sortedDates.map(date => `
        <div style="margin-bottom: 30px; border-bottom: 2px solid #eff6ff; padding-bottom: 10px;">
          <h2 style="background: #f0f7ff; padding: 10px; border-radius: 8px; font-size: 18px;">
            ${new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>
          <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 10px;">
            ${[MealType.Breakfast, MealType.Lunch, MealType.Snack, MealType.Dinner, MealType.Extras].map(type => {
              const entry = grouped[date][type];
              if (!entry) return '';
              return `
                <div style="display: flex; gap: 15px; align-items: flex-start; page-break-inside: avoid;">
                  <div style="font-size: 24px; width: 40px; text-align: center;">${mealIcons[type]}</div>
                  <div style="flex: 1;">
                    <div style="font-weight: bold; font-size: 12px; color: #3b82f6; text-transform: uppercase;">${type}</div>
                    <p style="margin: 5px 0; font-size: 14px; line-height: 1.4;">${entry.content}</p>
                    ${entry.image ? `<img src="${entry.image}" style="width: 150px; height: 150px; object-fit: cover; border-radius: 8px; margin-top: 5px; border: 1px solid #ddd;" />` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  try {
    const canvas = await (window as any).html2canvas(renderArea, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const { jsPDF } = (window as any).jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    let heightLeft = pdfHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
    heightLeft -= pdf.internal.pageSize.getHeight();

    while (heightLeft >= 0) {
      position = heightLeft - pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
    }

    pdf.save(`NutriLog_Historial_${fromDate}_a_${toDate}.pdf`);
  } catch (err) {
    console.error('Error generando PDF', err);
  } finally {
    renderArea.innerHTML = ''; // Limpiar el área
  }
};
