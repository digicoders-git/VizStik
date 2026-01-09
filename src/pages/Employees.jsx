import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { getEmployees, deleteEmployee, updateEmployeeStatus } from '../apis/employee'
import { toast } from 'react-toastify'
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdSearch, MdChevronLeft, MdChevronRight, MdFilterList, MdArrowUpward, MdArrowDownward } from 'react-icons/md'
import { useNavigate, useLocation } from 'react-router-dom'
import Toggle from '../components/ui/Toggle'
import Loader from '../components/ui/Loader'
import Swal from 'sweetalert2'

const Employees = () => {
  const { colors } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  
  const [allEmployees, setAllEmployees] = useState([]) // Stores all raw data
  const [filteredEmployees, setFilteredEmployees] = useState([]) // Stores filtered & sorted data
  const [employees, setEmployees] = useState([]) // Stores current page data

  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  
  // Search, Filter, Pagination states
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState(location.state?.initialStatus || '') // 'true', 'false', or '' (all)
  const [currentPage, setCurrentPage] = useState(1)
  const [limit] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [showFilters, setShowFilters] = useState(!!location.state?.initialStatus)
  
  // Sorting state
  const [sortBy, setSortBy] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')

  // 1. Initial Fetch (Get ALL data)
  useEffect(() => {
    fetchEmployees()
  }, []) // Run once on mount

  // 2. Filter & Sort Effect
  useEffect(() => {
    let result = [...allEmployees]

    // -- Filtering --
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase()
      result = result.filter(emp => 
        (emp.name && emp.name.toLowerCase().includes(lowerTerm)) ||
        (emp.email && emp.email.toLowerCase().includes(lowerTerm)) ||
        (emp.phone && emp.phone.includes(lowerTerm))
      )
    }

    if (activeFilter !== '') {
      const isActiveBool = activeFilter === 'true'
      result = result.filter(emp => emp.isActive === isActiveBool)
    }

    // -- Sorting --
    if (sortBy) {
      result.sort((a, b) => {
        let valA = a[sortBy]
        let valB = b[sortBy]

        // Handle numeric 'totalShops' specially if needed, or generic
        if (sortBy === 'totalShops') {
             valA = Number(valA || 0)
             valB = Number(valB || 0)
        } else {
             // String comparison safe-guard
             valA = valA ? valA.toString().toLowerCase() : ''
             valB = valB ? valB.toString().toLowerCase() : ''
        }
        
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }

    setFilteredEmployees(result)
    setTotalEmployees(result.length)
    setTotalPages(Math.ceil(result.length / limit) || 1)
    
    // Reset to page 1 ONLY if the new result length is different (implies filter changed) 
    // OR if we are just sorting, we might want to stay on page 1 to see top results?
    // User requirement: "pura data filter ho... uper aana chahiye" -> Reset to page 1 makes sense
    // But we need to be careful not to loop. 
    // Let's reset page when filters/sort change, but we are inside an effect that runs on them.
    // If we set current page here, we might cause issues if we don't check.
    // However, usually it's safe to reset page to 1 when search/filter/sort changes.
    // But this effect runs on `currentPage`? No, it doesn't dependency on currentPage.
  }, [allEmployees, searchTerm, activeFilter, sortBy, sortOrder, limit])

  // 2b. Reset Page on Filter/Sort Change
  useEffect(() => {
     setCurrentPage(1)
  }, [searchTerm, activeFilter, sortBy, sortOrder])

  // 2c. Handle Initial Filter State from Navigation
  useEffect(() => {
    if (location.state?.initialStatus) {
      setActiveFilter(location.state.initialStatus)
      setShowFilters(true)
    }
  }, [location.state])


  // 3. Pagination Effect (Slice data for view)
  useEffect(() => {
    const startIndex = (currentPage - 1) * limit
    const endIndex = startIndex + limit
    setEmployees(filteredEmployees.slice(startIndex, endIndex))
  }, [filteredEmployees, currentPage, limit])


  // Removed debounce effect for fetch, as we fetch once. 
  // We can debounce the setSearchTerm update in the UI if needed, 
  // but for local filtering it's fast enough usually. 
  // Or we can keep a debounced search term for the filter effect. 
  // For now, let's keep it simple direct filtering.

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      // Fetch ALL employees by passing a large limit
      // or assuming API returns all if no params (which it might not).
      // We'll trust the user wants 'pura data' (all data) so we try to get all.
      // Ideally backend supports /all or limit=0. 
      // We will try limit=1000 for now as a safe "all".
      const params = {
        limit: 1000, 
        page: 1 
      }
      
      const response = await getEmployees(params)
      const employeesData = response.employees || []
      
      setAllEmployees(employeesData)
      // trigger filter effect via state update
      
    } catch (error) {
      console.error('Fetch employees error:', error)
      setEmployees([]) 
      setAllEmployees([])
    } finally {
      setLoading(false)
    }
  }

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
          await deleteEmployee(id)
          await fetchEmployees()
          Swal.fire(
            'Deleted!',
            'Employee has been deleted.',
            'success'
          )
        } catch (error) {
          Swal.fire(
            'Error!',
            'Failed to delete employee.',
            'error'
          )
        } finally {
          setDeletingId(null);
        }
      }
    })
  }

  const handleStatusToggle = async (employeeId) => {
    try {
      await updateEmployeeStatus(employeeId)
      fetchEmployees()
    } catch (error) {
      // console.error('Status toggle error:', error)
      if (error.response && error.response.status !== 500) {
        toast.error(error.response.data.message || error.response.data.error || 'Failed to update status')
      } else {
        toast.error('Failed to update status')
      }
    }
  }

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
    setCurrentPage(1) // Reset to first page on sort
  }

  const clearFilters = () => {
    setSearchTerm('')
    setActiveFilter('')
    setCurrentPage(1)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
           <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
             Manage Employees
           </h1>
           <p className="text-sm md:text-base mt-2" style={{ color: colors.textSecondary }}>
             View and manage all registered employees
           </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/employees/add')}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded font-medium transition-colors"
          style={{ 
            backgroundColor: colors.primary, 
            color: colors.background 
          }}
        >
          <MdAdd size={20} />
          Add Employee
        </button>
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
              placeholder="Search by name, email or phone..."
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
                Status
              </label>
              <select
                value={activeFilter}
                onChange={(e) => {
                    setActiveFilter(e.target.value)
                    setCurrentPage(1)
                }}
                className="w-full px-4 py-2 rounded border outline-none cursor-pointer"
                style={{
                  backgroundColor: colors.background,
                  borderColor: colors.accent + '30',
                  color: colors.text
                }}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
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
      
      {/* Stats */}
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
          Total Employees:
        </span>
         <span className="text-sm font-bold px-3 py-1 rounded-full flex items-center justify-center min-w-[30px]" 
              style={{ 
                backgroundColor: colors.primary + '20',
                color: colors.primary,
                minHeight: '28px'
              }}>
          {loading ? <Loader size={16} /> : totalEmployees}
        </span>
      </div>

      <div 
        className="rounded border shadow-sm overflow-hidden lg:min-h-[500px]"
        style={{ 
          backgroundColor: colors.background, 
          borderColor: colors.accent + '30',
          minHeight: '500px'
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: colors.accent + '10' }}>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: colors.text }}>
                   Sr.
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: colors.text }}>
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: colors.text }}>
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: colors.text }}>
                  Designation
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: colors.text }}>
                  Phone
                </th>
                <th 
                  className="px-6 py-3 text-left text-sm font-medium cursor-pointer select-none group" 
                  style={{ color: colors.text }}
                  onClick={() => handleSort('totalShops')}
                >
                  <div className="flex items-center gap-1 hover:text-primary transition-colors">
                    Total Shops
                    <span className="text-gray-400 group-hover:text-primary">
                      {sortBy === 'totalShops' ? (
                        sortOrder === 'desc' ? <MdArrowDownward size={16} /> : <MdArrowUpward size={16} />
                      ) : (
                        <MdArrowDownward size={16} className="opacity-0 group-hover:opacity-50" />
                      )}
                    </span>
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: colors.text }}>
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: colors.text }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="px-4 py-12 text-center" style={{ color: colors.textSecondary }}>
                  <Loader size={40} />
                </td>
              </tr>
            ) : employees.length === 0 ? (
                <tr>
                    <td colSpan="8" className="text-center py-8">
                    <p style={{ color: colors.textSecondary }}>No employees found</p>
                    </td>
                </tr>
            ) : (
                employees.map((employee, index) => (
                <tr 
                  key={employee._id || index}
                  className="border-t"
                  style={{ borderColor: colors.accent + '20' }}
                >
                  <td className="px-6 py-4 text-sm" style={{ color: colors.text }}>
                    {(currentPage - 1) * limit + index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: colors.text }}>
                    <div className="flex items-center gap-3">
                      {employee.profilePhoto?.url && (
                        <img 
                          src={employee.profilePhoto.url} 
                          alt={employee.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      {employee.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: colors.text }}>
                    {employee.email}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: colors.text }}>
                    {employee.designation}
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: colors.text }}>
                    {employee.phone}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <button
                      onClick={() => navigate(`/dashboard/employees/${employee._id}/shops`)}
                      className="hover:underline cursor-pointer focus:outline-none"
                      style={{ color: colors.primary }}
                    >
                      {employee.totalShops || 0} 
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <Toggle 
                      active={employee.isActive}
                      onClick={() => handleStatusToggle(employee._id)}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/dashboard/employees/view/${employee._id}`)}
                        className="p-2 cursor-pointer rounded transition-colors"
                        style={{ 
                          backgroundColor: colors.primary + '20',
                          color: colors.primary 
                        }}
                        title="View"
                      >
                        <MdVisibility size={16} />
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/employees/edit/${employee._id}`)}
                        className="p-2 cursor-pointer rounded transition-colors"
                        style={{ 
                          backgroundColor: '#f59e0b20',
                          color: '#f59e0b' 
                        }}
                        title="Edit"
                      >
                        <MdEdit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(employee._id)}
                        className="p-2 cursor-pointer rounded transition-colors flex items-center justify-center"
                        disabled={deletingId === employee._id}
                        style={{ 
                          backgroundColor: '#ef444420',
                          color: '#ef4444',
                          width: '32px',
                          height: '32px'
                        }}
                        title="Delete"
                      >
                        {deletingId === employee._id ? <Loader size={16} color="#ef4444" /> : <MdDelete size={16} />}
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
      
       {/* Pagination Controls */}
       {!loading && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between" style={{ color: colors.text }}>
            <div className="text-sm">
                Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalEmployees)} of {totalEmployees} entries
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
                             return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                        })
                        .map((page, index, array) => (
                            <React.Fragment key={page}>
                                {index > 0 && array[index - 1] !== page - 1 && <span className="px-2">...</span>}
                                <button
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
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
                    className="p-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
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
  )
}

export default Employees