const WarehouseDashboard = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-foreground">Складський облік</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
        <h3 className="font-semibold text-foreground mb-2">Приход товару</h3>
        <p className="text-sm text-muted-foreground">Оформлення приходу</p>
      </div>
      <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
        <h3 className="font-semibold text-foreground mb-2">Видаток товару</h3>
        <p className="text-sm text-muted-foreground">Оформлення видатку</p>
      </div>
      <div className="bg-card text-card-foreground p-6 rounded-xl shadow-sm border border-border">
        <h3 className="font-semibold text-foreground mb-2">Залишки</h3>
        <p className="text-sm text-muted-foreground">Перегляд залишків на складі</p>
      </div>
    </div>
  </div>
);

export default WarehouseDashboard;
