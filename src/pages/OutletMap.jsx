import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getOutlets } from "../apis/outlet";
import { useTheme } from "../context/ThemeContext";
import Loader from "../components/ui/Loader";
import {
  MdArrowBack,
  MdStore,
  MdPerson,
  MdPhone,
  MdLocationOn,
} from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import L from "leaflet";

// Fix for default marker icon in React-Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

L.Marker.prototype.options.icon = DefaultIcon;

const OutletMap = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOutlets = async () => {
      try {
        setLoading(true);
        const data = await getOutlets({ limit: 10000 });
        const fetchedOutlets = data.data || [];
        const validOutlets = fetchedOutlets.filter(
          (o) => o.location && o.location.latitude && o.location.longitude
        );
        setOutlets(validOutlets);
      } catch (error) {
        toast.error("Failed to load outlets for map");
      } finally {
        setLoading(false);
      }
    };
    fetchOutlets();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader size={60} />
      </div>
    );
  }

  const defaultCenter = [20.5937, 78.9629];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-none mb-1 flex items-center justify-between p-1 pb-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/outlets")}
            className="p-2 cursor-pointer rounded transition-all"
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
            <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
              Outlet Locations
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Showing {outlets.length} outlets on map
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-2 relative z-0">
        <div
          className="w-full h-full rounded overflow-hidden border shadow-lg"
          style={{ borderColor: colors.accent + "30" }}
        >
          <MapContainer
            center={defaultCenter}
            zoom={5}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {outlets.map((outlet) => (
              <Marker
                key={outlet._id}
                position={[outlet.location.latitude, outlet.location.longitude]}
              >
                <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                  <div className="font-semibold text-center">
                    <div>{outlet.activity}</div>
                    <div className="text-xs text-gray-500">
                      Mobile: {outlet.outletMobile}
                    </div>
                    <div className="text-xs text-gray-500">
                      Employee: {outlet.createdBy?.dsName || "N/A"}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      WD Code: {outlet.createdBy?.WD_Code || "N/A"}
                    </div>
                  </div>
                </Tooltip>
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-lg mb-1">
                      {outlet.activity}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <MdPhone />
                      <span>{outlet.outletMobile}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <MdPerson />
                      <span>{outlet.createdBy?.dsName || "N/A"}</span>
                    </div>
                    <div className="text-sm text-gray-600 mb-1 pl-6">
                      WD Code: {outlet.createdBy?.WD_Code || "N/A"}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MdLocationOn />
                      <span>{`${outlet.location?.latitude.toFixed(
                        4
                      )}, ${outlet.location?.longitude.toFixed(4)}`}</span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default OutletMap;
