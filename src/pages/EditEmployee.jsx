import React, { useState, useEffect } from 'react'
import { useTheme } from '../context/ThemeContext'
import { getEmployees, updateEmployee } from '../apis/employee'
import { toast } from 'react-toastify'
import { useNavigate, useParams } from 'react-router-dom'
import { MdArrowBack, MdSave } from 'react-icons/md'

const EditEmployee = () => {
  const { colors } = useTheme()
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    designation: '',
    profilePhoto: null
  })

  useEffect(() => {
    fetchEmployee()
  }, [id])

  const fetchEmployee = async () => {
    try {
      const response = await getEmployees()
      const employeesData = response.employees || []
      const employee = employeesData.find(emp => emp._id == id)
      if (employee) {
        setFormData({
          name: employee.name || '',
          email: employee.email || '',
          password: '', // Don't populate password
          phone: employee.phone || '',
          designation: employee.designation || '',
          profilePhoto: null // Don't populate file input
        })
      }
    } catch (error) {
      toast.error('Failed to fetch employee data')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await updateEmployee(id, formData)
      toast.success('Employee updated successfully')
      navigate('/dashboard/employees')
    } catch (error) {
      toast.error('Failed to update employee')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    if (e.target.name === 'profilePhoto') {
      setFormData({
        ...formData,
        [e.target.name]: e.target.files[0]
      })
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      })
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 cursor-pointer rounded transition-colors"
          style={{ 
            backgroundColor: colors.accent + '20',
            color: colors.text 
          }}
        >
          <MdArrowBack size={20} />
        </button>
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
          Edit Employee
        </h1>
      </div>

      <div 
        className="w-full rounded border shadow-sm p-6"
        style={{ 
          backgroundColor: colors.background, 
          borderColor: colors.accent + '30' 
        }}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 rounded border outline-none transition-colors"
                style={{ 
                  backgroundColor: colors.background,
                  borderColor: colors.accent + '40',
                  color: colors.text 
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 rounded border outline-none transition-colors"
                style={{ 
                  backgroundColor: colors.background,
                  borderColor: colors.accent + '40',
                  color: colors.text 
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current password"
                className="w-full p-3 rounded border outline-none transition-colors"
                style={{ 
                  backgroundColor: colors.background,
                  borderColor: colors.accent + '40',
                  color: colors.text 
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                Designation *
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
                className="w-full p-3 rounded border outline-none transition-colors"
                style={{ 
                  backgroundColor: colors.background,
                  borderColor: colors.accent + '40',
                  color: colors.text 
                }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full p-3 rounded border outline-none transition-colors"
                style={{ 
                  backgroundColor: colors.background,
                  borderColor: colors.accent + '40',
                  color: colors.text 
                }}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
              Profile Photo
            </label>
            <input
              type="file"
              name="profilePhoto"
              accept="image/*"
              onChange={handleChange}
              className="w-full p-3 rounded border outline-none transition-colors"
              style={{ 
                backgroundColor: colors.background,
                borderColor: colors.accent + '40',
                color: colors.text 
              }}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex cursor-pointer items-center gap-2 px-6 py-3 rounded font-medium transition-colors"
              style={{ 
                backgroundColor: loading ? colors.accent + '40' : colors.primary,
                color: colors.background 
              }}
            >
              <MdSave size={20} />
              {loading ? 'Updating...' : 'Update Employee'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 cursor-pointer py-3 rounded font-medium transition-colors"
              style={{ 
                backgroundColor: colors.accent + '20',
                color: colors.text 
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditEmployee