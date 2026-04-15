const SupplyDashboard = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-foreground">Відділ закупівель</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
        <h3 className="font-semibold text-foreground mb-2">Заявки на закупівлю</h3>
        <p className="text-sm text-muted-foreground">Перегляд та обробка заявок</p>
      </div>
      <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
        <h3 className="font-semibold text-foreground mb-2">Постачальники</h3>
        <p className="text-sm text-muted-foreground">База постачальників</p>
      </div>
      <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
        <h3 className="font-semibold text-foreground mb-2">Договори</h3>
        <p className="text-sm text-muted-foreground">Управління договорами</p>
      </div>
    </div>
  </div>
);

export default SupplyDashboard;
