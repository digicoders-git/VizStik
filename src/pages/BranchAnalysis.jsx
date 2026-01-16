import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { getBranchStats } from "../apis/branch";
import { useNavigate } from "react-router-dom";
import Loader from "../components/ui/Loader";
import { toast } from "react-toastify";
import {
  MdBusiness,
  MdPeople,
  MdPermIdentity,
  MdSupervisorAccount,
} from "react-icons/md";

const BranchAnalysis = () => {
  const { colors } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getBranchStats();
      if (response.success) {
        setData(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching branch stats:", error);
      toast.error("Failed to load branch data");
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeClick = (branchName) => {
    // Navigate to Employees page with branch filter
    navigate(`/dashboard/employees?branch=${encodeURIComponent(branchName)}`);
  };

  const handleRoleClick = (branchName, role) => {
    // Navigate to Branch Users page
    navigate(
      `/dashboard/branch-users/${role}/${encodeURIComponent(branchName)}`
    );
  };

  return (
    <div className="w-full h-fit flex flex-col p-6">
      <div className="mb-6">
        <h1
          className="text-2xl md:text-3xl font-bold mb-2"
          style={{ color: colors.text }}
        >
          Branch Analysis
        </h1>
        <p
          className="text-sm md:text-base"
          style={{ color: colors.textSecondary }}
        >
          Overview of branches, employees, and admins
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader size={40} />
        </div>
      ) : (
        <div className="grid gap-6">
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
                    Branch Name
                  </th>
                  <th
                    className="px-6 py-4 text-center font-semibold"
                    style={{ color: colors.text }}
                  >
                    Employees
                  </th>
                  <th
                    className="px-6 py-4 text-center font-semibold"
                    style={{ color: colors.text }}
                  >
                    Circle AMs
                  </th>
                  <th
                    className="px-6 py-4 text-center font-semibold"
                    style={{ color: colors.text }}
                  >
                    Section AEs
                  </th>
                  <th
                    className="px-6 py-4 text-center font-semibold"
                    style={{ color: colors.text }}
                  >
                    Branch Login
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b transition-colors hover:bg-opacity-50"
                    style={{ borderColor: colors.accent + "10" }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MdBusiness
                          className="text-xl"
                          style={{ color: colors.primary }}
                        />
                        <span
                          className="font-medium"
                          style={{ color: colors.text }}
                        >
                          {item.branch}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleEmployeeClick(item.branch)}
                        className="px-4 py-1.5 cursor-pointer rounded-full font-bold text-sm transition-all hover:scale-105"
                        style={{
                          backgroundColor: colors.primary + "15",
                          color: colors.primary,
                        }}
                      >
                        {item.employeeCount} Employees
                      </button>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() =>
                          handleRoleClick(item.branch, "Circle_AM")
                        }
                        className="px-4 py-1.5 cursor-pointer rounded-full font-bold text-sm transition-all hover:scale-105"
                        style={{
                          backgroundColor: "#8b5cf615", // Violet tint
                          color: "#8b5cf6",
                        }}
                      >
                        {item.circleAMCount} Circle AMs
                      </button>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() =>
                          handleRoleClick(item.branch, "Section_AE")
                        }
                        className="px-4 py-1.5 cursor-pointer rounded-full font-bold text-sm transition-all hover:scale-105"
                        style={{
                          backgroundColor: "#10b98115", // Emerald tint
                          color: "#10b981",
                        }}
                      >
                        {item.sectionAECount} Section AEs
                      </button>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleRoleClick(item.branch, "Branch")}
                        className="px-4 py-1.5 cursor-pointer rounded-full font-bold text-sm transition-all hover:scale-105"
                        style={{
                          backgroundColor: "#f59e0b15", // Amber tint
                          color: "#f59e0b",
                        }}
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
                {data.length === 0 && (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-8 text-center"
                      style={{ color: colors.textSecondary }}
                    >
                      No branches found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchAnalysis;
