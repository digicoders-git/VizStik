import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  getEmployees,
  deleteEmployee,
  updateEmployeeStatus,
  downloadEmployeesExcel,
} from "../apis/employee";
import { getOutletFilters } from "../apis/outlet";
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
import ModernSelect from "../components/ModernSelect";
import useDebounce from "../hooks/useDebounce";

const Employees = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("admin-role");

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Search, Filter, Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [activeFilter, setActiveFilter] = useState(
    location.state?.initialStatus || "",
  );

  // Hierarchical Filter States
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedGovtDistrict, setSelectedGovtDistrict] = useState("");
  const [selectedCircleAM, setSelectedCircleAM] = useState("");
  const [selectedSectionAE, setSelectedSectionAE] = useState("");
  const [selectedTypeOfDs, setSelectedTypeOfDs] = useState("");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [showFilters, setShowFilters] = useState(
    !!location.state?.initialStatus,
  );

  const [filterOptions, setFilterOptions] = useState({
    branches: [],
    govtDistricts: [],
    circleAMs: [],
    sectionAEs: [],
    typesOfDs: [],
  });

  // Sorting state
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  // Initial Filter Options
  useEffect(() => {
    const fetchAllFilters = async () => {
      try {
        const response = await getOutletFilters();
        if (response.success) {
          setFilterOptions({
            branches: response.branches || [],
            govtDistricts: response.govtDistricts || [],
            circleAMs: response.circleAMs || [],
            sectionAEs: response.sectionAEs || [],
            typesOfDs: response.typesOfDs || [],
          });
        }
      } catch (error) {
        console.error("Error fetching filters:", error);
      }
    };
    fetchAllFilters();
  }, []);

  // Cascading Filters Logic
  useEffect(() => {
    const fetchDependentFilters = async () => {
      try {
        const response = await getOutletFilters({
          Branch: selectedBranch,
          Govt_District: selectedGovtDistrict,
          Circle_AM: selectedCircleAM,
        });
        if (response.success) {
          setFilterOptions((prev) => ({
            ...prev,
            govtDistricts: response.govtDistricts || [],
            circleAMs: response.circleAMs || [],
            sectionAEs: response.sectionAEs || [],
          }));
        }
      } catch (error) {
        console.error("Error fetching dependent filters:", error);
      }
    };
    if (selectedBranch || selectedGovtDistrict || selectedCircleAM) {
      fetchDependentFilters();
    }
  }, [selectedBranch, selectedGovtDistrict, selectedCircleAM]);

  // Main Fetch Effect
  useEffect(() => {
    fetchEmployees();
  }, [
    debouncedSearch,
    activeFilter,
    selectedBranch,
    selectedGovtDistrict,
    selectedCircleAM,
    selectedSectionAE,
    selectedTypeOfDs,
    fromDate,
    toDate,
    currentPage,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    if (location.state?.initialStatus) {
      setActiveFilter(location.state.initialStatus);
      setShowFilters(true);
    }
  }, [location.state]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const adminRole = localStorage.getItem("admin-role");
      const adminName = localStorage.getItem("admin-name");

      const params = {
        search: searchTerm,
        isActive: activeFilter,
        Branch: selectedBranch,
        Govt_District: selectedGovtDistrict,
        Circle_AM: selectedCircleAM,
        Section_AE: selectedSectionAE,
        typeOfDs: selectedTypeOfDs,
        fromDate: fromDate,
        toDate: toDate,
        limit,
        page: currentPage,
        sort: sortBy,
        order: sortOrder,
      };

      // Role based restrictions if not admin
      if (adminRole === "Branch") params.Branch = adminName;
      if (adminRole === "Circle_AM") params.Circle_AM = adminName;
      if (adminRole === "Section_AE") params.Section_AE = adminName;

      const response = await getEmployees(params);
      if (response.success) {
        setEmployees(response.data || []);
        setTotalEmployees(response.pagination?.total || 0);
        setTotalPages(response.pagination?.totalPages || 1);
      }
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
      const adminRole = localStorage.getItem("admin-role");
      const adminName = localStorage.getItem("admin-name");

      const params = {
        page: currentPage,
        limit: limit,
        search: debouncedSearch,
        active: activeFilter,
        Branch: selectedBranch,
        Govt_District: selectedGovtDistrict,
        Circle_AM: selectedCircleAM,
        Section_AE: selectedSectionAE,
        typeOfDs: selectedTypeOfDs,
        fromDate,
        toDate,
        sortBy,
        sortOrder,
      };

      if (adminRole === "Branch") params.Branch = adminName;
      if (adminRole === "Circle_AM") params.Circle_AM = adminName;
      if (adminRole === "Section_AE") params.Section_AE = adminName;

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
        toast.error("Failed to delete employee");
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
      toast.error("Failed to update status");
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "desc" ? "asc" : "desc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilter("");
    setSelectedBranch("");
    setSelectedGovtDistrict("");
    setSelectedCircleAM("");
    setSelectedSectionAE("");
    setSelectedTypeOfDs("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Manage Employees
          </h1>
          <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>
            View and manage all registered employees
          </p>
        </div>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="flex items-center cursor-pointer gap-2 px-6 py-2.5 rounded transition-all hover:opacity-90 shadow-sm border font-semibold"
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
          <span>{downloading ? "Downloading Excel..." : "Download Excel"}</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MdSearch
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: colors.textSecondary }}
            />
            <input
              type="text"
              placeholder="Search by name, mobile, WD code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded border outline-none transition-all shadow-sm"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.accent + "30",
                color: colors.text,
              }}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded border transition-all font-medium"
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

        {showFilters && (
          <div
            className="flex flex-col gap-6 p-6 rounded border shadow-sm"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "30",
            }}
          >
            {/* Row 1: Dates & Branch (Branch/District visible only to admin) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label
                  className="block text-xs font-semibold uppercase mb-2"
                  style={{ color: colors.textSecondary }}
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
              <div>
                <label
                  className="block text-xs font-semibold uppercase mb-2"
                  style={{ color: colors.textSecondary }}
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

              {role === "admin" && (
                <>
                  <div>
                    <label
                      className="block text-xs font-semibold uppercase mb-2"
                      style={{ color: colors.textSecondary }}
                    >
                      Branch
                    </label>
                    <ModernSelect
                      options={["All Branches", ...filterOptions.branches]}
                      value={selectedBranch || "All Branches"}
                      onChange={(val) => {
                        const actualVal = val === "All Branches" ? "" : val;
                        setSelectedBranch(actualVal);
                        setSelectedGovtDistrict("");
                        setSelectedCircleAM("");
                        setSelectedSectionAE("");
                        setCurrentPage(1);
                      }}
                      placeholder="Select Branch"
                      disabled={role !== "admin"}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold uppercase mb-2"
                      style={{ color: colors.textSecondary }}
                    >
                      Govt District
                    </label>
                    <ModernSelect
                      options={[
                        "All Districts",
                        ...filterOptions.govtDistricts,
                      ]}
                      value={selectedGovtDistrict || "All Districts"}
                      onChange={(val) => {
                        const actualVal = val === "All Districts" ? "" : val;
                        setSelectedGovtDistrict(actualVal);
                        setSelectedCircleAM("");
                        setSelectedSectionAE("");
                        setCurrentPage(1);
                      }}
                      disabled={!selectedBranch && role === "admin"}
                      placeholder="Select District"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Row 2: Roles (Circle/Section visible only to admin) & Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {role === "admin" && (
                <>
                  <div>
                    <label
                      className="block text-xs font-semibold uppercase mb-2"
                      style={{ color: colors.textSecondary }}
                    >
                      Circle AM
                    </label>
                    <ModernSelect
                      options={["All Circle AM", ...filterOptions.circleAMs]}
                      value={selectedCircleAM || "All Circle AM"}
                      onChange={(val) => {
                        const actualVal = val === "All Circle AM" ? "" : val;
                        setSelectedCircleAM(actualVal);
                        setSelectedSectionAE("");
                        setCurrentPage(1);
                      }}
                      placeholder="Select Circle AM"
                      disabled={
                        (!selectedGovtDistrict && role === "admin") ||
                        role === "Circle_AM" ||
                        role === "Section_AE"
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-semibold uppercase mb-2"
                      style={{ color: colors.textSecondary }}
                    >
                      Section AE
                    </label>
                    <ModernSelect
                      options={["All Section AE", ...filterOptions.sectionAEs]}
                      value={selectedSectionAE || "All Section AE"}
                      onChange={(val) => {
                        setSelectedSectionAE(
                          val === "All Section AE" ? "" : val,
                        );
                        setCurrentPage(1);
                      }}
                      placeholder="Select Section AE"
                      disabled={
                        (!selectedCircleAM && role === "admin") ||
                        role === "Section_AE"
                      }
                    />
                  </div>
                </>
              )}
              <div>
                <label
                  className="block text-xs font-semibold uppercase mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Type of DS
                </label>
                <ModernSelect
                  options={["All Types", ...filterOptions.typesOfDs]}
                  value={selectedTypeOfDs || "All Types"}
                  onChange={(val) => {
                    setSelectedTypeOfDs(val === "All Types" ? "" : val);
                    setCurrentPage(1);
                  }}
                  placeholder="Select Type"
                />
              </div>
              <div>
                <label
                  className="block text-xs font-semibold uppercase mb-2"
                  style={{ color: colors.textSecondary }}
                >
                  Status
                </label>
                <ModernSelect
                  options={["All Status", "Active", "Inactive"]}
                  value={
                    activeFilter === ""
                      ? "All Status"
                      : activeFilter === "true"
                        ? "Active"
                        : "Inactive"
                  }
                  onChange={(val) => {
                    setActiveFilter(
                      val === "All Status"
                        ? ""
                        : val === "Active"
                          ? "true"
                          : "false",
                    );
                    setCurrentPage(1);
                  }}
                  placeholder="Select Status"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={clearFilters}
                className="px-6 py-2.5 rounded font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                style={{
                  backgroundColor: colors.primary + "15",
                  color: colors.primary,
                  border: `1px solid ${colors.primary}30`,
                }}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

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
