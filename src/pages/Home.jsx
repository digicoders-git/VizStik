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
import { getEmployees } from "../apis/employee";
import { getOutlets } from "../apis/outlet";
import { getPrefieldsAdmin } from "../apis/prefield";
import { MdTableChart } from "react-icons/md";
import Loader from "../components/ui/Loader";

const Home = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("Day"); // Day, Week, Month, Year
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    employees: [],
    outlets: [],
    prefields: [],
  });

  // Stats state (Filtered)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalOutlets: 0,
    totalPrefields: 0,
    activeEmployees: 0,
    inactiveEmployees: 0,
    todayAddedOutlets: 0,
  });

  // Graph Data State (Filtered)
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

  // Helper: Get Date Range and Labels based on Filter
  const processFilteredData = (employees, outlets, prefields, filterType) => {
    const now = new Date();
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(now);
    todayEnd.setHours(23, 59, 59, 999);

    let categories = [];
    let empCounts = [];
    let outletCounts = [];

    // Dataset for Pie/Column charts (items in range)
    let filteredEmp = [];
    let filteredOutlets = [];

    if (filterType === "Day") {
      // Last 7 Days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        categories.push(d.toLocaleDateString("en-US", { weekday: "short" }));

        const dayStart = new Date(d.setHours(0, 0, 0, 0));
        const dayEnd = new Date(d.setHours(23, 59, 59, 999));

        const eCount = employees.filter((e) => {
          const c = new Date(e.createdAt);
          return c >= dayStart && c <= dayEnd;
        });
        const oCount = outlets.filter((s) => {
          const c = new Date(s.createdAt);
          return c >= dayStart && c <= dayEnd;
        });

        empCounts.push(eCount.length);
        outletCounts.push(oCount.length);
        filteredEmp = [...filteredEmp, ...eCount];
        filteredOutlets = [...filteredOutlets, ...oCount];
      }
    } else if (filterType === "Week") {
      // Last 4 Weeks
      for (let i = 3; i >= 0; i--) {
        categories.push(`Week ${4 - i}`);
        // Simple approximation: 1 week chunks backwards from now
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - i * 7 - 6);
        weekStart.setHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const eCount = employees.filter((e) => {
          const c = new Date(e.createdAt);
          return c >= weekStart && c <= weekEnd;
        });
        const oCount = outlets.filter((s) => {
          const c = new Date(s.createdAt);
          return c >= weekStart && c <= weekEnd;
        });

        empCounts.push(eCount.length);
        outletCounts.push(oCount.length);
        filteredEmp = [...filteredEmp, ...eCount];
        filteredOutlets = [...filteredOutlets, ...oCount];
      }
    } else if (filterType === "Month") {
      // Last 12 Months
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        categories.push(monthNames[d.getMonth()]);

        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(
          d.getFullYear(),
          d.getMonth() + 1,
          0,
          23,
          59,
          59
        );

        const eCount = employees.filter((e) => {
          const c = new Date(e.createdAt);
          return c >= monthStart && c <= monthEnd;
        });
        const oCount = outlets.filter((s) => {
          const c = new Date(s.createdAt);
          return c >= monthStart && c <= monthEnd;
        });

        empCounts.push(eCount.length);
        outletCounts.push(oCount.length);
        filteredEmp = [...filteredEmp, ...eCount];
        filteredOutlets = [...filteredOutlets, ...oCount];
      }
    } else {
      // Year (Default - Current Year Monthly) - Same as Month logic basically but strictly current year
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const currentYear = now.getFullYear();
      categories = monthNames;

      for (let i = 0; i < 12; i++) {
        const monthStart = new Date(currentYear, i, 1);
        const monthEnd = new Date(currentYear, i + 1, 0, 23, 59, 59);

        const eCount = employees.filter((e) => {
          const c = new Date(e.createdAt);
          return c >= monthStart && c <= monthEnd;
        });
        const oCount = outlets.filter((s) => {
          const c = new Date(s.createdAt);
          return c >= monthStart && c <= monthEnd;
        });

        empCounts.push(eCount.length);
        outletCounts.push(oCount.length);
        filteredEmp = [...filteredEmp, ...eCount];
        filteredOutlets = [...filteredOutlets, ...oCount];
      }
    }

    // Pie Chart Data (Employee Status)
    const activeEmployeesCount = filteredEmp.filter((e) => e.isActive).length;
    const inactiveEmployeesCount = filteredEmp.length - activeEmployeesCount;

    const todayAddedOutletsCount = outlets.filter((s) => {
      const c = new Date(s.createdAt);
      return c >= todayStart && c <= todayEnd;
    }).length;

    setStats({
      totalEmployees: employees.length,
      totalOutlets: outlets.length,
      totalPrefields: prefields.length,
      todayAddedOutlets: todayAddedOutletsCount,
      activeEmployees: activeEmployeesCount,
      inactiveEmployees: inactiveEmployeesCount,
    });

    setChartData({
      categories,
      series: { employees: empCounts, outlets: outletCounts },
      filteredCounts: {
        employees: filteredEmp.length,
        outlets: filteredOutlets.length,
      },
      employeeStatus: {
        active: activeEmployeesCount,
        inactive: inactiveEmployeesCount,
      },
    });
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const role = localStorage.getItem("admin-role");
        const username = localStorage.getItem("admin-name");

        let params = {
          limit: 1000000, // Fetch more data for correct stats and graphs
        };
        if (role === "Branch") {
          params.Branch = username;
        } else if (role === "Circle_AM") {
          params.Circle_AM = username;
        } else if (role === "Section_AE") {
          params.Section_AE = username;
        }

        const promises = [getOutlets(params)];
        if (["admin", "Branch", "Circle_AM", "Section_AE"].includes(role)) {
          promises.push(getEmployees(params));
          promises.push(getPrefieldsAdmin(params));
        }

        const results = await Promise.all(promises);
        const outletsData = results[0];
        const employeesData = [
          "admin",
          "Branch",
          "Circle_AM",
          "Section_AE",
        ].includes(role)
          ? results[1]
          : { data: [] };
        const prefieldsData = [
          "admin",
          "Branch",
          "Circle_AM",
          "Section_AE",
        ].includes(role)
          ? results[2]
          : { data: [] };

        const outlets = outletsData.data || [];
        const employees = employeesData.data || [];
        const prefields = prefieldsData.data || [];

        setData({ employees, outlets, prefields });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update charts when filter changes
  useEffect(() => {
    if (data.employees.length || data.outlets.length || data.prefields.length) {
      processFilteredData(data.employees, data.outlets, data.prefields, filter);
    }
  }, [filter, data]);

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
    title: { text: `Total Added (${filter})`, style: { color: colors.text } },
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
          { y: chartData.filteredCounts.employees, color: colors.primary },
          { y: chartData.filteredCounts.outlets, color: "#f59e0b" },
        ],
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-10">
        <Loader size={60} />
      </div>
    );
  }

  const role = localStorage.getItem("admin-role");

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

        {/* Global Filter */}
        <div
          className="flex items-center bg-gray-100/10 p-1 rounded border"
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
                color: filter === item ? colors.primary : colors.textSecondary,
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total Employees - Only for Admin/Branch/Circle_AM/Section_AE */}
        {["admin", "Branch", "Circle_AM", "Section_AE"].includes(role) && (
          <div
            className="p-6 rounded border shadow-sm transition-all hover:scale-105 cursor-pointer"
            onClick={() => navigate("/dashboard/employees")}
            style={{
              backgroundColor: colors.background,
              borderColor: colors.accent + "30",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="p-3 rounded"
                style={{ backgroundColor: colors.primary + "20" }}
              >
                <MdPeople size={24} style={{ color: colors.primary }} />
              </div>
            </div>
            <h3
              className="text-3xl font-bold mb-1"
              style={{ color: colors.text }}
            >
              {stats.totalEmployees}
            </h3>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Total Employees
            </p>
          </div>
        )}

        {/* Total Outlets */}
        <div
          className="p-6 rounded border shadow-sm transition-all hover:scale-105 cursor-pointer"
          onClick={() => navigate("/dashboard/outlets")}
          style={{
            backgroundColor: colors.background,
            borderColor: colors.accent + "30",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="p-3 rounded"
              style={{ backgroundColor: "#f59e0b20" }}
            >
              <MdStorefront size={24} style={{ color: "#f59e0b" }} />
            </div>
          </div>
          <h3
            className="text-3xl font-bold mb-1"
            style={{ color: colors.text }}
          >
            {stats.totalOutlets}
          </h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Total Outlets
          </p>
        </div>

        {/* Today Added Outlets */}
        <div
          className="p-6 rounded border shadow-sm transition-all hover:scale-105 cursor-pointer"
          onClick={() => {
            const today = new Date().toISOString().split("T")[0];
            navigate("/dashboard/outlets", { state: { initialDate: today } });
          }}
          style={{
            backgroundColor: colors.background,
            borderColor: colors.accent + "30",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="p-3 rounded"
              style={{ backgroundColor: "#8b5cf620" }}
            >
              <MdToday size={24} style={{ color: "#8b5cf6" }} />
            </div>
          </div>
          <h3
            className="text-3xl font-bold mb-1"
            style={{ color: colors.text }}
          >
            {stats.todayAddedOutlets}
          </h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Today Added Outlets
          </p>
        </div>
        {/* Total Master Data */}
        <div
          className="p-6 rounded border shadow-sm transition-all hover:scale-105 cursor-pointer"
          onClick={() => navigate("/dashboard/master-data")}
          style={{
            backgroundColor: colors.background,
            borderColor: colors.accent + "30",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div
              className="p-3 rounded"
              style={{ backgroundColor: colors.secondary + "20" }}
            >
              <MdTableChart size={24} style={{ color: colors.secondary }} />
            </div>
          </div>
          <h3
            className="text-3xl font-bold mb-1"
            style={{ color: colors.text }}
          >
            {stats.totalPrefields}
          </h3>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Total Master Data
          </p>
        </div>

        {/* Active Employees - Only for Admin/Branch/Circle_AM/Section_AE */}
        {["admin", "Branch", "Circle_AM", "Section_AE"].includes(role) && (
          <div
            className="p-6 rounded border shadow-sm transition-all hover:scale-105 cursor-pointer"
            onClick={() =>
              navigate("/dashboard/employees", {
                state: { initialStatus: "true" },
              })
            }
            style={{
              backgroundColor: colors.background,
              borderColor: colors.accent + "30",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="p-3 rounded"
                style={{ backgroundColor: "#22c55e20" }}
              >
                <MdPerson size={24} style={{ color: "#22c55e" }} />
              </div>
            </div>
            <h3
              className="text-3xl font-bold mb-1"
              style={{ color: colors.text }}
            >
              {stats.activeEmployees}
            </h3>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Active Employees
            </p>
          </div>
        )}

        {/* Inactive Employees - Only for Admin/Branch/Circle_AM/Section_AE */}
        {["admin", "Branch", "Circle_AM", "Section_AE"].includes(role) && (
          <div
            className="p-6 rounded border shadow-sm transition-all hover:scale-105 cursor-pointer"
            onClick={() =>
              navigate("/dashboard/employees", {
                state: { initialStatus: "false" },
              })
            }
            style={{
              backgroundColor: colors.background,
              borderColor: colors.accent + "30",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className="p-3 rounded"
                style={{ backgroundColor: "#ef444420" }}
              >
                <MdPerson size={24} style={{ color: "#ef4444" }} />
              </div>
            </div>
            <h3
              className="text-3xl font-bold mb-1"
              style={{ color: colors.text }}
            >
              {stats.inactiveEmployees}
            </h3>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Inactive Employees
            </p>
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="flex flex-col gap-6">
        {/* Growth Line Chart (Full Width) */}
        <div
          className="p-6 rounded border shadow-sm"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.accent + "30",
          }}
        >
          <HighchartsReact highcharts={Highcharts} options={lineChartOptions} />
        </div>

        {/* Bottom Split Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employee Status Chart - Only for Admin */}
          {role === "admin" && (
            <div
              className="p-6 rounded border shadow-sm"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.accent + "30",
              }}
            >
              <HighchartsReact
                highcharts={Highcharts}
                options={employeeStatusChartOptions}
              />
            </div>
          )}

          {/* Overview Chart */}
          <div
            className="p-6 rounded border shadow-sm"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.accent + "30",
            }}
          >
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
