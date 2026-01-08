import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { getEmployees } from '../apis/employee'
import { toast } from 'react-toastify'
import { useNavigate, useParams } from 'react-router-dom'
import { MdArrowBack, MdStore, MdPerson, MdPhone, MdLocationOn, MdEmail, MdChevronLeft, MdChevronRight } from 'react-icons/md'
import Loader from '../components/ui/Loader'

const EmployeeAddedShops = () => {
  const { colors } = useTheme()
  const navigate = useNavigate()
  const { id } = useParams()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  useEffect(() => {
    fetchEmployee()
  }, [id])

  const fetchEmployee = async () => {
    try {
      const response = await getEmployees()
      const employeesData = response.employees || []
      const emp = employeesData.find(emp => emp._id == id)
      if (emp) {
        setEmployee(emp)
      } else {
        toast.error('Employee not found')
        navigate('/dashboard/employees')
      }
    } catch (error) {
      console.error('Fetch employee error:', error)
      toast.error('Failed to fetch employee details')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size={60} />
      </div>
    )
  }

  if (!employee) {
    return null
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 cursor-pointer rounded-lg transition-colors"
          style={{ 
            backgroundColor: colors.accent + '20',
            color: colors.text 
          }}
        >
          <MdArrowBack size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Shops Added by {employee.name}
          </h1>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            Total Shops: {employee.totalShops || 0}
          </p>
        </div>
      </div>

      {/* Employee Details Card */}
      <div 
        className="mb-8 p-6 rounded-lg border shadow-sm flex flex-wrap items-center gap-6"
        style={{ 
          backgroundColor: colors.background, 
          borderColor: colors.accent + '30' 
        }}
      >
        <div className="flex items-center gap-4">
          {employee.profilePhoto?.url ? (
            <img 
              src={employee.profilePhoto.url} 
              alt={employee.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <MdPerson size={32} style={{ color: colors.primary }} />
            </div>
          )}
          <div>
            <h2 className="text-lg font-bold" style={{ color: colors.text }}>
              {employee.name}
            </h2>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {employee.designation}
            </p>
          </div>
        </div>
        
        <div className="h-10 w-px bg-gray-200 hidden md:block" style={{ backgroundColor: colors.accent + '30' }}></div>

        <div className="flex flex-col gap-1">
           <div className="flex items-center gap-2 text-sm" style={{ color: colors.text }}>
             <MdEmail size={16} style={{ color: colors.primary }} />
             {employee.email}
           </div>
           <div className="flex items-center gap-2 text-sm" style={{ color: colors.text }}>
             <MdPhone size={16} style={{ color: colors.primary }} />
             {employee.phone}
           </div>
        </div>
      </div>

      {/* Shops Table */}
      <div 
        className="rounded-lg border shadow-sm overflow-hidden"
        style={{ 
          backgroundColor: colors.background, 
          borderColor: colors.accent + '30' 
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: colors.accent + '10' }}>
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: colors.text }}>
                  Shop Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: colors.text }}>
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: colors.text }}>
                  Location
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: colors.text }}>
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: colors.text }}>
                  Status
                </th>
                 <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: colors.text }}>
                  Opening Hours
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: colors.text }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {employee.addedShops && employee.addedShops.length > 0 ? (
                employee.addedShops
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((shop, index) => (
                  <tr 
                    key={shop._id || index}
                    className="border-t hover:bg-opacity-50 transition-colors"
                    style={{ 
                        borderColor: colors.accent + '20',
                    }}
                  >
                    <td className="px-6 py-4 text-sm" style={{ color: colors.text }}>
                      <div className="flex items-center gap-3">
                        <div 
                            className="p-2 rounded-lg"
                            style={{ backgroundColor: colors.primary + '10' }}
                        >
                            <MdStore size={20} style={{ color: colors.primary }} />
                        </div>
                        <div>
                            <div className="font-medium">{shop.shopName}</div>
                            <div className="text-xs opacity-70">{shop.shopType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: colors.text }}>
                        <div className="flex items-center gap-2">
                            {shop.ownerImage && (
                                <img src={shop.ownerImage.url} alt="" className="w-6 h-6 rounded-full" />
                            )}
                            {shop.ownerName}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: colors.text }}>
                      <div className="flex items-center gap-1">
                        <MdLocationOn size={16} className="opacity-50" />
                        {shop.city}, {shop.state}
                      </div>
                      <div className="text-xs pl-5 opacity-70">{shop.address}</div>
                    </td>
                    <td className="px-6 py-4 text-sm" style={{ color: colors.text }}>
                      <div>{shop.phone}</div>
                      <div className="text-xs opacity-70">{shop.email}</div>
                    </td>
                     <td className="px-6 py-4 text-sm">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          shop.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {shop.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                     <td className="px-6 py-4 text-sm" style={{ color: colors.text }}>
                      {shop.openingTime} - {shop.closingTime}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => navigate(`/dashboard/shops/view/${shop._id}`)}
                        className="px-3 cursor-pointer py-1 rounded-lg text-xs font-medium border transition-colors hover:bg-opacity-80"
                        style={{ 
                          color: colors.primary,
                          borderColor: colors.primary
                        }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                   <td colSpan="7" className="px-6 py-8 text-center" style={{ color: colors.textSecondary }}>
                     No shops added by this employee yet.
                   </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

       {/* Pagination Controls */}
       {employee.addedShops && employee.addedShops.length > itemsPerPage && (
        <div className="mt-4 flex items-center justify-between" style={{ color: colors.text }}>
            <div className="text-sm">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, employee.addedShops.length)} of {employee.addedShops.length} entries
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
                     style={{ 
                        borderColor: colors.accent + '30',
                        color: colors.text
                    }}
                >
                    <MdChevronLeft size={20} />
                </button>
                <div className="flex gap-1">
                    {Array.from({ length: Math.ceil(employee.addedShops.length / itemsPerPage) }, (_, i) => i + 1)
                        .filter(page => {
                             const totalPages = Math.ceil(employee.addedShops.length / itemsPerPage);
                             return page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                        })
                        .map((page, index, array) => (
                            <React.Fragment key={page}>
                                {index > 0 && array[index - 1] !== page - 1 && <span className="px-2">...</span>}
                                <button
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
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
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(employee.addedShops.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(employee.addedShops.length / itemsPerPage)}
                    className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed"
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

export default EmployeeAddedShops
