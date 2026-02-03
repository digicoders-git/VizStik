import React, { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { getEmployeeById } from "../apis/employee";
import { downloadOutletsExcel } from "../apis/outlet";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  MdArrowBack,
  MdStore,
  MdPerson,
  MdPhone,
  MdLocationOn,
  MdChevronLeft,
  MdChevronRight,
  MdDownload,
  MdImage,
  MdClose,
  MdWarning,
  MdInfo,
} from "react-icons/md";
import Loader from "../components/ui/Loader";
import Swal from "sweetalert2";

const EmployeeAddedOutlets = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadingImages, setDownloadingImages] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const itemsPerPage = 10;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      const response = await getEmployeeById(id);
      if (response) {
        setEmployee(response);
      } else {
        toast.error("Employee not found");
        navigate("/dashboard/employees");
      }
    } catch (error) {
      toast.error("Failed to fetch employee details");
      navigate("/dashboard/employees");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (outlets.length > 50000) {
      Swal.fire({
        icon: "error",
        title: "Download Limit Exceeded",
        text: "You cannot download more than 50k outlets",
        confirmButtonColor: colors.primary,
      });
      return;
    }
    try {
      setDownloading(true);
      await downloadOutletsExcel(id);
      toast.success("Excel downloaded successfully");
    } catch (error) {
      toast.error("Failed to download excel");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadImages = async () => {
    const total = outlets.length;
    if (total > 20000) {
      const result = await Swal.fire({
        icon: "warning",
        title: "High Image Volume",
        text: `You have selected ${total} outlets. Downloading images for such a large dataset can be slow. For the best experience, we recommend keeping the count under 20,000. Do you want to proceed?`,
        showCancelButton: true,
        confirmButtonColor: colors.primary,
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, Proceed",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;
    }
    try {
      setDownloadingImages(true);
      await downloadOutletsImagesZip({ employeeId: id });
      toast.success("Images zip downloaded successfully");
    } catch (error) {
      toast.error(error.message || "Failed to download images zip");
    } finally {
      setDownloadingImages(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size={60} />
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  const outlets = employee.addedOutlet || [];

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 cursor-pointer rounded transition-colors"
            style={{
              backgroundColor: colors.accent + "20",
              color: colors.text,
            }}
          >
            <MdArrowBack size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
              Outlets Added by {employee.dsName}
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Total Outlets: {outlets.length}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center cursor-pointer gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded transition-all shadow-sm text-[10px] sm:text-xs md:text-sm font-semibold"
            style={{
              backgroundColor:
                outlets.length > 50000
                  ? colors.textSecondary + "20"
                  : colors.primary,
              color:
                outlets.length > 50000
                  ? colors.textSecondary
                  : colors.background,
              cursor: outlets.length > 50000 ? "not-allowed" : "pointer",
              opacity: outlets.length > 50000 ? 0.7 : 1,
            }}
          >
            {downloading ? (
              <Loader size={18} color={colors.background} />
            ) : (
              <MdDownload size={18} className="md:size-5" />
            )}
            <span>{downloading ? "Downloading..." : "Download Excel"}</span>
          </button>

          <button
            onClick={handleDownloadImages}
            disabled={downloadingImages}
            className="flex items-center cursor-pointer gap-2 px-3 py-2 md:px-5 md:py-2.5 rounded transition-all shadow-sm text-[10px] sm:text-xs md:text-sm font-semibold"
            style={{
              backgroundColor: colors.accent + "10",
              color: colors.primary,
              border: `1px solid ${colors.primary}`,
            }}
          >
            {downloadingImages ? (
              <Loader size={18} color={colors.primary} />
            ) : (
              <MdDownload size={18} className="md:size-5" />
            )}
            <span>
              {downloadingImages ? "Creating Zip..." : "Download Images"}
            </span>
          </button>
        </div>
      </div>

      {outlets.length > 50000 && (
        <div
          className="mb-4 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-sm"
          style={{
            backgroundColor: "#fff5f5",
            borderColor: "#feb2b2",
            color: "#c53030",
          }}
        >
          <MdWarning size={22} />
          <p className="text-sm font-medium">
            <span className="font-bold underline">Restriction Note:</span> Excel
            download is restricted to 50,000+ Outlets. Please apply filters to
            reduce the count.
          </p>
        </div>
      )}

      {outlets.length > 20000 && (
        <div
          className="mb-6 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-sm"
          style={{
            backgroundColor: "#fffbeb",
            borderColor: "#fde68a",
            color: "#92400e",
          }}
        >
          <MdInfo size={22} />
          <p className="text-sm font-medium">
            <span className="font-bold underline">Note:</span> To ensure a
            smooth image download, we recommend selecting fewer than 20,000
            outlets using available filters.
          </p>
        </div>
      )}

      <div
        className="mb-8 p-6 rounded border shadow-sm flex flex-wrap items-center gap-6"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.accent + "30",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ backgroundColor: colors.primary + "20" }}
          >
            <MdPerson size={32} style={{ color: colors.primary }} />
          </div>
          <div>
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>
              {employee.dsName}
            </h2>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {employee.typeOfDs}
            </p>
          </div>
        </div>

        <div
          className="h-10 w-px bg-gray-200 hidden md:block"
          style={{ backgroundColor: colors.accent + "30" }}
        ></div>

        <div className="flex flex-col gap-1">
          <div
            className="flex items-center gap-2 text-sm"
            style={{ color: colors.text }}
          >
            <MdPhone size={16} style={{ color: colors.primary }} />
            {employee.dsMobile}
          </div>
          <div className="text-sm" style={{ color: colors.textSecondary }}>
            WD Code: {employee.WD_Code}
          </div>
        </div>
      </div>

      <div
        className="rounded border shadow-sm overflow-hidden"
        style={{
          backgroundColor: colors.background,
          borderColor: colors.accent + "30",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: colors.accent + "10" }}>
              <tr>
                <th
                  className="px-6 py-3 text-left text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  Activity
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  Image
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  Mobile
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  Location
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  WD Code
                </th>
                <th
                  className="px-6 py-3 text-left text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  Added On
                </th>
                <th
                  className="px-6 py-3 text-center text-sm font-medium"
                  style={{ color: colors.text }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {outlets.length > 0 ? (
                [...outlets]
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(
                    (currentPage - 1) * itemsPerPage,
                    currentPage * itemsPerPage,
                  )
                  .map((outlet, index) => (
                    <tr
                      key={outlet._id || index}
                      className="border-t hover:bg-opacity-50 transition-colors"
                      style={{
                        borderColor: colors.accent + "20",
                      }}
                    >
                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: colors.text }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="p-2 rounded"
                            style={{ backgroundColor: colors.primary + "10" }}
                          >
                            <MdStore
                              size={20}
                              style={{ color: colors.primary }}
                            />
                          </div>
                          <div>
                            <div className="font-medium">
                              {outlet.activity || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {outlet.outletImages &&
                        outlet.outletImages.length > 0 ? (
                          <img
                            src={outlet.outletImages[0].url}
                            alt="Outlet"
                            className="w-12 h-12 rounded object-cover cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              setSelectedImage(outlet.outletImages[0].url)
                            }
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded flex items-center justify-center text-xs"
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
                        className="px-6 py-4 text-sm"
                        style={{ color: colors.text }}
                      >
                        {outlet.outletMobile || "N/A"}
                      </td>
                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: colors.text }}
                      >
                        <div className="flex items-center gap-1">
                          <MdLocationOn size={16} className="opacity-50" />
                          {outlet.location?.latitude || "?"},{" "}
                          {outlet.location?.longitude || "?"}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: colors.text }}
                      >
                        {employee.WD_Code}
                      </td>
                      <td
                        className="px-6 py-4 text-sm"
                        style={{ color: colors.text }}
                      >
                        {formatDate(outlet.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() =>
                              navigate(`/dashboard/outlets/view/${outlet._id}`)
                            }
                            className="px-3 py-1.5 rounded text-xs font-medium cursor-pointer transition-all hover:opacity-90"
                            style={{
                              backgroundColor: colors.primary,
                              color: colors.background,
                            }}
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center"
                    style={{ color: colors.textSecondary }}
                  >
                    No outlets added by this employee yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {outlets.length > itemsPerPage && (
        <div
          className="mt-4 flex items-center justify-between"
          style={{ color: colors.text }}
        >
          <div className="text-sm">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, outlets.length)} of{" "}
            {outlets.length} entries
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
              {Array.from(
                { length: Math.ceil(outlets.length / itemsPerPage) },
                (_, i) => i + 1,
              )
                .filter((page) => {
                  const totalPages = Math.ceil(outlets.length / itemsPerPage);
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
                      className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
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
                setCurrentPage((prev) =>
                  Math.min(prev + 1, Math.ceil(outlets.length / itemsPerPage)),
                )
              }
              disabled={
                currentPage === Math.ceil(outlets.length / itemsPerPage)
              }
              className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="fixed inset-0 z-999 bg-black bg-opacity-90 flex items-center justify-center p-4"
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

export default EmployeeAddedOutlets;
