import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { getOutlets, deleteOutlet, downloadOutletsExcel } from "../apis/outlet";
import {
  MdSearch,
  MdDelete,
  MdVisibility,
  MdFilterList,
  MdChevronLeft,
  MdChevronRight,
  MdMap,
  MdDownload,
  MdClose,
} from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import Loader from "../components/ui/Loader";
import { toast } from "react-toastify";

const ManageOutlet = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [totalOutlets, setTotalOutlets] = useState(0);

  const fetchOutlets = async () => {
    try {
      setLoading(true);
      const role = localStorage.getItem("admin-role");
      const username = localStorage.getItem("admin-name");

      const params = {
        page: currentPage,
        limit: limit,
        search: searchTerm,
        fromDate,
        toDate,
      };

      if (role === "Branch") {
        params.Branch = username;
      } else if (role === "Circle_AM") {
        params.Circle_AM = username;
      } else if (role === "Section_AE") {
        params.Section_AE = username;
      }

      const response = await getOutlets(params);

      if (response.success) {
        setOutlets(response.data || []);
        setTotalOutlets(response.pagination?.total || 0);
        setTotalPages(response.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error("Error fetching outlets:", error);
      setOutlets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOutlets();
  }, [currentPage, searchTerm, fromDate, toDate]);

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setDeletingId(id);
        try {
          await deleteOutlet(id);
          await fetchOutlets();
          Swal.fire("Deleted!", "Outlet has been deleted.", "success");
        } catch (error) {
          Swal.fire("Error!", "Failed to delete outlet.", "error");
        } finally {
          setDeletingId(null);
        }
      }
    });
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const role = localStorage.getItem("admin-role");
      const username = localStorage.getItem("admin-name");
      const params = {};
      if (role === "Branch") {
        params.Branch = username;
      } else if (role === "Circle_AM") {
        params.Circle_AM = username;
      } else if (role === "Section_AE") {
        params.Section_AE = username;
      }
      await downloadOutletsExcel(params);
      toast.success("Excel downloaded successfully");
    } catch (error) {
      toast.error("Failed to download excel");
    } finally {
      setDownloading(false);
    }
  };

  const handleView = (id) => {
    navigate(`/dashboard/outlets/view/${id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFromDate("");
    setToDate("");
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
            Manage Outlets
          </h1>
          <p
            className="text-sm md:text-base"
            style={{ color: colors.textSecondary }}
          >
            View and manage all registered outlets
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center cursor-pointer gap-2 px-4 py-2.5 rounded transition-all hover:opacity-90 shadow-sm border"
            style={{
              backgroundColor: colors.accent + "10",
              color: colors.primary,
              borderColor: colors.primary,
            }}
          >
            {downloading ? (
              <Loader size={20} color={colors.primary} />
            ) : (
              <MdDownload size={20} />
            )}
            <span>Download Excel</span>
          </button>
          <button
            onClick={() => navigate("/dashboard/outlets/map")}
            className="flex items-center cursor-pointer gap-2 px-4 py-2.5 rounded transition-all hover:opacity-90 shadow-sm"
            style={{
              backgroundColor: colors.primary,
              color: colors.background,
            }}
          >
            <MdMap size={20} />
            <span>View On Map</span>
          </button>
        </div>
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
              placeholder="Search by activity or mobile..."
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

        {showFilters && (
          <div
            className="flex flex-col md:flex-row gap-4 p-4 rounded border"
            style={{
              backgroundColor: colors.sidebar || colors.background,
              borderColor: colors.accent + "30",
            }}
          >
            <div className="flex-1">
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
            <div className="flex-1">
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
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 cursor-pointer py-2 rounded transition-all"
                style={{
                  backgroundColor: colors.primary + "20",
                  color: colors.primary,
                }}
              >
                Clear Filters
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
          Total Outlets:
        </span>
        <span
          className="text-sm font-bold px-3 py-1 rounded-full flex items-center justify-center min-w-[30px]"
          style={{
            backgroundColor: colors.primary + "20",
            color: colors.primary,
            minHeight: "28px",
          }}
        >
          {loading ? <Loader size={16} /> : totalOutlets}
        </span>
      </div>

      <div
        className="w-full overflow-auto rounded border"
        style={{ borderColor: colors.accent + "30", minHeight: "500px" }}
      >
        <table className="w-full">
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
                Activity
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-semibold border-b"
                style={{
                  color: colors.text,
                  borderColor: colors.accent + "30",
                }}
              >
                Image
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-semibold border-b"
                style={{
                  color: colors.text,
                  borderColor: colors.accent + "30",
                }}
              >
                Mobile
              </th>
              <th
                className="px-4 py-3 text-left text-sm font-semibold border-b"
                style={{
                  color: colors.text,
                  borderColor: colors.accent + "30",
                }}
              >
                Employee
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
                Created At
              </th>
              <th
                className="px-4 py-3 text-center text-sm font-semibold border-b"
                style={{
                  color: colors.text,
                  borderColor: colors.accent + "30",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-12 text-center"
                  style={{ color: colors.textSecondary }}
                >
                  <Loader size={40} />
                </td>
              </tr>
            ) : outlets.length === 0 ? (
              <tr>
                <td
                  colSpan="8"
                  className="px-4 py-8 text-center"
                  style={{ color: colors.textSecondary }}
                >
                  No outlets found
                </td>
              </tr>
            ) : (
              outlets.map((outlet, index) => (
                <tr
                  key={outlet._id}
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
                    className="px-4 py-3 text-sm font-medium"
                    style={{ color: colors.primary }}
                  >
                    {outlet.activity}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {outlet.outletImages && outlet.outletImages.length > 0 ? (
                      <img
                        src={outlet.outletImages[0].url}
                        alt="Outlet"
                        className="w-10 h-10 rounded object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() =>
                          setSelectedImage(outlet.outletImages[0].url)
                        }
                      />
                    ) : (
                      <div
                        className="w-10 h-10 rounded flex items-center justify-center text-[10px]"
                        style={{
                          backgroundColor: colors.accent + "10",
                          color: colors.textSecondary,
                        }}
                      >
                        No Image
                      </div>
                    )}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: colors.text }}
                  >
                    {outlet.outletMobile}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: colors.text }}
                  >
                    {outlet.createdBy?.dsName || "Unknown"}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: colors.text }}
                  >
                    {outlet.createdBy?.WD_Code || "N/A"}
                  </td>
                  <td
                    className="px-4 py-3 text-sm"
                    style={{ color: colors.text }}
                  >
                    {formatDate(outlet.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleView(outlet._id)}
                        className="p-2 cursor-pointer rounded transition-all"
                        style={{ color: colors.primary }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            colors.primary + "20")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                        title="View Outlet"
                      >
                        <MdVisibility className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(outlet._id)}
                        className="p-2 cursor-pointer rounded transition-all flex items-center justify-center"
                        disabled={deletingId === outlet._id}
                        style={{
                          color: "#DC2626",
                          width: "32px",
                          height: "32px",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#DC262620")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor =
                            "transparent")
                        }
                        title="Delete Outlet"
                      >
                        {deletingId === outlet._id ? (
                          <Loader size={16} color="#DC2626" />
                        ) : (
                          <MdDelete className="w-5 h-5" />
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

      {/* Pagination Controls */}
      {!loading && totalPages > 1 && (
        <div
          className="mt-4 flex items-center justify-between mb-10"
          style={{ color: colors.text }}
        >
          <div className="text-sm">
            Showing {(currentPage - 1) * limit + 1} to{" "}
            {Math.min(currentPage * limit, totalOutlets)} of {totalOutlets}{" "}
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

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-1000 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <MdClose size={40} />
          </button>
          <img
            src={selectedImage}
            alt="Full view"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default ManageOutlet;
