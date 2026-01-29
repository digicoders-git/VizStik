import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { getPrefieldsAdmin, downloadPrefieldsExcel } from "../apis/prefield";
import { getOutletFilters } from "../apis/outlet";
import {
  MdSearch,
  MdChevronLeft,
  MdChevronRight,
  MdDownload,
  MdFilterList,
} from "react-icons/md";
import Loader from "../components/ui/Loader";
import { toast } from "react-toastify";
import ModernSelect from "../components/ModernSelect";
import useDebounce from "../hooks/useDebounce";

const ManagePrefield = () => {
  const { colors } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  // Search, Filter, Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCircleAM, setSelectedCircleAM] = useState("");
  const [selectedSectionAE, setSelectedSectionAE] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [filterOptions, setFilterOptions] = useState({
    branches: [],
    circleAMs: [],
    sectionAEs: [],
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(25);
  const [totalItems, setTotalItems] = useState(0);

  const role = localStorage.getItem("admin-role");
  const adminName = localStorage.getItem("admin-name");

  // Initial Filter Options
  useEffect(() => {
    const fetchAllFilters = async () => {
      try {
        const response = await getOutletFilters();
        if (response.success) {
          setFilterOptions({
            branches: response.branches || [],
            circleAMs: response.circleAMs || [],
            sectionAEs: response.sectionAEs || [],
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
          Circle_AM: selectedCircleAM,
        });
        if (response.success) {
          setFilterOptions((prev) => ({
            ...prev,
            circleAMs: response.circleAMs || [],
            sectionAEs: response.sectionAEs || [],
          }));
        }
      } catch (error) {
        console.error("Error fetching dependent filters:", error);
      }
    };
    if (selectedBranch || selectedCircleAM) {
      fetchDependentFilters();
    }
  }, [selectedBranch, selectedCircleAM]);

  const fetchPrefields = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: limit,
        search: debouncedSearch,
        Branch: selectedBranch,
        Circle_AM: selectedCircleAM,
        Section_AE: selectedSectionAE,
      };

      // Role based restrictions
      if (role === "Branch") params.Branch = adminName;
      if (role === "Circle_AM") params.Circle_AM = adminName;
      if (role === "Section_AE") params.Section_AE = adminName;

      const response = await getPrefieldsAdmin(params);
      if (response.success) {
        setData(response.data || []);
        setTotalItems(response.pagination?.total || 0);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching prefields:", error);
      toast.error("Failed to load prefield data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrefields();
  }, [
    currentPage,
    debouncedSearch,
    selectedBranch,
    selectedCircleAM,
    selectedSectionAE,
  ]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const params = {
        search: debouncedSearch,
        Branch: selectedBranch,
        Circle_AM: selectedCircleAM,
        Section_AE: selectedSectionAE,
      };

      if (role === "Branch") params.Branch = adminName;
      if (role === "Circle_AM") params.Circle_AM = adminName;
      if (role === "Section_AE") params.Section_AE = adminName;

      await downloadPrefieldsExcel(params);
      toast.success("Excel downloaded successfully");
    } catch (error) {
      toast.error("Failed to download excel");
    } finally {
      setDownloading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBranch("");
    setSelectedCircleAM("");
    setSelectedSectionAE("");
    setCurrentPage(1);
  };

  return (
    <div className="w-full h-fit flex flex-col p-6">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ color: colors.text }}
          >
            Manage Prefield
          </h1>
          <p
            className="text-sm md:text-base"
            style={{ color: colors.textSecondary }}
          >
            Manage and view all prefield master data
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
              placeholder="Search by WD Code, City, District..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
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
            className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded border shadow-sm"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "30",
            }}
          >
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
                      setSelectedBranch(val === "All Branches" ? "" : val);
                      setSelectedCircleAM("");
                      setSelectedSectionAE("");
                      setCurrentPage(1);
                    }}
                    placeholder="Select Branch"
                  />
                </div>
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
                      setSelectedCircleAM(val === "All Circle AM" ? "" : val);
                      setSelectedSectionAE("");
                      setCurrentPage(1);
                    }}
                    placeholder="Select Circle AM"
                    disabled={!selectedBranch}
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
                      setSelectedSectionAE(val === "All Section AE" ? "" : val);
                      setCurrentPage(1);
                    }}
                    placeholder="Select Section AE"
                    disabled={!selectedCircleAM}
                  />
                </div>
              </>
            )}

            {role !== "admin" && (
              <div className="md:col-span-3 text-center py-4">
                <p style={{ color: colors.textSecondary }}>
                  No additional filters available for your role.
                </p>
              </div>
            )}

            <div className="md:col-span-3 flex justify-end">
              <button
                onClick={clearFilters}
                className="px-6 py-2 rounded font-semibold transition-all hover:bg-opacity-80 cursor-pointer"
                style={{
                  backgroundColor: colors.primary + "15",
                  color: colors.primary,
                  border: `1px solid ${colors.primary}30`,
                }}
              >
                Clear All
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
          Total Prefields:
        </span>
        <span
          className="text-sm font-bold px-3 py-1 rounded-full flex items-center justify-center min-w-[30px]"
          style={{
            backgroundColor: colors.primary + "20",
            color: colors.primary,
            minHeight: "28px",
          }}
        >
          {loading ? <Loader size={16} /> : totalItems}
        </span>
      </div>

      <div
        className="w-full overflow-auto rounded border"
        style={{ borderColor: colors.accent + "30", minHeight: "400px" }}
      >
        <table className="w-full border-collapse">
          <thead
            className="sticky top-0 z-10"
            style={{ backgroundColor: colors.sidebar || colors.background }}
          >
            <tr>
              <th
                className="px-4 py-3 text-left text-sm font-semibold border-b"
                style={{
                  color: colors.text,
                  borderColor: colors.accent + "30",
                }}
              >
                Sr.
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-semibold border-b"
                style={{
                  color: colors.text,
                  borderColor: colors.accent + "30",
                }}
              >
                WD Code
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-semibold border-b"
                style={{
                  color: colors.text,
                  borderColor: colors.accent + "30",
                }}
              >
                Branch
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-semibold border-b"
                style={{
                  color: colors.text,
                  borderColor: colors.accent + "30",
                }}
              >
                Govt District
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-semibold border-b"
                style={{
                  color: colors.text,
                  borderColor: colors.accent + "30",
                }}
              >
                Circle AM
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-semibold border-b"
                style={{
                  color: colors.text,
                  borderColor: colors.accent + "30",
                }}
              >
                Section AE
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-semibold border-b"
                style={{
                  color: colors.text,
                  borderColor: colors.accent + "30",
                }}
              >
                City
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" className="px-4 py-12 text-center">
                  <Loader size={40} />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-8 text-center"
                  style={{ color: colors.textSecondary }}
                >
                  No data found
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr
                  key={item._id}
                  className="border-b transition-colors hover:bg-opacity-50"
                  style={{ borderColor: colors.accent + "20" }}
                >
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: colors.textSecondary }}
                  >
                    {(currentPage - 1) * limit + index + 1}
                  </td>
                  <td
                    className="px-4 py-3 text-sm font-bold"
                    style={{ color: colors.primary }}
                  >
                    {item.WD_Code}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: colors.text }}
                  >
                    {item.Branch}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: colors.text }}
                  >
                    {item.Govt_District}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: colors.text }}
                  >
                    {item.Circle_AM}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: colors.text }}
                  >
                    {item.Section_AE}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: colors.text }}
                  >
                    {item.City}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div
          className="mt-6 flex items-center justify-between mb-10"
          style={{ color: colors.text }}
        >
          <div className="text-sm">
            Showing {(currentPage - 1) * limit + 1} to{" "}
            {Math.min(currentPage * limit, totalItems)} of {totalItems} records
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 cursor-pointer rounded border disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{
                borderColor: colors.accent + "30",
                color: colors.text,
              }}
            >
              <MdChevronLeft size={20} />
            </button>
            <div className="flex gap-1">
              {/* Simple pagination logic for many pages */}
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
                      <span className="px-2 self-center">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 cursor-pointer rounded text-sm font-medium transition-all ${
                        currentPage === page ? "shadow-md" : "hover:bg-gray-100"
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
              className="p-2 cursor-pointer rounded border disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

export default ManagePrefield;
