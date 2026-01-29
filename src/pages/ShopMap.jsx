import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import { getShops } from "../apis/shop";
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

const ShopMap = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        // Optimized: Increase limit for visibility but handle with clustering
        const data = await getShops({ limit: 50000 });
        const fetchedShops = data.shops || [];

        const validShops = [];
        for (let i = 0; i < fetchedShops.length; i++) {
          const s = fetchedShops[i];
          if (s.location?.latitude && s.location?.longitude) {
            validShops.push(s);
          }
        }
        setShops(validShops);
      } catch (error) {
        if (error.response && error.response.status !== 500) {
          toast.error(
            error.response.data.message ||
              error.response.data.error ||
              "Failed to load shops for map",
          );
        } else {
          toast.error("Failed to load shops for map");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  const memoizedMarkers = useMemo(() => {
    return shops.map((shop) => (
      <Marker
        key={shop._id}
        position={[shop.location.latitude, shop.location.longitude]}
      >
        <Tooltip direction="top" offset={[0, -20]} opacity={0.9}>
          <div className="font-semibold text-center p-1">
            <div className="text-sm">{shop.shopName}</div>
            <div className="text-[10px] text-gray-500">{shop.city}</div>
          </div>
        </Tooltip>
        <Popup>
          <div className="p-2 min-w-[200px]">
            <h3
              className="font-bold text-lg mb-1"
              style={{ color: colors.primary }}
            >
              {shop.shopName}
            </h3>
            <div className="space-y-1 mt-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MdPerson className="text-primary" />
                <span>{shop.ownerName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MdPhone className="text-primary" />
                <span>{shop.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MdLocationOn className="text-primary" />
                <span>{shop.city}</span>
              </div>
              <div className="mt-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider ${shop.isActive ? "bg-green-500" : "bg-red-500"}`}
                >
                  {shop.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </Popup>
      </Marker>
    ));
  }, [shops, colors.primary]);

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
          Loading shop locations...
        </p>
      </div>
    );
  }

  const defaultCenter = [20.5937, 78.9629];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-none mb-1 flex items-center justify-between p-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/shops")}
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
              Shop Directory Map
            </h1>
            <p
              className="text-xs md:text-sm"
              style={{ color: colors.textSecondary }}
            >
              Performance optimized: <strong>{shops.length}</strong> shops
              visualized
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
            preferCanvas={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MarkerClusterGroup chunkedLoading maxClusterRadius={60}>
              {memoizedMarkers}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default ShopMap;
