import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import {
  MdPeople,
  MdStorefront,
  MdCheckCircle,
  MdPerson,
  MdToday,
} from "react-icons/md";
import { getAdminDashboardStats } from "../apis/outlet";
import { MdTableChart } from "react-icons/md";
import Loader from "../components/ui/Loader";

const Home = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Day"); // Day, Week, Month, Year
  const [loading, setLoading] = useState(true);

  // Stats state (Server-side)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalOutlets: 0,
    totalPrefields: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    todayAddedOutlets: 0,
  });

  // Graph Data State (Server-side)
  const [chartData, setChartData] = useState({
    categories: [],
    series: { employees: [], outlets: [] },
    filteredCounts: { employees: 0, outlets: 0 },
    employeeStatus: { active: 0, inactive: 0 },
  });

  // Calculate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  // Fetch data from server
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const role = localStorage.getItem("admin-role");
        const username = localStorage.getItem("admin-name");

        let params = { filter };
        if (role === "Branch") {
          params.Branch = username;
        } else if (role === "Circle_AM") {
          params.Circle_AM = username;
        } else if (role === "Section_AE") {
          params.Section_AE = username;
        }

        const response = await getAdminDashboardStats(params);
        if (response.success) {
          setStats(response.stats);
          setChartData(response.chartData);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [filter]);

  // Growth Line Chart
  const lineChartOptions = {
    chart: { type: "spline", backgroundColor: "transparent", height: 350 },
    accessibility: { enabled: false },
    title: {
      text: `Growth Overview (${filter})`,
      align: "left",
      style: { color: colors.text, fontSize: "18px", fontWeight: "bold" },
    },
    subtitle: {
      text: "New additions over time",
      align: "left",
      style: { color: colors.textSecondary },
    },
    xAxis: {
      categories: chartData.categories,
      labels: { style: { color: colors.textSecondary } },
      lineColor: colors.accent + "40",
      gridLineWidth: 0,
    },
    yAxis: {
      title: { text: null },
      labels: { style: { color: colors.textSecondary } },
      gridLineColor: colors.accent + "20",
    },
    legend: {
      itemStyle: { color: colors.text },
      itemHoverStyle: { color: colors.primary },
    },
    tooltip: {
      shared: true,
      backgroundColor: colors.background,
      style: { color: colors.text },
    },
    plotOptions: {
      spline: { marker: { radius: 4, lineColor: "#666666", lineWidth: 1 } },
    },
    credits: { enabled: false },
    series: [
      {
        name: "Employees",
        data: chartData.series.employees,
        color: colors.primary,
      },
      { name: "Outlets", data: chartData.series.outlets, color: "#f59e0b" },
    ],
  };

  // Employee Status Pie Chart
  const employeeStatusChartOptions = {
    chart: { type: "pie", backgroundColor: "transparent", height: 300 },
    accessibility: { enabled: false },
    title: {
      text: `Employee Status (${filter})`,
      style: { color: colors.text },
    },
    tooltip: {
      pointFormat: "<b>{point.y}</b> Employees ({point.percentage:.1f}%)",
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b>: {point.y}",
          style: { color: colors.textSecondary },
        },
        showInLegend: true,
      },
    },
    legend: {
      itemStyle: { color: colors.text },
      itemHoverStyle: { color: colors.primary },
    },
    credits: { enabled: false },
    series: [
      {
        name: "Employees",
        colorByPoint: true,
        data: [
          {
            name: "Active",
            y: chartData.employeeStatus.active,
            color: "#22c55e",
          },
          {
            name: "Inactive",
            y: chartData.employeeStatus.inactive,
            color: "#ef4444",
          },
        ],
      },
    ],
  };

  // Overview Column Chart
  const overviewChartOptions = {
    chart: { type: "column", backgroundColor: "transparent", height: 300 },
    accessibility: { enabled: false },
    title: {
      text: `Total Added (${
        filter === "Day"
          ? "Today"
          : filter === "Week"
            ? "This Week"
            : filter === "Month"
              ? "This Month"
              : "This Year"
      })`,
      style: { color: colors.text },
    },
    xAxis: {
      categories: ["Employees", "Outlets"],
      labels: { style: { color: colors.textSecondary } },
      lineColor: colors.accent + "40",
    },
    yAxis: {
      title: { text: "Count", style: { color: colors.textSecondary } },
      labels: { style: { color: colors.textSecondary } },
      gridLineColor: colors.accent + "20",
    },
    legend: { enabled: false },
    tooltip: {
      shared: true,
      backgroundColor: colors.background,
      style: { color: colors.text },
    },
    plotOptions: {
      column: {
        borderRadius: 5,
        dataLabels: { enabled: true, style: { color: colors.text } },
      },
    },
    credits: { enabled: false },
    series: [
      {
        name: "Total Added",
        data: [
          { y: chartData.filteredCounts.employees || 0, color: colors.primary },
          { y: chartData.filteredCounts.outlets || 0, color: "#f59e0b" },
        ],
      },
    ],
  };

  const role = localStorage.getItem("admin-role");

  const StatCard = ({ title, value, icon: Icon, color, onClick, bgColor }) => (
    <div
      className="p-6 rounded border shadow-sm transition-all hover:scale-105 cursor-pointer relative overflow-hidden"
      onClick={onClick}
      style={{
        backgroundColor: colors.background,
        borderColor: colors.accent + "30",
      }}
    >
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-transparent">
          <Loader size={24} />
        </div>
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 rounded" style={{ backgroundColor: bgColor }}>
          <Icon size={24} style={{ color: color }} />
        </div>
      </div>
      <h3 className="text-3xl font-bold mb-1" style={{ color: colors.text }}>
        {loading ? "..." : value}
      </h3>
      <p className="text-sm" style={{ color: colors.textSecondary }}>
        {title}
      </p>
    </div>
  );

  return (
    <div className="p-6 space-y-8">
      {/* Greeting Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1
            className="text-3xl md:text-4xl font-bold mb-2"
            style={{ color: colors.text }}
          >
            {getGreeting()}!
          </h1>
          <p className="text-base" style={{ color: colors.textSecondary }}>
            Overview of your VizStik performance.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {["admin", "Branch", "Circle_AM", "Section_AE"].includes(role) && (
          <StatCard
            title="Total Employees"
            value={stats.totalEmployees}
            icon={MdPeople}
            color={colors.primary}
            bgColor={colors.primary + "20"}
            onClick={() => navigate("/dashboard/employees")}
          />
        )}

        <StatCard
          title="Total Outlets"
          value={stats.totalOutlets}
          icon={MdStorefront}
          color="#f59e0b"
          bgColor="#f59e0b20"
          onClick={() => navigate("/dashboard/outlets")}
        />

        <StatCard
          title="Today Added Outlets"
          value={stats.todayAddedOutlets}
          icon={MdToday}
          color="#8b5cf6"
          bgColor="#8b5cf620"
          onClick={() => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, "0");
            const day = String(now.getDate()).padStart(2, "0");
            const today = `${year}-${month}-${day}`;
            navigate("/dashboard/outlets", { state: { initialDate: today } });
          }}
        />

        <StatCard
          title="Total Master Data"
          value={stats.totalPrefields}
          icon={MdTableChart}
          color={colors.secondary}
          bgColor={colors.secondary + "20"}
          onClick={() => navigate("/dashboard/master-data")}
        />

        {/* {["admin", "Branch", "Circle_AM", "Section_AE"].includes(role) && (
          <StatCard
            title="Active Employees"
            value={stats.activeEmployees}
            icon={MdPerson}
            color="#22c55e"
            bgColor="#22c55e20"
            onClick={() =>
              navigate("/dashboard/employees", {
                state: { initialStatus: "true" },
              })
            }
          />
        )} */}

        {["admin", "Branch", "Circle_AM", "Section_AE"].includes(role) && (
          <StatCard
            title="Inactive Employees"
            value={stats.inactiveEmployees}
            icon={MdPerson}
            color="#ef4444"
            bgColor="#ef444420"
            onClick={() =>
              navigate("/dashboard/employees", {
                state: { initialStatus: "false" },
              })
            }
          />
        )}
      </div>

      {/* Charts Section */}
      <div className="flex flex-col gap-6">
        {/* Growth Line Chart (Full Width) */}
        <div
          className="p-6 rounded border shadow-sm relative min-h-[400px]"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.accent + "30",
          }}
        >
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-transparent rounded">
              <Loader size={40} />
            </div>
          )}

          {/* Chart Header with Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                Growth Overview
              </h2>
              <p className="text-sm" style={{ color: colors.textSecondary }}>
                New additions over time
              </p>
            </div>

            {/* Global Filter Buttons - Moved Here */}
            <div
              className="flex items-center bg-gray-100/10 p-1 rounded border self-start md:self-center"
              style={{
                borderColor: colors.accent + "30",
                backgroundColor: colors.accent + "10",
              }}
            >
              {["Day", "Week", "Month", "Year"].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`px-4 cursor-pointer py-1.5 rounded text-sm font-medium transition-all ${
                    filter === item ? "shadow-sm" : "hover:bg-black/5"
                  }`}
                  style={{
                    backgroundColor:
                      filter === item ? colors.background : "transparent",
                    color:
                      filter === item ? colors.primary : colors.textSecondary,
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <HighchartsReact
            highcharts={Highcharts}
            options={{
              ...lineChartOptions,
              title: { text: null }, // Handled by our custom header
              subtitle: { text: null },
            }}
          />
        </div>

        {/* Bottom Split Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Status Chart - Only for Admin */}
          {role === "admin" && (
            <div
              className="p-6 rounded border shadow-sm relative min-h-[350px]"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.accent + "30",
              }}
            >
              {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-transparent rounded">
                  <Loader size={30} />
                </div>
              )}
              <HighchartsReact
                highcharts={Highcharts}
                options={employeeStatusChartOptions}
              />
            </div>
          )}

          {/* Overview Chart */}
          <div
            className="p-6 rounded border shadow-sm relative min-h-[350px]"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.accent + "30",
            }}
          >
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-transparent rounded">
                <Loader size={30} />
              </div>
            )}
            <HighchartsReact
              highcharts={Highcharts}
              options={overviewChartOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
