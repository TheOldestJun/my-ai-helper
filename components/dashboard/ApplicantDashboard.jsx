const ApplicantDashboard = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-slate-900">Подання заявок</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-2">Нова заявка</h3>
        <p className="text-sm text-slate-600">Створити заявку на закупівлю</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold text-slate-900 mb-2">Мої заявки</h3>
        <p className="text-sm text-slate-600">Історія поданих заявок</p>
      </div>
    </div>
  </div>
);

export default ApplicantDashboard;
