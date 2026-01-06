import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { getEmployees } from '../apis/employee'
import { toast } from 'react-toastify'
import { useNavigate, useParams } from 'react-router-dom'
import { MdArrowBack, MdEdit, MdPerson, MdEmail, MdWork, MdBusiness, MdPhone, MdAttachMoney } from 'react-icons/md'

const ViewEmployee = () => {
  const { colors } = useTheme()
  const navigate = useNavigate()
  const { id } = useParams()
  const [employee, setEmployee] = useState(null)
  const [loading, setLoading] = useState(true)

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
      toast.error('Failed to fetch employee data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg" style={{ color: colors.text }}>Loading...</div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg" style={{ color: colors.text }}>Employee not found</div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
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
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            Employee Details
          </h1>
        </div>
        
        <button
          onClick={() => navigate(`/dashboard/employees/edit/${id}`)}
          className="flex cursor-pointer items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
          style={{ 
            backgroundColor: colors.primary, 
            color: colors.background 
          }}
        >
          <MdEdit size={20} />
          Edit Employee
        </button>
      </div>

      <div 
        className="w-full rounded-lg border shadow-sm p-6"
        style={{ 
          backgroundColor: colors.background, 
          borderColor: colors.accent + '30' 
        }}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b" style={{ borderColor: colors.accent + '20' }}>
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.primary + '20' }}
            >
              <MdPerson size={32} style={{ color: colors.primary }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: colors.text }}>
                {employee.name}
              </h2>
              <p style={{ color: colors.textSecondary }}>
                {employee.designation}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MdEmail size={20} style={{ color: colors.primary }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                    Email
                  </p>
                  <p style={{ color: colors.text }}>
                    {employee.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MdWork size={20} style={{ color: colors.primary }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                    Designation
                  </p>
                  <p style={{ color: colors.text }}>
                    {employee.designation}
                  </p>
                </div>
              </div>

              {employee.phone && (
                <div className="flex items-center gap-3">
                  <MdPhone size={20} style={{ color: colors.primary }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                      Phone
                    </p>
                    <p style={{ color: colors.text }}>
                      {employee.phone}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                    Password
                  </p>
                  <p style={{ color: colors.text }}>
                    {employee.password}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                    Status
                  </p>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {employee.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {employee.profilePhoto?.url && (
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                      Profile Photo
                    </p>
                    <img 
                      src={employee.profilePhoto.url} 
                      alt="Profile" 
                      className="w-32 h-32 rounded-lg object-cover mt-2"
                    />
                  </div>
                </div>
              )}

              {employee.lastLogin && (
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                      Last Login
                    </p>
                    <p style={{ color: colors.text }}>
                      {new Date(employee.lastLogin).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {employee.createdAt && (
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                      Joined Date
                    </p>
                    <p style={{ color: colors.text }}>
                      {new Date(employee.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              {employee.updatedAt && (
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                      Last Updated
                    </p>
                    <p style={{ color: colors.text }}>
                      {new Date(employee.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium" style={{ color: colors.textSecondary }}>
                    Employee ID
                  </p>
                  <p style={{ color: colors.text, fontSize: '12px', fontFamily: 'monospace' }}>
                    {employee._id}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewEmployee