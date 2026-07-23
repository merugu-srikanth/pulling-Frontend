import { useState, useEffect } from "react";
import { UserPlus, Shield, Check, X, ShieldAlert, Edit2, Trash2 } from "lucide-react";
import { authAPI } from "../services/auth";
import toast from "react-hot-toast";

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("moderator");
  const [scrapingPermission, setScrapingPermission] = useState(false);
  const [taskManagerPermission, setTaskManagerPermission] = useState(false);

  // Edit State
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("moderator");
  const [editScrapingPermission, setEditScrapingPermission] = useState(false);
  const [editTaskManagerPermission, setEditTaskManagerPermission] = useState(false);

  const fetchAdmins = async () => {
    try {
      const res = await authAPI.getAdmins();
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load administrators.");
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("All credentials are required.");
      return;
    }

    try {
      await authAPI.createAdmin({
        name,
        email,
        password,
        role,
        permissions: {
          scraping: role === "super_admin" ? true : scrapingPermission,
          task_manager: role === "super_admin" ? true : taskManagerPermission,
        },
      });
      toast.success("Admin created successfully!");
      setName("");
      setEmail("");
      setPassword("");
      setRole("moderator");
      setScrapingPermission(false);
      setTaskManagerPermission(false);
      fetchAdmins();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to create administrator.");
    }
  };

  const handleStartEdit = (admin) => {
    setEditingAdmin(admin);
    setEditName(admin.name);
    setEditEmail(admin.email);
    setEditPassword("");
    setEditRole(admin.role);
    setEditScrapingPermission(admin.permissions?.scraping || false);
    setEditTaskManagerPermission(admin.permissions?.task_manager || false);
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      await authAPI.updateAdmin(editingAdmin._id, {
        name: editName,
        email: editEmail,
        role: editRole,
        permissions: {
          scraping: editRole === "super_admin" ? true : editScrapingPermission,
          task_manager: editRole === "super_admin" ? true : editTaskManagerPermission,
        },
        password: editPassword.trim() !== "" ? editPassword : undefined,
      });
      toast.success("Administrator updated successfully!");
      setEditingAdmin(null);
      fetchAdmins();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to update administrator.");
    }
  };

  const handleDeleteAdmin = async (id) => {
    if (window.confirm("Are you sure you want to delete this administrator?")) {
      try {
        await authAPI.deleteAdmin(id);
        toast.success("Administrator deleted.");
        fetchAdmins();
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.error || "Failed to delete administrator.");
      }
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-sans">Role Settings</h1>
          <p className="text-sm text-slate-500 font-medium font-sans">
            Add new administrators, assign module permissions, and manage user roles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create / Edit Form */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-150 rounded-2xl p-5 shadow-xs sticky top-6">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2 font-sans">
              <UserPlus className="w-4 h-4 text-indigo-500" />
              {editingAdmin ? "Edit Administrator" : "Create New Administrator"}
            </h2>

            <form onSubmit={editingAdmin ? handleUpdateAdmin : handleCreateAdmin} className="space-y-4 font-sans text-xs">
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Srikanth Merugu"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  value={editingAdmin ? editName : name}
                  onChange={(e) => editingAdmin ? setEditName(e.target.value) : setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="srikanth@company.com"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  value={editingAdmin ? editEmail : email}
                  onChange={(e) => editingAdmin ? setEditEmail(e.target.value) : setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Password {editingAdmin && <span className="text-slate-400 font-normal lowercase">(leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  required={!editingAdmin}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition"
                  value={editingAdmin ? editPassword : password}
                  onChange={(e) => editingAdmin ? setEditPassword(e.target.value) : setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Role Type
                </label>
                <select
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition font-semibold"
                  value={editingAdmin ? editRole : role}
                  onChange={(e) => editingAdmin ? setEditRole(e.target.value) : setRole(e.target.value)}
                >
                  <option value="moderator">Moderator / Role-Based Admin</option>
                  <option value="super_admin">Super Admin (All Permissions)</option>
                </select>
              </div>

              {/* Toggles (only applicable if Moderator) */}
              {((editingAdmin ? editRole : role) === "moderator") && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <span className="block font-bold text-slate-500 uppercase tracking-wider">
                    Permissions Access
                  </span>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                      checked={editingAdmin ? editScrapingPermission : scrapingPermission}
                      onChange={(e) => editingAdmin ? setEditScrapingPermission(e.target.checked) : setScrapingPermission(e.target.checked)}
                    />
                    <div>
                      <span className="font-bold text-slate-700 block">Vacancy Scraping</span>
                      <span className="text-[10px] text-slate-450 font-medium">Access to dashboards, scraping schedules & website controls</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4.5 h-4.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                      checked={editingAdmin ? editTaskManagerPermission : taskManagerPermission}
                      onChange={(e) => editingAdmin ? setEditTaskManagerPermission(e.target.checked) : setTaskManagerPermission(e.target.checked)}
                    />
                    <div>
                      <span className="font-bold text-slate-700 block">Kanban Task Manager</span>
                      <span className="text-[10px] text-slate-450 font-medium">Access to boards, my tasks, timeline, reports & analytics</span>
                    </div>
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                {editingAdmin && (
                  <button
                    type="button"
                    onClick={() => setEditingAdmin(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 font-semibold rounded-xl transition"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition"
                >
                  {editingAdmin ? "Update Admin" : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Admin List Table */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-150 rounded-2xl overflow-hidden shadow-xs font-sans">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Administrators List ({admins.length})
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3">Permissions</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admins.map((admin) => {
                    const isPrimarySuperAdmin = admin.email === "superadmin@company.com";
                    return (
                      <tr key={admin._id} className="hover:bg-slate-50/55 transition">
                        <td className="px-5 py-4">
                          <div>
                            <span className="font-bold text-slate-800 block">{admin.name}</span>
                            <span className="text-slate-400 font-medium">{admin.email}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-[9px] ${
                            admin.role === "super_admin" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-700"
                          }`}>
                            {admin.role === "super_admin" ? "Super Admin" : "Moderator"}
                          </span>
                        </td>
                        <td className="px-5 py-4 space-y-1">
                          {admin.role === "super_admin" ? (
                            <span className="text-slate-400 italic">Full Access</span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {admin.permissions?.scraping && (
                                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold text-[9px]">Scraping</span>
                              )}
                              {admin.permissions?.task_manager && (
                                <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold text-[9px]">Task Manager</span>
                              )}
                              {!admin.permissions?.scraping && !admin.permissions?.task_manager && (
                                <span className="text-slate-350 italic">None</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {isPrimarySuperAdmin ? (
                            <span className="text-[10px] text-slate-400 font-medium italic flex items-center justify-end gap-1">
                              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
                              System Protected
                            </span>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleStartEdit(admin)}
                                className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                                title="Edit Role"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteAdmin(admin._id)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Admin"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
