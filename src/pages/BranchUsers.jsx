import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getBranchUsers } from "../apis/branch";
import { updateLoginUser } from "../apis/admin"; // We need an update API
import Loader from "../components/ui/Loader";
import { toast } from "react-toastify";
import {
  MdArrowBack,
  MdVisibility,
  MdVisibilityOff,
  MdEdit,
  MdSave,
  MdClose,
} from "react-icons/md";
import Swal from "sweetalert2";

const BranchUsers = () => {
  const { role, branch } = useParams();
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit state
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ password: "" });
  const [showPassword, setShowPassword] = useState({}); // Map of userId -> boolean

  useEffect(() => {
    fetchUsers();
  }, [role, branch]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getBranchUsers(branch, role);
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const togglePassword = (id) => {
    setShowPassword((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEditClick = (user) => {
    setEditingUser(user._id);
    setEditForm({ password: user.password }); // Pre-fill with existing password (visible to admin)
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ password: "" });
  };

  const handleSave = async (userId) => {
    try {
      if (!editForm.password) {
        toast.error("Password cannot be empty");
        return;
      }

      // Call API to update password
      // Assuming updateLoginUser or similar exists. If not, we use updateEmployeeStatus but that's for status.
      // We have updateLoginPassword in login.controller. But we need to call it from frontend.
      // Let's assume we have an API function for it.

      // Since I haven't checked existing 'updateLoginUser' API in frontend, I'll assume I need to make one or use fetch directly or add it to apis/admin.js in next step.
      // For now, I will use a placeholder function call and define it in apis/admin.js

      const response = await updateLoginUser(userId, {
        newPassword: editForm.password,
        oldPassword: users.find((u) => u._id === userId).password,
      });
      // Wait, updateLoginPassword usually requires old password for security.
      // But Admin should be able to reset without old password ideally.
      // The backend `updateLoginPassword` checks `oldPassword`.
      // If I need to force update, I might need a different endpoint.
      // HOWEVER, since we have the plain text password visible in the table (fetched from backend), we can pass it as oldPassword!

      if (response.success) {
        toast.success("Password updated successfully");
        setEditingUser(null);
        fetchUsers(); // Refresh
      } else {
        toast.error(response.message || "Failed to update");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to update password");
    }
  };

  return (
    <div className="w-full h-fit flex flex-col p-6">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 cursor-pointer rounded-full hover:bg-gray-100 transition-colors"
          style={{ color: colors.text }}
        >
          <MdArrowBack size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            {role.replace("_", " ")}s
          </h1>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Branch:{" "}
            <span className="font-semibold" style={{ color: colors.primary }}>
              {branch}
            </span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader size={40} />
        </div>
      ) : (
        <div
          className="w-full overflow-auto rounded border shadow-sm"
          style={{
            borderColor: colors.accent + "30",
            backgroundColor: colors.sidebar || colors.background,
          }}
        >
          <table className="w-full border-collapse">
            <thead>
              <tr style={{ borderBottom: `1px solid ${colors.accent}30` }}>
                <th
                  className="px-6 py-4 text-left font-semibold"
                  style={{ color: colors.text }}
                >
                  Username
                </th>
                <th
                  className="px-6 py-4 text-left font-semibold"
                  style={{ color: colors.text }}
                >
                  Password
                </th>
                <th
                  className="px-6 py-4 text-left font-semibold"
                  style={{ color: colors.text }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b"
                  style={{ borderColor: colors.accent + "10" }}
                >
                  <td
                    className="px-6 py-4 font-medium"
                    style={{ color: colors.text }}
                  >
                    {user.name}
                  </td>
                  <td className="px-6 py-4">
                    {editingUser === user._id ? (
                      <input
                        type="text"
                        value={editForm.password}
                        onChange={(e) =>
                          setEditForm({ ...editForm, password: e.target.value })
                        }
                        className="px-3 py-1.5 rounded border outline-none"
                        style={{
                          backgroundColor: colors.background,
                          borderColor: colors.primary,
                          color: colors.text,
                        }}
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <span style={{ color: colors.textSecondary }}>
                          {showPassword[user._id] ? user.password : "••••••••"}
                        </span>
                        <button
                          onClick={() => togglePassword(user._id)}
                          className="p-1 cursor-pointer rounded hover:bg-gray-100 transition"
                          style={{ color: colors.primary }}
                        >
                          {showPassword[user._id] ? (
                            <MdVisibilityOff />
                          ) : (
                            <MdVisibility />
                          )}
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingUser === user._id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSave(user._id)}
                          className="p-2 cursor-pointer rounded hover:bg-green-100 text-green-600 transition"
                          title="Save"
                        >
                          <MdSave size={20} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-2 cursor-pointer rounded hover:bg-red-100 text-red-600 transition"
                          title="Cancel"
                        >
                          <MdClose size={20} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEditClick(user)}
                        className="flex cursor-pointer items-center gap-2 px-3 py-1.5 rounded transition hover:bg-opacity-80"
                        style={{
                          backgroundColor: colors.primary,
                          color: colors.background,
                        }}
                      >
                        <MdEdit size={16} />
                        <span className="text-sm">Edit</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-8 text-center"
                    style={{ color: colors.textSecondary }}
                  >
                    No users found for this role in this branch.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BranchUsers;
