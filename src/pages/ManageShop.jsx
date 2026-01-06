import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getShops, deleteShop, toggleShopStatus } from '../apis/shop';
import { MdSearch, MdDelete, MdVisibility, MdFilterList } from 'react-icons/md';
import Toggle from '../components/ui/Toggle';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

import Loader from '../components/ui/Loader';

const ManageShop = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  
  const [shops, setShops] = useState([]);
  const [filteredShops, setFilteredShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [shopTypeFilter, setShopTypeFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch shops
  const fetchShops = async () => {
    try {
      setLoading(true);
      const params = {};
      // Only use server-side search parameter
      if (searchTerm) params.search = searchTerm;
      
      const data = await getShops(params);
      let fetchedShops = data.shops || [];
      
      setShops(fetchedShops);
      // Filter will be applied by useEffect
      applyFilters(fetchedShops);
    } catch (error) {
      console.error('Error fetching shops:', error);
      setShops([]);
      setFilteredShops([]);
    } finally {
      setLoading(false);
    }
  };

  // Apply client-side filters
  const applyFilters = (currentShops) => {
    let result = [...currentShops];

    if (cityFilter) {
      result = result.filter(shop => 
        shop.city?.toLowerCase().includes(cityFilter.toLowerCase())
      );
    }

    if (shopTypeFilter) {
      result = result.filter(shop => 
        shop.shopType?.toLowerCase().includes(shopTypeFilter.toLowerCase())
      );
    }

    setFilteredShops(result);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchShops();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Apply filters when filter inputs change
  useEffect(() => {
    applyFilters(shops);
  }, [cityFilter, shopTypeFilter, shops]);

  // Handle delete
  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteShop(id);
          fetchShops();
          Swal.fire(
            'Deleted!',
            'Shop has been deleted.',
            'success'
          )
        } catch (error) {
          console.error('Error deleting shop:', error);
          Swal.fire(
            'Error!',
            'Failed to delete shop.',
            'error'
          )
        }
      }
    })
  };

  // Handle toggle status
  const handleToggleStatus = async (id) => {
    try {
      await toggleShopStatus(id);
      fetchShops();
      // Optional: Success toast or small alert if needed, but usually toggles are swift.
    } catch (error) {
      console.error('Error toggling shop status:', error);
      Swal.fire(
        'Error!',
        'Failed to update shop status.',
        'error'
      )
    }
  };

  // Handle view
  const handleView = (id) => {
    navigate(`/dashboard/shops/view/${id}`);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: colors.text }}>
          Manage Shops
        </h1>
        <p className="text-sm md:text-base" style={{ color: colors.textSecondary }}>
          View and manage all registered shops
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Box */}
          <div className="flex-1 relative">
            <MdSearch 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
              style={{ color: colors.textSecondary }}
            />
            <input
              type="text"
              placeholder="Search by shop name or owner name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border outline-none transition-all"
              style={{
                backgroundColor: colors.background,
                borderColor: colors.accent + '30',
                color: colors.text
              }}
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded-lg border transition-all"
            style={{
              backgroundColor: showFilters ? colors.primary + '20' : colors.background,
              borderColor: colors.accent + '30',
              color: showFilters ? colors.primary : colors.text
            }}
          >
            <MdFilterList className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="flex flex-col md:flex-row gap-4 p-4 rounded-lg border" 
               style={{ 
                 backgroundColor: colors.sidebar || colors.background,
                 borderColor: colors.accent + '30'
               }}>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                City
              </label>
              <input
                type="text"
                placeholder="Filter by city..."
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border outline-none"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.accent + '30',
                  color: colors.text
                }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                Shop Type
              </label>
              <input
                type="text"
                placeholder="Filter by shop type..."
                value={shopTypeFilter}
                onChange={(e) => setShopTypeFilter(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border outline-none"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.accent + '30',
                  color: colors.text
                }}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setCityFilter('');
                  setShopTypeFilter('');
                  setSearchTerm('');
                }}
                className="px-4 cursor-pointer py-2 rounded-lg transition-all"
                style={{
                  backgroundColor: colors.primary + '20',
                  color: colors.primary
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
          Total Shops:
        </span>
        <span className="text-sm font-bold px-3 py-1 rounded-full" 
              style={{ 
                backgroundColor: colors.primary + '20',
                color: colors.primary 
              }}>
          {filteredShops.length}
        </span>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto rounded-lg border" 
           style={{ borderColor: colors.accent + '30' }}>
        <table className="w-full">
          <thead className="sticky top-0 z-10" 
                 style={{ backgroundColor: colors.sidebar || colors.background }}>
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold border-b" 
                  style={{ color: colors.text, borderColor: colors.accent + '30' }}>
                Sr.
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold border-b" 
                  style={{ color: colors.text, borderColor: colors.accent + '30' }}>
                Shop Code
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold border-b" 
                  style={{ color: colors.text, borderColor: colors.accent + '30' }}>
                Shop Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold border-b" 
                  style={{ color: colors.text, borderColor: colors.accent + '30' }}>
                Shop Type
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold border-b" 
                  style={{ color: colors.text, borderColor: colors.accent + '30' }}>
                Owner Name
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold border-b" 
                  style={{ color: colors.text, borderColor: colors.accent + '30' }}>
                City
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold border-b" 
                  style={{ color: colors.text, borderColor: colors.accent + '30' }}>
                Phone
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold border-b" 
                  style={{ color: colors.text, borderColor: colors.accent + '30' }}>
                Created At
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold border-b" 
                  style={{ color: colors.text, borderColor: colors.accent + '30' }}>
                Active
              </th>
              <th className="px-4 py-3 text-center text-sm font-semibold border-b" 
                  style={{ color: colors.text, borderColor: colors.accent + '30' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="10" className="px-4 py-12 text-center" style={{ color: colors.textSecondary }}>
                  <Loader size={40} />
                </td>
              </tr>
            ) : filteredShops.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-4 py-8 text-center" style={{ color: colors.textSecondary }}>
                  No shops found
                </td>
              </tr>
            ) : (
              filteredShops.map((shop, index) => (
                <tr key={shop._id} 
                    className="border-b transition-colors hover:bg-opacity-50"
                    style={{ borderColor: colors.accent + '20' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.accent + '10'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td className="px-4 py-3 text-sm" style={{ color: colors.text }}>
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium" style={{ color: colors.primary }}>
                    {shop.shopCode}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: colors.text }}>
                    {shop.shopName}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: colors.text }}>
                    <span className="px-2 py-1 rounded-full text-xs font-medium"
                          style={{ 
                            backgroundColor: colors.primary + '20',
                            color: colors.primary 
                          }}>
                      {shop.shopType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: colors.text }}>
                    {shop.ownerName}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: colors.text }}>
                    {shop.city}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: colors.text }}>
                    {shop.phone}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: colors.text }}>
                    {formatDate(shop.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center">
                      <Toggle 
                        active={shop.isActive} 
                        onClick={() => handleToggleStatus(shop._id)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleView(shop._id)}
                        className="p-2 cursor-pointer rounded-lg transition-all"
                        style={{ color: colors.primary }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primary + '20'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="View Shop"
                      >
                        <MdVisibility className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(shop._id)}
                        className="p-2 cursor-pointer rounded-lg transition-all"
                        style={{ color: '#DC2626' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DC262620'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Delete Shop"
                      >
                        <MdDelete className="w-5 h-5" />
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
  );
};

export default ManageShop;
