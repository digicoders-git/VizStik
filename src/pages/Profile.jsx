import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { updateAdminPassword } from "../apis/admin";
import {
  MdPerson,
  MdArrowBack,
  MdLock,
  MdSave,
  MdVisibility,
  MdVisibilityOff,
} from "react-icons/md";
import Loader from "../components/ui/Loader";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [adminId, setAdminId] = useState("");

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem("admin-name");
    const id = localStorage.getItem("admin-id");
    if (name) setUsername(name);
    if (id) setAdminId(id);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.oldPassword ||
      !formData.newPassword ||
      !formData.confirmPassword
    ) {
      Swal.fire("Error", "All fields are required", "error");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      Swal.fire("Error", "New passwords do not match", "error");
      return;
    }

    try {
      setLoading(true);
      await updateAdminPassword(adminId, {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });

      Swal.fire("Success", "Password updated successfully!", "success");
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update password";
      Swal.fire("Error", message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 cursor-pointer rounded transition-colors"
          style={{
            backgroundColor: colors.accent + "20",
            color: colors.text,
          }}
        >
          <MdArrowBack size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold" style={{ color: colors.text }}>
            Account Settings
          </h1>
          <p style={{ color: colors.textSecondary }}>
            Manage your security and profile
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1">
          <div
            className="rounded-2xl p-8 border shadow-sm flex flex-col items-center text-center sticky top-6"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.accent + "30",
            }}
          >
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-4 shadow-inner"
              style={{
                backgroundColor: colors.primary + "10",
                color: colors.primary,
              }}
            >
              <MdPerson size={48} />
            </div>
            <h2
              className="text-xl font-bold mb-1"
              style={{ color: colors.text }}
            >
              {username}
            </h2>
            <p
              className="text-sm px-3 py-1 rounded-full mb-4"
              style={{
                backgroundColor: colors.accent + "10",
                color: colors.textSecondary,
              }}
            >
              Administrator
            </p>

            <div
              className="w-full h-px mb-4"
              style={{ backgroundColor: colors.accent + "20" }}
            ></div>

            <p
              className="text-xs italic"
              style={{ color: colors.textSecondary }}
            >
              Security level: High
            </p>
          </div>
        </div>

        {/* Right Column: Settings Form */}
        <div className="lg:col-span-2">
          <div
            className="rounded-2xl p-8 border shadow-sm"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.accent + "30",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="p-2 rounded-lg"
                style={{
                  backgroundColor: colors.primary + "10",
                  color: colors.primary,
                }}
              >
                <MdLock size={20} />
              </div>
              <h3 className="text-xl font-bold" style={{ color: colors.text }}>
                Change Password
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username (Read-only) */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Username
                </label>
                <div className="relative">
                  <MdPerson
                    className="absolute left-4 top-3.5 w-5 h-5"
                    style={{ color: colors.textSecondary }}
                  />
                  <input
                    type="text"
                    value={username}
                    readOnly
                    className="w-full pl-12 pr-4 py-3 rounded-xl border outline-none transition-all cursor-not-allowed opacity-70"
                    style={{
                      backgroundColor: colors.accent + "05",
                      borderColor: colors.accent + "30",
                      color: colors.text,
                    }}
                  />
                </div>
              </div>

              {/* Old Password */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Old Password
                </label>
                <div className="relative">
                  <MdLock
                    className="absolute left-4 top-3.5 w-5 h-5"
                    style={{ color: colors.textSecondary }}
                  />
                  <input
                    type={showOldPassword ? "text" : "password"}
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    className="w-full pl-12 pr-12 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-primary"
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "30",
                      color: colors.text,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-4 top-3.5 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                  >
                    {showOldPassword ? (
                      <MdVisibilityOff size={20} />
                    ) : (
                      <MdVisibility size={20} />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* New Password */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.textSecondary }}
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <MdLock
                      className="absolute left-4 top-3.5 w-5 h-5"
                      style={{ color: colors.textSecondary }}
                    />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter new password"
                      className="w-full pl-12 pr-12 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-primary"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.accent + "30",
                        color: colors.text,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-3.5 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                    >
                      {showNewPassword ? (
                        <MdVisibilityOff size={20} />
                      ) : (
                        <MdVisibility size={20} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: colors.textSecondary }}
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <MdLock
                      className="absolute left-4 top-3.5 w-5 h-5"
                      style={{ color: colors.textSecondary }}
                    />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm new password"
                      className="w-full pl-12 pr-12 py-3 rounded-xl border outline-none transition-all focus:ring-2 focus:ring-primary"
                      style={{
                        backgroundColor: colors.background,
                        borderColor: colors.accent + "30",
                        color: colors.text,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-3.5 text-gray-400 hover:text-primary transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <MdVisibilityOff size={20} />
                      ) : (
                        <MdVisibility size={20} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.background,
                  }}
                >
                  {loading ? (
                    <Loader size={20} color={colors.background} />
                  ) : (
                    <>
                      <MdSave size={20} />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
