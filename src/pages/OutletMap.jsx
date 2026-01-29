import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
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
        // Optimized: Only fetch necessary fields if possible,
        // but since we can't change backend, we fetch with a high limit
        // 50k is a safe upper bound for browser memory with clustering
        const response = await getOutlets({ limit: 50000 });
        const fetchedOutlets = response.data || [];

        // Filter valid locations efficiently
        const validOutlets = [];
        for (let i = 0; i < fetchedOutlets.length; i++) {
          const o = fetchedOutlets[i];
          if (o.location?.latitude && o.location?.longitude) {
            validOutlets.push(o);
          }
        }
        setOutlets(validOutlets);
      } catch (error) {
        console.error("Map fetch error:", error);
        toast.error("Failed to load outlets for map");
      } finally {
        setLoading(false);
      }
    };
    fetchOutlets();
  }, []);

  const memoizedMarkers = useMemo(() => {
    return outlets.map((outlet) => (
      <Marker
        key={outlet._id}
        position={[outlet.location.latitude, outlet.location.longitude]}
      >
        <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
          <div className="font-semibold text-center p-1">
            <div className="text-sm">{outlet.activity}</div>
            <div className="text-[10px] text-gray-500">
              {outlet.createdBy?.dsName || "N/A"} (
              {outlet.createdBy?.WD_Code || "N/A"})
            </div>
          </div>
        </Tooltip>
        <Popup>
          <div className="p-2 min-w-[200px]">
            <h3
              className="font-bold text-lg mb-1"
              style={{ color: colors.primary }}
            >
              {outlet.activity}
            </h3>
            <div className="space-y-1 mt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MdPhone className="text-primary" />
                <span>{outlet.outletMobile}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MdPerson className="text-primary" />
                <span>{outlet.createdBy?.dsName || "N/A"}</span>
              </div>
              <div className="text-sm text-gray-500 pl-6 text-xs">
                WD Code: {outlet.createdBy?.WD_Code || "N/A"}
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MdLocationOn className="text-primary" />
                <span>{`${outlet.location?.latitude.toFixed(4)}, ${outlet.location?.longitude.toFixed(4)}`}</span>
              </div>
            </div>
          </div>
        </Popup>
      </Marker>
    ));
  }, [outlets, colors.primary]);

  if (loading) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center gap-4 bg-opacity-50"
        style={{ backgroundColor: colors.background }}
      >
        <Loader size={60} />
        <p
          className="animate-pulse font-medium"
          style={{ color: colors.textSecondary }}
        >
          Loading data points... Please wait
        </p>
      </div>
    );
  }

  const defaultCenter = [20.5937, 78.9629];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex-none mb-1 flex items-center justify-between p-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/outlets")}
            className="p-2 cursor-pointer rounded-full transition-all hover:bg-opacity-20"
            style={{
              color: colors.primary,
              backgroundColor: colors.primary + "10",
            }}
          >
            <MdArrowBack size={24} />
          </button>
          <div>
            <h1
              className="text-xl md:text-2xl font-bold"
              style={{ color: colors.text }}
            >
              Outlet Map View
            </h1>
            <p
              className="text-xs md:text-sm"
              style={{ color: colors.textSecondary }}
            >
              Optimized for performance: <strong>{outlets.length}</strong>{" "}
              outlets mapped
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 relative z-0">
        <div
          className="w-full h-full border-t shadow-inner"
          style={{ borderColor: colors.accent + "20" }}
        >
          <MapContainer
            center={defaultCenter}
            zoom={5}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            preferCanvas={true} // High performance rendering for many layers
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarkerClusterGroup
              chunkedLoading // Optimized cluster creation
              maxClusterRadius={60}
              spiderfyOnMaxZoom={true}
              showCoverageOnHover={false}
            >
              {memoizedMarkers}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default OutletMap;
