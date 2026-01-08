import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { getEmployees, deleteEmployee, updateEmployeeStatus } from '../apis/employee'
import { toast } from 'react-toastify'
import { MdAdd, MdEdit, MdDelete, MdVisibility } from 'react-icons/md'
import { useNavigate } from 'react-router-dom'
import Toggle from '../components/ui/Toggle'
import Loader from '../components/ui/Loader'
import Swal from 'sweetalert2'

const Employees = () => {
  const { colors } = useTheme()
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)
  const [active, setactive] = useState(true)

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const response = await getEmployees()
      console.log('API Response:', response)
      // Extract employees array from response
      const employeesData = response.employees || []
      setEmployees(employeesData)
    } catch (error) {
      console.error('Fetch employees error:', error)
      toast.error('Failed to fetch employees')
      setEmployees([]) // Set empty array on error
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
      toast.success('Status updated successfully')
      fetchEmployees()
    } catch (error) {
      console.error('Status toggle error:', error)
      toast.error(error.response?.data?.message || 'Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size={60} />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
          Manage Employees
        </h1>
        <button
          onClick={() => navigate('/dashboard/employees/add')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
          style={{ 
            backgroundColor: colors.primary, 
            color: colors.background 
          }}
        >
          <MdAdd size={20} />
          Add Employee
        </button>
      </div>

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
                <th className="px-6 py-3 text-left text-sm font-medium" style={{ color: colors.text }}>
                  Total Shops
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
              {Array.isArray(employees) && employees.map((employee, index) => (
                <tr 
                  key={employee._id || index}
                  className="border-t"
                  style={{ borderColor: colors.accent + '20' }}
                >
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
                      className="hover:underline focus:outline-none"
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
                        className="p-2 cursor-pointer rounded-lg transition-colors"
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
                        className="p-2 cursor-pointer rounded-lg transition-colors"
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
                        className="p-2 cursor-pointer rounded-lg transition-colors flex items-center justify-center"
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
              ))}
            </tbody>
          </table>
          
          {employees.length === 0 && (
            <div className="text-center py-8">
              <p style={{ color: colors.textSecondary }}>No employees found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Employees