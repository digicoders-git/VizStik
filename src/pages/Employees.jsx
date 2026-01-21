import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  getEmployees,
  deleteEmployee,
  updateEmployeeStatus,
  downloadEmployeesExcel,
} from "../apis/employee";
import { toast } from "react-toastify";
import {
  MdVisibility,
  MdSearch,
  MdChevronLeft,
  MdChevronRight,
  MdFilterList,
  MdArrowUpward,
  MdArrowDownward,
  MdDownload,
  MdDelete,
} from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import Toggle from "../components/ui/Toggle";
import Loader from "../components/ui/Loader";
import Swal from "sweetalert2";

const Employees = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("admin-role");

  const [allEmployees, setAllEmployees] = useState([]); // Stores all raw data
  const [filteredEmployees, setFilteredEmployees] = useState([]); // Stores filtered & sorted data
  const [employees, setEmployees] = useState([]); // Stores current page data

  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Search, Filter, Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState(
    location.state?.initialStatus || "",
  ); // 'true', 'false', or '' (all)
  const [branchFilter, setBranchFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [circleAMFilter, setCircleAMFilter] = useState("");
  const [sectionAEFilter, setSectionAEFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [showFilters, setShowFilters] = useState(
    !!location.state?.initialStatus,
  );

  // Sorting state
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  // 1. Fetch Effect (Triggered by filter/page changes)
  useEffect(() => {
    fetchEmployees();
  }, [
    searchTerm,
    activeFilter,
    branchFilter,
    cityFilter,
    circleAMFilter,
    sectionAEFilter,
    fromDate,
    toDate,
    currentPage,
    limit,
    sortBy,
    sortOrder,
  ]);

  // Client-side filtering/sorting is now handled by server, so we remove those effects
  // We keep the initial filter state from navigation
  useEffect(() => {
    if (location.state?.initialStatus) {
      setActiveFilter(location.state.initialStatus);
      setShowFilters(true);
    }
  }, [location.state]);

  // Handle Branch query param from Branch Analysis page
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const branchQuery = queryParams.get("branch");
    if (branchQuery) {
      setBranchFilter(branchQuery);
      setShowFilters(true);
    }
  }, [location.search]);

  // Removed debounce effect for fetch, as we fetch once.
  // We can debounce the setSearchTerm update in the UI if needed,
  // but for local filtering it's fast enough usually.
  // Or we can keep a debounced search term for the filter effect.
  // For now, let's keep it simple direct filtering.

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const role = localStorage.getItem("admin-role");
      const username = localStorage.getItem("admin-name");

      const params = {
        search: searchTerm,
        isActive: activeFilter,
        Branch: role === "Branch" ? username : branchFilter,
        Circle_AM: role === "Circle_AM" ? username : circleAMFilter,
        Section_AE: role === "Section_AE" ? username : sectionAEFilter,
        City: cityFilter,
        fromDate: fromDate,
        toDate: toDate,
        limit,
        page: currentPage,
        sort: sortBy,
        order: sortOrder,
      };

      const response = await getEmployees(params);
      // New response structure: { data: [], pagination: { total, page, limit, totalPages }, success, message }
      const employeesData = response.data || [];
      const pagination = response.pagination || {};

      setEmployees(employeesData);
      console.log(employees)
      setTotalEmployees(pagination.total || employeesData.length);
      setTotalPages(pagination.totalPages || 1);
    } catch (error) {
      console.error("Fetch employees error:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const username = localStorage.getItem("admin-name");
      const params = {};
      if (role === "Branch") {
        params.Branch = username;
      } else if (role === "Circle_AM") {
        params.Circle_AM = username;
        params.Section_AE = sectionAEFilter;
        params.Branch = branchFilter;
      } else if (role === "Section_AE") {
        params.Section_AE = username;
        params.Branch = branchFilter;
      } else {
        params.Branch = branchFilter;
        params.Circle_AM = circleAMFilter;
        params.Section_AE = sectionAEFilter;
      }
      await downloadEmployeesExcel(params);
      toast.success("Excel downloaded successfully");
    } catch (error) {
      toast.error("Failed to download excel");
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async (employeeId, employeeName) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete ${employeeName}? This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: colors.primary,
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setDeletingId(employeeId);
        await deleteEmployee(employeeId);
        toast.success("Employee deleted successfully");
        fetchEmployees();
      } catch (error) {
        console.error("Delete error:", error);
        if (error.response && error.response.status !== 500) {
          toast.error(
            error.response.data.message ||
              error.response.data.error ||
              "Failed to delete employee",
          );
        } else {
          toast.error("Failed to delete employee");
        }
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleStatusToggle = async (employeeId) => {
    try {
      await updateEmployeeStatus(employeeId);
      fetchEmployees();
    } catch (error) {
      // console.error('Status toggle error:', error)
      if (error.response && error.response.status !== 500) {
        toast.error(
          error.response.data.message ||
            error.response.data.error ||
            "Failed to update status",
        );
      } else {
        toast.error("Failed to update status");
      }
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1); // Reset to first page on sort
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilter("");
    setBranchFilter("");
    setCityFilter("");
    setCircleAMFilter("");
    setSectionAEFilter("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Manage Employees
          </h1>
          <p
            className="text-sm md:text-base mt-2"
            style={{ color: colors.textSecondary }}
          >
            View and manage all registered employees
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center cursor-pointer gap-2 px-6 py-2.5 rounded transition-all hover:opacity-90 shadow-sm border"
          style={{
            backgroundColor: colors.primary,
            color: colors.background,
            borderColor: colors.primary,
          }}
        >
          {downloading ? (
            <Loader size={20} color={colors.background} />
          ) : (
            <MdDownload className="w-5 h-5" />
          )}
          <span>Download Excel</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Box */}
          <div className="flex-1 relative">
            <MdSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: colors.textSecondary }}
            />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded border outline-none transition-all"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.accent + "30",
                color: colors.text,
              }}
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded border transition-all"
            style={{
              backgroundColor: showFilters
                ? colors.primary + "20"
                : colors.background,
              borderColor: colors.accent + "30",
              color: showFilters ? colors.primary : colors.text,
            }}
          >
            <MdFilterList className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 rounded border"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "30",
            }}
          >
            <div className="w-full">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text }}
              >
                Status
              </label>
              <select
                value={activeFilter}
                onChange={(e) => {
                  setActiveFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 rounded border outline-none cursor-pointer"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.accent + "30",
                  color: colors.text,
                }}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            {role !== "Branch" && (
              <div className="w-full">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  Branch
                </label>
                <input
                  type="text"
                  placeholder="Branch..."
                  value={branchFilter}
                  onChange={(e) => {
                    setBranchFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 rounded border outline-none"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent + "30",
                    color: colors.text,
                  }}
                />
              </div>
            )}

            <div className="w-full">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text }}
              >
                City
              </label>
              <input
                type="text"
                placeholder="City..."
                value={cityFilter}
                onChange={(e) => {
                  setCityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 rounded border outline-none"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.accent + "30",
                  color: colors.text,
                }}
              />
            </div>

            {role === "admin" && (
              <div className="w-full">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  Circle AM
                </label>
                <input
                  type="text"
                  placeholder="Circle AM..."
                  value={circleAMFilter}
                  onChange={(e) => {
                    setCircleAMFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 rounded border outline-none"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent + "30",
                    color: colors.text,
                  }}
                />
              </div>
            )}

            {(role === "admin" || role === "Circle_AM") && (
              <div className="w-full">
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: colors.text }}
                >
                  Section AE
                </label>
                <input
                  type="text"
                  placeholder="Section AE..."
                  value={sectionAEFilter}
                  onChange={(e) => {
                    setSectionAEFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 rounded border outline-none"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent + "30",
                    color: colors.text,
                  }}
                />
              </div>
            )}

            <div className="w-full">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text }}
              >
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 rounded border outline-none"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.accent + "30",
                  color: colors.text,
                }}
              />
            </div>

            <div className="w-full">
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text }}
              >
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 rounded border outline-none"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.accent + "30",
                  color: colors.text,
                }}
              />
            </div>

            <div className="flex items-end w-full">
              <button
                onClick={clearFilters}
                className="px-4 cursor-pointer py-2 rounded transition-all w-full md:w-auto"
                style={{
                  backgroundColor: colors.primary + "20",
                  color: colors.primary,
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mb-4 flex items-center gap-2">
        <span
          className="text-sm font-medium"
          style={{ color: colors.textSecondary }}
        >
          Total Employees:
        </span>
        <span
          className="text-sm font-bold px-3 py-1 rounded-full flex items-center justify-center min-w-[30px]"
          style={{
            backgroundColor: colors.primary + "20",
            color: colors.primary,
            minHeight: "28px",
          }}
        >
          {loading ? <Loader size={16} /> : totalEmployees}
        </span>
      </div>

      <div
        className="rounded border shadow-sm overflow-hidden lg:min-h-[500px]"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.accent + "30",
          minHeight: "500px",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: colors.accent + "10" }}>
              <tr>
                <th
                  className="px-6 py-3 text-left text-sm font-medium whitespace-nowrap"
                  style={{ color: colors.text }}
                >
                  Sr.
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium whitespace-nowrap"
                  style={{ color: colors.text }}
                >
                  Name
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium whitespace-nowrap"
                  style={{ color: colors.text }}
                >
                  WD Code
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium whitespace-nowrap"
                  style={{ color: colors.text }}
                >
                  Branch
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium whitespace-nowrap"
                  style={{ color: colors.text }}
                >
                  Circle AM
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium whitespace-nowrap"
                  style={{ color: colors.text }}
                >
                  Section AE
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium whitespace-nowrap"
                  style={{ color: colors.text }}
                >
                  City
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium whitespace-nowrap"
                  style={{ color: colors.text }}
                >
                  Type
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium whitespace-nowrap"
                  style={{ color: colors.text }}
                >
                  Phone
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium cursor-pointer select-none group whitespace-nowrap"
                  style={{ color: colors.text }}
                  onClick={() => handleSort("totalOutlets")}
                >
                  <div className="flex items-center gap-1 hover:text-primary transition-colors">
                    Total Outlets
                    <span className="text-gray-400 group-hover:text-primary">
                      {sortBy === "totalOutlets" ? (
                        sortOrder === "desc" ? (
                          <MdArrowDownward size={16} />
                        ) : (
                          <MdArrowUpward size={16} />
                        )
                      ) : (
                        <MdArrowDownward
                          size={16}
                          className="opacity-0 group-hover:opacity-50"
                        />
                      )}
                    </span>
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium whitespace-nowrap"
                  style={{ color: colors.text }}
                >
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium whitespace-nowrap"
                  style={{ color: colors.text }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="12"
                    className="px-4 py-12 text-center"
                    style={{ color: colors.textSecondary }}
                  >
                    <Loader size={40} />
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan="12" className="text-center py-8">
                    <p style={{ color: colors.textSecondary }}>
                      No employees found
                    </p>
                  </td>
                </tr>
              ) : (
                employees.map((employee, index) => (
                  <tr
                    key={employee._id || index}
                    className="border-t"
                    style={{ borderColor: colors.accent + "20" }}
                  >
                    <td
                      className="px-6 py-4 text-sm whitespace-nowrap"
                      style={{ color: colors.text }}
                    >
                      {(currentPage - 1) * limit + index + 1}
                    </td>
                    <td
                      className="px-6 py-4 text-sm whitespace-nowrap"
                      style={{ color: colors.text }}
                    >
                      <div className="flex items-center gap-3">
                        {employee.profilePhoto?.url && (
                          <img
                            src={employee.profilePhoto.url}
                            alt={employee.dsName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        )}
                        {employee.dsName}
                      </div>
                    </td>
                    <td
                      className="px-6 py-4 text-sm whitespace-nowrap"
                      style={{ color: colors.text }}
                    >
                      {employee.wdCode || employee.WD_Code}
                    </td>
                    <td
                      className="px-6 py-4 text-sm whitespace-nowrap"
                      style={{ color: colors.text }}
                    >
                      {employee.Branch}
                    </td>
                    <td
                      className="px-6 py-4 text-sm whitespace-nowrap"
                      style={{ color: colors.text }}
                    >
                      {employee.Circle_AM || "N/A"}
                    </td>
                    <td
                      className="px-6 py-4 text-sm whitespace-nowrap"
                      style={{ color: colors.text }}
                    >
                      {employee.Section_AE || "N/A"}
                    </td>
                    <td
                      className="px-6 py-4 text-sm whitespace-nowrap"
                      style={{ color: colors.text }}
                    >
                      {employee.City}
                    </td>
                    <td
                      className="px-6 py-4 text-sm whitespace-nowrap"
                      style={{ color: colors.text }}
                    >
                      {employee.typeOfDs}
                    </td>
                    <td
                      className="px-6 py-4 text-sm whitespace-nowrap"
                      style={{ color: colors.text }}
                    >
                      {employee.dsMobile}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span style={{ color: colors.text }}>
                          {employee.addedOutlet?.length || 0}
                        </span>
                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/employees/${employee._id}/outlets`,
                            )
                          }
                          className="flex items-center gap-1 px-2 py-1 rounded text-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                          style={{
                            backgroundColor: colors.primary + "15",
                            color: colors.primary,
                            border: `1px solid ${colors.primary}30`,
                          }}
                        >
                          <MdVisibility size={14} />
                          View Outlet
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Toggle
                        active={employee.isActive}
                        onClick={() => handleStatusToggle(employee._id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            navigate(
                              `/dashboard/employees/view/${employee._id}`,
                            )
                          }
                          className="p-2 cursor-pointer rounded transition-colors"
                          style={{
                            backgroundColor: colors.primary + "20",
                            color: colors.primary,
                          }}
                          title="View"
                        >
                          <MdVisibility size={16} />
                        </button>
                        <button
                          onClick={() =>
                            handleDelete(employee._id, employee.dsName)
                          }
                          disabled={deletingId === employee._id}
                          className="p-2 cursor-pointer rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: "#dc354520",
                            color: "#dc3545",
                          }}
                          title="Delete"
                        >
                          {deletingId === employee._id ? (
                            <Loader size={16} color="#dc3545" />
                          ) : (
                            <MdDelete size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div
          className="mt-4 flex items-center justify-between"
          style={{ color: colors.text }}
        >
          <div className="text-sm">
            Showing {(currentPage - 1) * limit + 1} to{" "}
            {Math.min(currentPage * limit, totalEmployees)} of {totalEmployees}{" "}
            entries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: colors.accent + "30",
                color: colors.text,
              }}
            >
              <MdChevronLeft size={20} />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .map((page, index, array) => (
                  <React.Fragment key={page}>
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="px-2">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 cursor-pointer rounded text-sm font-medium transition-colors ${
                        currentPage === page
                          ? "bg-primary text-white"
                          : "hover:bg-gray-100"
                      }`}
                      style={{
                        backgroundColor:
                          currentPage === page ? colors.primary : "transparent",
                        color:
                          currentPage === page
                            ? colors.background
                            : colors.text,
                        border:
                          currentPage !== page
                            ? `1px solid ${colors.accent}30`
                            : "none",
                      }}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                ))}
            </div>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 cursor-pointer rounded border disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                borderColor: colors.accent + "30",
                color: colors.text,
              }}
            >
              <MdChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
