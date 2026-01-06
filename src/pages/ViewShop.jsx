import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { getShopById } from '../apis/shop';
import { MdArrowBack, MdLocationOn, MdPhone, MdEmail, MdAccessTime, MdStore } from 'react-icons/md';
import Loader from '../components/ui/Loader';

const ViewShop = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();
  
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShop = async () => {
      try {
        setLoading(true);
        const data = await getShopById(id);
        setShop(data.shop || data);
      } catch (error) {
        console.error('Error fetching shop:', error);
        alert('Failed to load shop details');
        navigate('/dashboard/shops');
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader size={60} />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p style={{ color: colors.textSecondary }}>Shop not found</p>
      </div>
    );
  }

  const InfoRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start gap-3 p-3 rounded-lg" 
         style={{ backgroundColor: colors.accent + '10' }}>
      {Icon && <Icon className="w-5 h-5 mt-0.5" style={{ color: colors.primary }} />}
      <div className="flex-1">
        <p className="text-sm font-medium mb-1" style={{ color: colors.textSecondary }}>
          {label}
        </p>
        <p className="text-base" style={{ color: colors.text }}>
          {value || 'N/A'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full h-full overflow-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate('/dashboard/shops')}
          className="p-2 rounded-lg transition-all"
          style={{ color: colors.primary }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primary + '20'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <MdArrowBack className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: colors.text }}>
            Shop Details
          </h1>
          <p className="text-sm md:text-base" style={{ color: colors.textSecondary }}>
            {shop.shopCode}
          </p>
        </div>
      </div>

      {/* Shop Images */}
      {shop.shopImages && shop.shopImages.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>
            Shop Images
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shop.shopImages.map((image, index) => (
              <div key={index} className="rounded-lg overflow-hidden border" 
                   style={{ borderColor: colors.accent + '30' }}>
                <img 
                  src={image.url} 
                  alt={`Shop ${index + 1}`}
                  className="w-full h-48 object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>
          Basic Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Shop Name" value={shop.shopName} icon={MdStore} />
          <InfoRow label="Shop Type" value={shop.shopType} icon={MdStore} />
          <InfoRow label="Shop Code" value={shop.shopCode} />
          <InfoRow label="GST Number" value={shop.gstNumber} />
          <InfoRow label="Description" value={shop.description} />
          <InfoRow 
            label="Status" 
            value={
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium`}
                      style={{ 
                        backgroundColor: shop.isActive ? '#22C55E20' : '#EF444420',
                        color: shop.isActive ? '#22C55E' : '#EF4444'
                      }}>
                  {shop.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium`}
                      style={{ 
                        backgroundColor: shop.isOpen ? '#22C55E20' : '#EF444420',
                        color: shop.isOpen ? '#22C55E' : '#EF4444'
                      }}>
                  {shop.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
            }
          />
        </div>
      </div>

      {/* Owner Information */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>
          Owner Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shop.ownerImage && (
            <div className="col-span-full flex justify-center mb-4">
              <img 
                src={shop.ownerImage.url} 
                alt={shop.ownerName}
                className="w-32 h-32 rounded-full object-cover border-4"
                style={{ borderColor: colors.primary }}
              />
            </div>
          )}
          <InfoRow label="Owner Name" value={shop.ownerName} />
          <InfoRow label="Owner Phone" value={shop.ownerPhone} icon={MdPhone} />
          <InfoRow label="Owner Email" value={shop.ownerEmail} icon={MdEmail} />
        </div>
      </div>

      {/* Contact Information */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>
          Contact Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Phone" value={shop.phone} icon={MdPhone} />
          <InfoRow label="Alternate Phone" value={shop.alternatePhone} icon={MdPhone} />
          <InfoRow label="Email" value={shop.email} icon={MdEmail} />
        </div>
      </div>

      {/* Location Information */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>
          Location Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Address" value={shop.address} icon={MdLocationOn} />
          <InfoRow label="City" value={shop.city} />
          <InfoRow label="State" value={shop.state} />
          <InfoRow label="Pincode" value={shop.pincode} />
          <InfoRow label="Country" value={shop.country} />
          <InfoRow 
            label="Coordinates" 
            value={`${shop.location?.latitude}, ${shop.location?.longitude}`}
            icon={MdLocationOn}
          />
        </div>
      </div>

      {/* Timing Information */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>
          Timing Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow label="Opening Time" value={shop.openingTime} icon={MdAccessTime} />
          <InfoRow label="Closing Time" value={shop.closingTime} icon={MdAccessTime} />
        </div>
      </div>

      {/* Created By Information */}
      {shop.createdBy && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>
            Created By
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow label="Name" value={shop.createdBy.name} />
            <InfoRow label="Email" value={shop.createdBy.email} icon={MdEmail} />
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: colors.text }}>
          Timestamps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoRow 
            label="Created At" 
            value={new Date(shop.createdAt).toLocaleString('en-IN')}
          />
          <InfoRow 
            label="Updated At" 
            value={new Date(shop.updatedAt).toLocaleString('en-IN')}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewShop;
