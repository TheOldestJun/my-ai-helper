const KitchenDashboard = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-slate-900">Кухня / Харчоблок</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-2">Меню</h3>
        <p className="text-sm text-slate-600">Планування меню</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-2">Продукти</h3>
        <p className="text-sm text-slate-600">Залишки продуктів</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-2">Заявка на продукти</h3>
        <p className="text-sm text-slate-600">Подати заявку на закупівлю продуктів</p>
      </div>
    </div>
  </div>
);

export default KitchenDashboard;
