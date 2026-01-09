import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { getShops, deleteShop, toggleShopStatus } from '../apis/shop';
import { MdSearch, MdDelete, MdVisibility, MdFilterList, MdArrowUpward, MdArrowDownward, MdChevronLeft, MdChevronRight, MdMap } from 'react-icons/md';
import Toggle from '../components/ui/Toggle';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';

import Loader from '../components/ui/Loader';

const ManageShop = () => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [allShops, setAllShops] = useState([]);
  const [shops, setShops] = useState([]); // Displayed shops
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [shopTypeFilter, setShopTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(location.state?.initialDate || '');
  const [showFilters, setShowFilters] = useState(!!location.state?.initialDate);
  
  // Pagination & Sorting states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [totalShops, setTotalShops] = useState(0);

  // Fetch shops with server-side date filter
  const fetchShops = async () => {
    try {
      setLoading(true);
      const params = {};
      if (dateFilter) params.date = dateFilter;
      
      const data = await getShops(params);
      
      const fetchedShops = data.shops || [];
      setAllShops(fetchedShops);
    } catch (error) {
      console.error('Error fetching shops:', error);
      setAllShops([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial Fetch & Fetch on Date Change
  useEffect(() => {
    fetchShops();
  }, [dateFilter]);

  // Handle Initial Date from Navigation (When location state changes)
  useEffect(() => {
    if (location.state?.initialDate) {
      setDateFilter(location.state.initialDate)
      setShowFilters(true)
    }
  }, [location.state])

  // Filter, Sort, Paginate Logic
  useEffect(() => {
    let result = [...allShops];

    // 1. Filter
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(shop => 
        (shop.shopName && shop.shopName.toLowerCase().includes(lowerTerm)) || 
        (shop.ownerName && shop.ownerName.toLowerCase().includes(lowerTerm)) || 
        (shop.shopCode && shop.shopCode.toLowerCase().includes(lowerTerm))
      );
    }
    if (cityFilter) {
      result = result.filter(shop => shop.city && shop.city.toLowerCase().includes(cityFilter.toLowerCase()));
    }
    if (shopTypeFilter) {
      result = result.filter(shop => shop.shopType && shop.shopType.toLowerCase().includes(shopTypeFilter.toLowerCase()));
    }

    // 2. Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    // Update totals
    setTotalShops(result.length);
    setTotalPages(Math.ceil(result.length / limit) || 1);

    // 3. Paginate
    const startIndex = (currentPage - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);
    setShops(paginated);

  }, [allShops, searchTerm, cityFilter, shopTypeFilter, sortOrder, currentPage, limit]);

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
        setDeletingId(id);
        try {
          await deleteShop(id);
          await fetchShops(); // Refresh list
          Swal.fire(
            'Deleted!',
            'Shop has been deleted.',
            'success'
          )
        } catch (error) {
          // console.error('Error deleting shop:', error);
          if (error.response && error.response.status !== 500) {
            Swal.fire('Error!', error.response.data.message || error.response.data.error || 'Failed to delete shop.', 'error');
          } else {
            Swal.fire('Error!', 'Failed to delete shop.', 'error');
          }
        } finally {
            setDeletingId(null);
        }
      }
    })
  };

  // Handle toggle status
  const handleToggleStatus = async (id) => {
    try {
      await toggleShopStatus(id);
      fetchShops();
    } catch (error) {
      // console.error('Error toggling shop status:', error);
      if (error.response && error.response.status !== 500) {
        Swal.fire('Error!', error.response.data.message || error.response.data.error || 'Failed to update shop status.', 'error');
      } else {
        Swal.fire('Error!', 'Failed to update shop status.', 'error');
      }
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

  const handleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const clearFilters = () => {
    setCityFilter('');
    setShopTypeFilter('');
    setDateFilter('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="w-full h-fit flex flex-col">
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
              placeholder="Search by shop code, Shop name or owner name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded border outline-none transition-all"
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
            className="flex cursor-pointer items-center gap-2 px-4 py-2.5 rounded border transition-all"
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
          <div className="flex flex-col md:flex-row gap-4 p-4 rounded border" 
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
                onChange={(e) => {
                  setCityFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 rounded border outline-none"
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
                onChange={(e) => {
                  setShopTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 rounded border outline-none"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.accent + '30',
                  color: colors.text
                }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                Date Added
              </label>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 rounded border outline-none"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.accent + '30',
                  color: colors.text
                }}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="px-4 cursor-pointer py-2 rounded transition-all"
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

      {/* Stats and Map Button */}
      <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
            Total Shops:
            </span>
            <span className="text-sm font-bold px-3 py-1 rounded-full flex items-center justify-center min-w-[30px]" 
                style={{ 
                    backgroundColor: colors.primary + '20',
                    color: colors.primary,
                    minHeight: '28px'
                }}>
            {loading ? <Loader size={16} /> : totalShops}
            </span>
          </div>

          <button
                onClick={() => navigate('/dashboard/shops/map')}
                className="flex items-center cursor-pointer gap-2 px-4 py-2 rounded transition-all hover:opacity-90 shadow-sm"
                style={{ 
                    backgroundColor: colors.primary, 
                    color: colors.background 
                }}
            >
                <MdMap className="w-5 h-5" />
                <span>View Shop On Map</span>
            </button>
      </div>

      {/* Table Container */}
      <div className="w-full overflow-auto rounded border" 
           style={{ borderColor: colors.accent + '30', minHeight: '500px' }}>
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
              <th className="px-4 py-3 text-left text-sm font-semibold border-b cursor-pointer hover:bg-opacity-50 transition-colors" 
                  onClick={handleSort}
                  style={{ color: colors.text, borderColor: colors.accent + '30' }}>
                <div className="flex items-center gap-1">
                  Created At
                  {sortOrder === 'asc' ? <MdArrowUpward size={16} /> : <MdArrowDownward size={16} />}
                </div>
              </th>
              {/* <th className="px-4 py-3 text-center text-sm font-semibold border-b" 
                  style={{ color: colors.text, borderColor: colors.accent + '30' }}>
                Active
              </th> */}
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
            ) : shops.length === 0 ? (
              <tr>
                <td colSpan="10" className="px-4 py-8 text-center" style={{ color: colors.textSecondary }}>
                  No shops found
                </td>
              </tr>
            ) : (
              shops.map((shop, index) => (
                <tr key={shop._id} 
                    className="border-b transition-colors hover:bg-opacity-50"
                    style={{ borderColor: colors.accent + '20' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.accent + '10'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td className="px-4 py-3 text-sm" style={{ color: colors.text }}>
                    {(currentPage - 1) * limit + index + 1}
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
                    {shop.ownerPhone}
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: colors.text }}>
                    {formatDate(shop.createdAt)}
                  </td>
                  {/* <td className="px-4 py-3 text-center">
                    <div className="flex justify-center">
                      <Toggle 
                        active={shop.isActive} 
                        onClick={() => handleToggleStatus(shop._id)}
                      />
                    </div>
                  </td> */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleView(shop._id)}
                        className="p-2 cursor-pointer rounded transition-all"
                        style={{ color: colors.primary }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primary + '20'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="View Shop"
                      >
                        <MdVisibility className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(shop._id)}
                        className="p-2 cursor-pointer rounded transition-all flex items-center justify-center"
                        disabled={deletingId === shop._id}
                        style={{ 
                          color: '#DC2626',
                          width: '32px',
                          height: '32px'
                         }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#DC262620'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        title="Delete Shop"
                      >
                         {deletingId === shop._id ? <Loader size={16} color="#DC2626" /> : <MdDelete className="w-5 h-5" />}
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
        <div className="mt-4 flex items-center justify-between mb-10" style={{ color: colors.text }}>
            <div className="text-sm">
                Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalShops)} of {totalShops} entries
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                        borderColor: colors.accent + '30',
                        color: colors.text
                    }}
                >
                    <MdChevronLeft size={20} />
                </button>
                <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                            // Logic to show limited page numbers: current, first, last, range around current
                            return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                        })
                        .map((page, index, array) => (
                            <React.Fragment key={page}>
                                {index > 0 && array[index - 1] !== page - 1 && <span className="px-2">...</span>}
                                <button
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 cursor-pointer rounded text-sm font-medium transition-colors ${
                                        currentPage === page ? 'bg-primary text-white' : 'hover:bg-gray-100'
                                    }`}
                                    style={{
                                        backgroundColor: currentPage === page ? colors.primary : 'transparent',
                                        color: currentPage === page ? colors.background : colors.text,
                                        border: currentPage !== page ? `1px solid ${colors.accent}30` : 'none'
                                    }}
                                >
                                    {page}
                                </button>
                            </React.Fragment>
                        ))
                    }
                </div>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 cursor-pointer rounded border disabled:opacity-50 disabled:cursor-not-allowed"
                     style={{ 
                        borderColor: colors.accent + '30',
                        color: colors.text
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

export default ManageShop;

