import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { createEmployee } from '../apis/employee'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { MdArrowBack, MdSave } from 'react-icons/md'
import Loader from '../components/ui/Loader'

const AddEmployee = () => {
  const { colors } = useTheme()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    designation: '',
    state: '',
    city: '',
    area: '',
    profilePhoto: null
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const data = await createEmployee(formData)
      toast.success('Employee added successfully')
      console.log(data)
      navigate('/dashboard/employees')
    } catch (error) {
      // console.error(error)
      if (error.response && error.response.status !== 500) {
        toast.error(error.response.data.message || error.response.data.error || 'Failed to add employee')
      } else {
        toast.error('Failed to add employee')
      }
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
          onClick={() => navigate('/dashboard/employees')}
          className="p-2 rounded transition-colors"
          style={{ 
            backgroundColor: colors.accent + '20',
            color: colors.text 
          }}
        >
          <MdArrowBack size={20} />
        </button>
        <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
          Add Employee
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
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
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
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.text }}>
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
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
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
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
                Area
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
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
              className="flex items-center cursor-pointer gap-2 px-6 py-3 rounded font-medium transition-colors"
              style={{ 
                backgroundColor: loading ? colors.accent + '40' : colors.primary,
                color: colors.background 
              }}
            >
              <MdSave size={20} />
              {loading ? <>'Saving...' <Loader size={20} /></> : 'Save Employee'}
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

export default AddEmployee