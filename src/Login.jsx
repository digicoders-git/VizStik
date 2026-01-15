import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "./apis/auth.js";
import { toast } from "react-toastify";
import { MdPerson, MdLock } from "react-icons/md";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("admin-token");
    localStorage.removeItem("admin-role");
    localStorage.removeItem("admin-id");
    localStorage.removeItem("admin-name");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminLogin({
        name: formData.username,
        password: formData.password,
      });

      // Store token and role if provided in response
      if (response.token) {
        localStorage.setItem("admin-token", response.token);
      }
      if (response.role) {
        localStorage.setItem("admin-role", response.role);
      }
      if (response.id) {
        localStorage.setItem("admin-id", response.id);
      }
      if (response.name) {
        localStorage.setItem("admin-name", response.name);
      }

      toast.success("Login successful!");
      navigate("/dashboard");
    } catch (error) {
      if (error.response && error.response.status !== 500) {
        toast.error(
          error.response.data.message ||
            error.response.data.error ||
            "Login failed"
        );
      } else {
        toast.error("Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-br from-blue-50 to-indigo-100 flex justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-xl p-6 sm:p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Admin Login
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                id="username"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="Enter your username"
              />
              <MdPerson className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                placeholder="*******"
              />
              <MdLock className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`cursor-pointer w-full font-semibold py-3 px-4 rounded-lg transform hover:scale-[1.02] transition-all duration-200 shadow-lg ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-6 pt-6 border-t border-gray-100 text-center text-xs hover:text-blue-500  transition-all duration-200">
          <a href="https://digicoders.in" target="_blank">
            Design and Developed By #TeamDigicoders
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
