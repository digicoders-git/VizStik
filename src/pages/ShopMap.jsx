import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getShops } from '../apis/shop';
import { useTheme } from '../context/ThemeContext';
import Loader from '../components/ui/Loader';
import { MdArrowBack, MdStore, MdPerson, MdPhone, MdLocationOn } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import L from 'leaflet';

// Fix for default marker icon in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
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
        // Fetch all shops with a large limit to ensure we get everything
        const data = await getShops({ limit: 10000 });
        const fetchedShops = data.shops || [];
        // Filter shops that have valid coordinates
        const validShops = fetchedShops.filter(
          s => s.location && s.location.latitude && s.location.longitude
        );
        setShops(validShops);
      } catch (error) {
        // console.error('Error fetching shops for map:', error);
        if (error.response && error.response.status !== 500) {
          toast.error(error.response.data.message || error.response.data.error || 'Failed to load shops for map')
        } else {
          toast.error('Failed to load shops for map')
        }
      } finally {
        setLoading(false);
      }
    };
    fetchShops();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader size={60} />
      </div>
    );
  }

  // Default center (India generally, or average of points)
  const defaultCenter = [20.5937, 78.9629]; 

  return (
    <div className="w-full h-full flex flex-col">
       {/* Header */}
       <div className="flex-none mb-1 flex items-center justify-between p-1 pb-0">
        <div className="flex items-center gap-4">
             {/* Back button (optional if opened in new tab, but good to have) */}
            <button
                onClick={() => navigate('/dashboard/shops')}
                className="p-2 cursor-pointer rounded transition-all"
                style={{ color: colors.primary }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primary + '20'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
                <MdArrowBack className="w-6 h-6" />
            </button>
            <div>
                <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
                    Shop Locations
                </h1>
                <p className="text-sm" style={{ color: colors.textSecondary }}>
                    Showing {shops.length} shops on map
                </p>
            </div>
        </div>
      </div>

      <div className="flex-1 p-2 relative z-0"> 
        {/* Map Container */}
        <div className="w-full h-full rounded overflow-hidden border shadow-lg" style={{ borderColor: colors.accent + '30' }}>
            <MapContainer center={defaultCenter} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {shops.map(shop => (
                    <Marker 
                        key={shop._id} 
                        position={[shop.location.latitude, shop.location.longitude]}
                    >
                         <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                            <div className="font-semibold text-center">
                                <div>{shop.shopName}</div>
                                <div className="text-xs text-gray-500">{shop.city}</div>
                                <div className="text-xs text-gray-500">Shop Code: {shop.shopCode}</div>
                                <div className="text-xs text-gray-500">Shop Type: {shop.shopType}</div>
                                <div className="text-xs text-gray-500">Owner Name: {shop.ownerName}</div>
                                {/* <div className={`text-xs ${shop.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                    {shop.isActive ? 'Active' : 'Inactive'}
                                </div> */}
                            </div>
                        </Tooltip>
                        <Popup>
                            <div className="p-2 min-w-[200px]">
                                <h3 className="font-bold text-lg mb-1">{shop.shopName}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                    <MdPerson />
                                    <span>{shop.ownerName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                                    <MdPhone />
                                    <span>{shop.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                    <MdLocationOn />
                                    <span>{shop.city}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded text-xs text-white ${shop.isActive ? 'bg-green-500' : 'bg-red-500'}`}>
                                        {shop.isActive ? 'Active' : 'Inactive'}
                                    </span>
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

export default ShopMap;
