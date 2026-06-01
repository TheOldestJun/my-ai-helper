const dayImages = {
  'monday': '🍲',
  'tuesday': '🥗',
  'wednesday': '🍝',
  'thursday': '🍛',
  'friday': '🍱',
};

const mealTypes = [
  { id: 'soup', label: 'Перша страва' },
  { id: 'garnish', label: 'Гарнір' },
  { id: 'meat', label: "М'ясна страва" },
  { id: 'salad', label: 'Салат' },
  { id: 'bakery', label: 'Випічка' },
  { id: 'drink', label: 'Напій' },
];

export async function exportMenuPDF({ visibleDays, menu, dishes }) {
  const html2pdf = (await import('html2pdf.js')).default;

  const getDishName = (dishId) => {
    const dish = dishes.find((d) => d.id === dishId);
    return dish ? dish.name : 'Невідома страва';
  };

  const getDishPrice = (dishId) => {
    const dish = dishes.find((d) => d.id === dishId);
    return dish ? dish.price : 0;
  };

  const element = document.createElement('div');
  element.style.padding = '30px';
  element.style.fontFamily = 'Arial, sans-serif';
  element.style.color = '#000000';
  element.style.backgroundColor = '#FFFFFF';

  let htmlContent = '';

  visibleDays.forEach((day, dayIndex) => {
    const pageBreakStyle = dayIndex > 0 ? 'page-break-before: always;' : '';
    const dayEmoji = dayImages[day.id] || '🍽️';
    const dayDate = day.dateStr;

    htmlContent += `
      <div style="margin-bottom: 30px; ${pageBreakStyle}">
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
          <span style="font-size: 72px; margin-right: 20px;">${dayEmoji}</span>
          <div>
            <h2 style="color: #0891B2; font-size: 36px; margin: 0; text-transform: uppercase; font-weight: bold;">
              ${day.label}
            </h2>
            <p style="color: #666; font-size: 20px; margin: 8px 0 0 0;">${dayDate}</p>
          </div>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 18px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <thead>
            <tr style="background: linear-gradient(135deg, #0891B2 0%, #22D3EE 100%); color: #FFFFFF;">
              <th style="padding: 16px; text-align: left; border: 1px solid #0891B2; font-weight: bold; font-size: 20px;">Категорія</th>
              <th style="padding: 16px; text-align: left; border: 1px solid #0891B2; font-weight: bold; font-size: 20px;">Страви</th>
              <th style="padding: 16px; text-align: center; border: 1px solid #0891B2; font-weight: bold; font-size: 20px; width: 120px;">Ціна</th>
            </tr>
          </thead>
          <tbody>
    `;

    mealTypes.forEach((meal, index) => {
      const dishesList = menu[day.id]?.[meal.id] || [];
      const dishNames = dishesList.map(id => getDishName(id))[0] || '-';
      const totalPrice = dishesList.reduce((sum, id) => sum + getDishPrice(id), 0);
      const bgColor = index % 2 === 0 ? '#F8FAFC' : '#FFFFFF';
      const borderColor = index % 2 === 0 ? '#E2E8F0' : '#CBD5E1';

      htmlContent += `
        <tr style="background-color: ${bgColor}; color: #000000;">
          <td style="padding: 16px; border: 1px solid ${borderColor}; font-weight: bold; color: #0891B2; font-size: 18px;">${meal.label}</td>
          <td style="padding: 16px; border: 1px solid ${borderColor}; font-size: 18px;">${dishNames}</td>
          <td style="padding: 16px; border: 1px solid ${borderColor}; font-size: 18px; text-align: center;">${totalPrice > 0 ? `${totalPrice.toFixed(2)}₴` : '-'}</td>
        </tr>
      `;
    });

    const dayTotal = mealTypes.reduce((sum, meal) => {
      const dishesList = menu[day.id]?.[meal.id] || [];
      return sum + dishesList.reduce((s, id) => s + getDishPrice(id), 0);
    }, 0);

    htmlContent += `
          </tbody>
          <tfoot>
            <tr style="background-color: #F0FDFA; font-weight: bold;">
              <td style="padding: 16px; border: 1px solid #CBD5E1; font-size: 18px; text-align: right;" colspan="2">Загальна сума:</td>
              <td style="padding: 16px; border: 1px solid #CBD5E1; font-size: 18px; text-align: center; color: #0891B2;">${dayTotal > 0 ? `${dayTotal.toFixed(2)}₴` : '-'}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    `;
  });

  element.innerHTML = htmlContent;
  document.body.appendChild(element);

  const opt = {
    margin: 15,
    filename: `Меню_на_тиждень_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      backgroundColor: '#FFFFFF'
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  await html2pdf().set(opt).from(element).save();
  document.body.removeChild(element);
}
