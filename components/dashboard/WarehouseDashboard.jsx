const WarehouseDashboard = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-slate-900">Складський облік</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-2">Приход товару</h3>
        <p className="text-sm text-slate-600">Оформлення приходу</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-2">Видаток товару</h3>
        <p className="text-sm text-slate-600">Оформлення видатку</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-2">Залишки</h3>
        <p className="text-sm text-slate-600">Перегляд залишків на складі</p>
      </div>
    </div>
  </div>
);

export default WarehouseDashboard;
