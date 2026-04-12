'use client';
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

const availableRoles = [
  { name: 'ADMIN', label: 'Адміністратор' },
  { name: 'SUPPLY', label: 'Закупівлі' },
  { name: 'APPLICANT', label: 'Заявник' },
  { name: 'KITCHEN', label: 'Кухня' },
  { name: 'WAREHOUSE', label: 'Склад' },
];

const roleColors = {
  ADMIN: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  SUPPLY: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  APPLICANT: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  KITCHEN: 'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  WAREHOUSE: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      toast.success('Користувача успішно видалено');
      setDeleteConfirm(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editingUser.email,
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          roleNames: editingUser.selectedRoles,
          password: editingUser.newPassword || undefined,
        }),
      });
      if (!response.ok) throw new Error('Failed to update user');
      toast.success('Користувача успішно оновлено');
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const openEditModal = (user) => {
    setEditingUser({
      ...user,
      selectedRoles: user.roles.map((r) => r.name),
      newPassword: '',
    });
  };

  const toggleRole = (roleName) => {
    setEditingUser((prev) => ({
      ...prev,
      selectedRoles: prev.selectedRoles.includes(roleName)
        ? prev.selectedRoles.filter((r) => r !== roleName)
        : [...prev.selectedRoles, roleName],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted">
            <tr>
              <th className="px-4 py-3">Користувач</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Ролі</th>
              <th className="px-4 py-3">Дата створення</th>
              <th className="px-4 py-3 text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id} className="bg-card hover:bg-muted/50">
                <td className="px-4 py-3 font-medium text-foreground">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <span
                        key={role.name}
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          roleColors[role.name] || 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {availableRoles.find((r) => r.name === role.name)?.label || role.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString('uk-UA')}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => openEditModal(user)}
                    className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded hover:bg-primary/20 transition-colors"
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(user)}
                    className="px-3 py-1 text-xs font-medium text-destructive bg-destructive/10 rounded hover:bg-destructive/20 transition-colors"
                  >
                    Видалити
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto border border-border">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Редагування користувача</h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Ім&apos;я</label>
                    <input
                      type="text"
                      value={editingUser.firstName || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">Прізвище</label>
                    <input
                      type="text"
                      value={editingUser.lastName || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Новий пароль (необов&apos;язково)</label>
                  <input
                    type="password"
                    value={editingUser.newPassword}
                    onChange={(e) => setEditingUser({ ...editingUser, newPassword: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-input bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    placeholder="Мінімум 6 символів"
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-2">Ролі</label>
                  <div className="space-y-1">
                    {availableRoles.map((role) => (
                      <label key={role.name} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingUser.selectedRoles.includes(role.name)}
                          onChange={() => toggleRole(role.name)}
                          className="h-4 w-4 text-cyan-600 rounded"
                        />
                        <span className="text-sm text-foreground">{role.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-2 px-4 text-sm font-medium text-secondary-foreground bg-secondary rounded-lg hover:bg-secondary/80"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 text-sm font-medium text-primary-foreground bg-primary rounded-lg hover:bg-primary/90"
                  >
                    Зберегти
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card text-card-foreground rounded-xl shadow-lg max-w-sm w-full p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-2">Підтвердження видалення</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ви впевнені, що хочете видалити користувача <strong>{deleteConfirm.email}</strong>?
              Цю дію неможливо скасувати.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 px-4 text-sm font-medium text-secondary-foreground bg-secondary rounded-lg hover:bg-secondary/80"
              >
                Скасувати
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 py-2 px-4 text-sm font-medium text-destructive-foreground bg-destructive rounded-lg hover:bg-destructive/90"
              >
                Видалити
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserList;