'use client';

import { useState, useEffect, useCallback } from 'react';

const availableRoles = [
  { name: 'ADMIN', label: 'Адміністратор' },
  { name: 'SUPPLY', label: 'Закупівлі' },
  { name: 'APPLICANT', label: 'Заявник' },
  { name: 'KITCHEN', label: 'Кухня' },
  { name: 'WAREHOUSE', label: 'Склад' },
];

const roleColors = {
  ADMIN: 'bg-purple-100 text-purple-700',
  SUPPLY: 'bg-blue-100 text-blue-700',
  APPLICANT: 'bg-green-100 text-green-700',
  KITCHEN: 'bg-orange-100 text-orange-700',
  WAREHOUSE: 'bg-amber-100 text-amber-700',
};

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [message, setMessage] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
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
      setMessage('Користувача успішно видалено');
      setDeleteConfirm(null);
      fetchUsers();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message);
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
      setMessage('Користувача успішно оновлено');
      setEditingUser(null);
      fetchUsers();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">{message}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
            <tr>
              <th className="px-4 py-3">Користувач</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Ролі</th>
              <th className="px-4 py-3">Дата створення</th>
              <th className="px-4 py-3 text-right">Дії</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {users.map((user) => (
              <tr key={user.id} className="bg-white hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <span
                        key={role.name}
                        className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                          roleColors[role.name] || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {availableRoles.find((r) => r.name === role.name)?.label || role.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(user.createdAt).toLocaleDateString('uk-UA')}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => openEditModal(user)}
                    className="px-3 py-1 text-xs font-medium text-cyan-700 bg-cyan-50 rounded hover:bg-cyan-100 transition-colors"
                  >
                    Редагувати
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(user)}
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-50 rounded hover:bg-red-100 transition-colors"
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
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Редагування користувача</h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Ім&apos;я</label>
                    <input
                      type="text"
                      value={editingUser.firstName || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, firstName: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Прізвище</label>
                    <input
                      type="text"
                      value={editingUser.lastName || ''}
                      onChange={(e) => setEditingUser({ ...editingUser, lastName: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Новий пароль (необов&apos;язково)</label>
                  <input
                    type="password"
                    value={editingUser.newPassword}
                    onChange={(e) => setEditingUser({ ...editingUser, newPassword: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Мінімум 6 символів"
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">Ролі</label>
                  <div className="space-y-1">
                    {availableRoles.map((role) => (
                      <label key={role.name} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editingUser.selectedRoles.includes(role.name)}
                          onChange={() => toggleRole(role.name)}
                          className="h-4 w-4 text-cyan-600 rounded"
                        />
                        <span className="text-sm text-slate-700">{role.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-2 px-4 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                  >
                    Скасувати
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-4 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700"
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
          <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Підтвердження видалення</h3>
            <p className="text-sm text-slate-600 mb-4">
              Ви впевнені, що хочете видалити користувача <strong>{deleteConfirm.email}</strong>?
              Цю дію неможливо скасувати.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2 px-4 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Скасувати
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 py-2 px-4 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
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
