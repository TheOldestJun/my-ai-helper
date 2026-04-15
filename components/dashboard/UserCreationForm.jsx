'use client';
import { useState } from 'react';
import { toast } from 'sonner';

const availableRoles = [
  { name: 'ADMIN', label: 'Адміністратор', description: 'Повний доступ до системи' },
  { name: 'DIRECTORATE', label: 'Директорат', description: 'Погодження заявок' },
  { name: 'SUPPLY', label: 'Закупівлі', description: 'Управління закупівлями' },
  { name: 'APPLICANT', label: 'Заявник', description: 'Подання заявок на закупівлю' },
  { name: 'KITCHEN', label: 'Кухня', description: 'Управління харчоблоком' },
  { name: 'WAREHOUSE', label: 'Склад', description: 'Складський облік' },
];

const UserCreationForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    selectedRoles: [],
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (roleName) => {
    setFormData((prev) => {
      const selectedRoles = prev.selectedRoles.includes(roleName)
        ? prev.selectedRoles.filter((r) => r !== roleName)
        : [...prev.selectedRoles, roleName];
      return { ...prev, selectedRoles };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.selectedRoles.length === 0) {
      toast.error('Оберіть хоча б одну роль');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          roleNames: formData.selectedRoles,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Помилка при створенні користувача');
      }

      toast.success(`Користувача ${data.user.email} успішно створено!`);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        selectedRoles: [],
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h3 className="text-lg font-semibold text-foreground mb-4">Створення нового користувача</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-1">
              Ім&apos;я
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground"
              placeholder="Введіть ім&apos;я"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-1">
              Прізвище
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground"
              placeholder="Введіть прізвище"
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
            Email <span className="text-destructive">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground"
            placeholder="user@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
            Пароль <span className="text-destructive">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength={6}
            className="w-full px-3 py-2 border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder-muted-foreground"
            placeholder="Мінімум 6 символів"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-3">
            Ролі користувача <span className="text-destructive">*</span>
          </label>
          <div className="space-y-2">
            {availableRoles.map((role) => (
              <label
                key={role.name}
                className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                  formData.selectedRoles.includes(role.name)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.selectedRoles.includes(role.name)}
                  onChange={() => handleRoleChange(role.name)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-ring border-border rounded"
                />
                <div className="ml-3">
                  <span className="block text-sm font-medium text-foreground">{role.label}</span>
                  <span className="block text-xs text-muted-foreground">{role.description}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Створення...' : 'Створити користувача'}
        </button>
      </form>
    </div>
  );
};

export default UserCreationForm;