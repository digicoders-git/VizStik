import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getOutletById } from "../apis/outlet";
import {
  MdArrowBack,
  MdLocationOn,
  MdPhone,
  MdEmail,
  MdAccessTime,
  MdStore,
  MdMap,
  MdClose,
  MdNearMe,
} from "react-icons/md";
import Loader from "../components/ui/Loader";
import { toast } from "react-toastify";

const ViewOutlet = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();

  const [outlet, setOutlet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const tabs = ["Overview", "Employee", "Location", "Images"];
  // console.log(outlet);

  useEffect(() => {
    const fetchOutlet = async () => {
      try {
        setLoading(true);
        const response = await getOutletById(id);

        if (response.success) {
          setOutlet(response.data);
        } else {
          toast.error("Outlet not found");
          navigate("/dashboard/outlets");
        }
      } catch (error) {
        toast.error("Failed to load outlet details");
        navigate("/dashboard/outlets");
      } finally {
        setLoading(false);
      }
    };

    fetchOutlet();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader size={60} />
      </div>
    );
  }

  if (!outlet) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p style={{ color: colors.textSecondary }}>Outlet not found</p>
      </div>
    );
  }

  const InfoRow = ({ label, value, icon: Icon }) => (
    <div
      className="flex items-start gap-3 p-3 rounded"
      style={{ backgroundColor: colors.accent + "10" }}
    >
      {Icon && (
        <Icon className="w-5 h-5 mt-0.5" style={{ color: colors.primary }} />
      )}
      <div className="flex-1">
        <p
          className="text-sm font-medium mb-1"
          style={{ color: colors.textSecondary }}
        >
          {label}
        </p>
        <div className="text-base" style={{ color: colors.text }}>
          {value || "N/A"}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      <div className="flex-none mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/dashboard/outlets")}
          className="p-2 rounded transition-all"
          style={{ color: colors.primary }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = colors.primary + "20")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <MdArrowBack className="w-6 h-6" />
        </button>
        <div>
          <h1
            className="text-2xl md:text-3xl font-bold"
            style={{ color: colors.text }}
          >
            Outlet Details
          </h1>
          <p
            className="text-sm md:text-base"
            style={{ color: colors.textSecondary }}
          >
            {outlet.activity}
          </p>
        </div>
      </div>

      <div
        className="flex-none flex items-center gap-4 border-b mb-6"
        style={{ borderColor: colors.accent + "30" }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 cursor-pointer text-sm font-medium transition-colors relative`}
            style={{
              color: activeTab === tab ? colors.primary : colors.textSecondary,
            }}
          >
            {tab}
            {activeTab === tab && (
              <div
                className="absolute bottom-0 left-0 w-full h-0.5"
                style={{ backgroundColor: colors.primary }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === "Overview" && (
          <div className="space-y-6">
            <div>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: colors.text }}
              >
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow
                  label="Activity"
                  value={outlet.activity}
                  icon={MdStore}
                />
                <InfoRow
                  label="Outlet Mobile"
                  value={outlet.outletMobile}
                  icon={MdPhone}
                />
                <InfoRow
                  label="Outlet Name"
                  value={outlet.outletName}
                  icon={MdNearMe}
                />
                <InfoRow
                  label="Created At"
                  value={new Date(outlet.createdAt).toLocaleString("en-IN")}
                />
                <InfoRow
                  label="Updated At"
                  value={new Date(outlet.updatedAt).toLocaleString("en-IN")}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Employee" && (
          <div className="space-y-6">
            <div>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: colors.text }}
              >
                Employee Information
              </h2>
              {outlet.createdBy ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow label="Name" value={outlet.createdBy.dsName} />
                  <InfoRow label="WD Code" value={outlet.createdBy.WD_Code} />
                  <InfoRow
                    label="Phone"
                    value={outlet.createdBy.dsMobile}
                    icon={MdPhone}
                  />
                  <InfoRow label="Type" value={outlet.createdBy.typeOfDs} />
                </div>
              ) : (
                <p style={{ color: colors.textSecondary }}>
                  No employee information available.
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "Location" && (
          <div className="space-y-6">
            <div>
              <h2
                className="text-xl font-semibold mb-4"
                style={{ color: colors.text }}
              >
                Location Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow
                  label="Coordinates"
                  value={
                    <div className="flex items-center justify-between">
                      <span>{`${outlet.location?.latitude || ""}, ${
                        outlet.location?.longitude || ""
                      }`}</span>
                      {outlet.location?.latitude &&
                        outlet.location?.longitude && (
                          <button
                            onClick={() => setShowMapModal(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium cursor-pointer transition-all hover:opacity-90"
                            style={{
                              backgroundColor: colors.primary,
                              color: colors.background,
                            }}
                          >
                            <MdMap size={16} />
                            View Map
                          </button>
                        )}
                    </div>
                  }
                  icon={MdLocationOn}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Images" && (
          <div className="space-y-6">
            {outlet.outletImages && outlet.outletImages.length > 0 ? (
              <div>
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: colors.text }}
                >
                  Outlet Images
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {outlet.outletImages.map((image, index) => (
                    <div
                      key={index}
                      className="rounded overflow-hidden border cursor-pointer hover:opacity-90 transition-opacity"
                      style={{ borderColor: colors.accent + "30" }}
                      onClick={() => setSelectedImage(image.url)}
                    >
                      <img
                        src={image.url}
                        alt={`Outlet ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <p style={{ color: colors.textSecondary }}>
                  No images available for this outlet.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div
            className="relative w-full max-w-4xl h-[80vh] rounded overflow-hidden shadow-2xl flex flex-col"
            style={{ backgroundColor: colors.background }}
          >
            <div
              className="flex items-center justify-between p-4 border-b"
              style={{ borderColor: colors.accent + "30" }}
            >
              <div className="flex items-center gap-3">
                <MdLocationOn
                  className="w-6 h-6"
                  style={{ color: colors.primary }}
                />
                <div>
                  <h3
                    className="text-lg font-bold"
                    style={{ color: colors.text }}
                  >
                    Outlet Location
                  </h3>
                  <p
                    className="text-xs"
                    style={{ color: colors.textSecondary }}
                  >
                    {" "}
                    {`${outlet.location?.latitude}, ${outlet.location?.longitude}`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="p-2 cursor-pointer rounded-full hover:bg-black/5 transition-colors absolute top-4 right-4 z-10 bg-white shadow"
              >
                <MdClose size={24} />
              </button>
            </div>

            <div className="flex-1 w-full h-full bg-gray-100">
              <iframe
                title="Outlet Location"
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${outlet.location?.latitude},${outlet.location?.longitude}&z=15&output=embed`}
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-100 bg-black bg-opacity-90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 cursor-pointer text-white hover:text-gray-300 transition-colors"
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

export default ViewOutlet;
