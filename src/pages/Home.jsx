import React, { useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useData } from '../context/DataContext'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { MdMovie, MdVisibility, MdFavorite, MdShare, MdTrendingUp, MdPeople, MdMenuBook, MdBook, MdWork, MdCreditCard, MdPerson, MdSend, MdBarChart, MdShowChart, MdMessage } from 'react-icons/md'
import { NavLink } from 'react-router-dom'

const Home = () => {
  const { colors } = useTheme()
  const { shorts, courses, ebooks, jobs, subscriptions } = useData()

  // State for chart filter and reply
  const [chartFilter, setChartFilter] = useState('By Week')
  const [distTab, setDistTab] = useState('Courses')
  const [distFilter, setDistFilter] = useState('Monthly')
  const [replyTo, setReplyTo] = useState(null)
  const [replyText, setReplyText] = useState('')

  // Stats data with lucide icons
  const statsData = [
    { id: 'users', path: '/dashboard', title: 'Users', value: '2,543', icon: MdPeople, color: '#3b82f6', growth: '+12%' },
    { id: 'courses', path: '/dashboard', title: 'Courses', value: '156', icon: MdMenuBook, color: '#10b981', growth: '+8%' },
    { id: 'ebooks', path: '/dashboard', title: 'Ebook', value: '89', icon: MdBook, color: '#8b5cf6', growth: '+15%' },
    { id: 'jobs', path: '/dashboard', title: 'Jobs', value: '234', icon: MdWork, color: '#f59e0b', growth: '+23%' },
    { id: 'subscription', path: '/dashboard', title: 'Subscription', value: '45', icon: MdCreditCard, color: '#ef4444', growth: '+18%' }
  ]

  // Sales data for progress bars
  const salesData = [
    { name: 'Courses', percentage: 75, color: '#10b981' },
    { name: 'Ebooks', percentage: 60, color: '#3b82f6' },
    { name: 'Jobs', percentage: 45, color: '#f59e0b' },
    { name: 'Subscription', percentage: 88, color: '#8b5cf6' }
  ]

  // Latest comments data
  const [comments, setComments] = useState([
    { id: 1, user: 'Rahul Kumar', comment: 'Great content! Very helpful.', time: '5 mins ago', replies: [] },
    { id: 2, user: 'Priya Sharma', comment: 'Thanks for sharing this.', time: '12 mins ago', replies: [] },
    { id: 3, user: 'Amit Singh', comment: 'Excellent explanation!', time: '25 mins ago', replies: [] },
    { id: 4, user: 'Sneha Patel', comment: 'Very informative video.', time: '45 mins ago', replies: [] },
    { id: 5, user: 'Vikram Joshi', comment: 'Please make more like this.', time: '1 hour ago', replies: [] }
  ])

  // Chart data based on filter
  const getChartData = () => {
    const dataMap = {
      'By Day': {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        courses: [12, 15, 18, 14, 22, 28, 25],
        ebooks: [8, 10, 12, 9, 15, 18, 16],
        jobs: [5, 8, 10, 7, 12, 15, 13],
        subscription: [3, 5, 7, 5, 9, 12, 10]
      },
      'By Week': {
        categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
        courses: [85, 110, 130, 115, 95],
        ebooks: [50, 75, 95, 80, 65],
        jobs: [40, 70, 90, 75, 60],
        subscription: [25, 45, 65, 55, 40]
      },
      'By Month': {
        categories: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        courses: [320, 450, 580, 520, 410],
        ebooks: [180, 280, 380, 320, 250],
        jobs: [150, 270, 360, 300, 240],
        subscription: [90, 180, 260, 220, 170]
      }
    }
    return dataMap[chartFilter]
  }

  const chartData = getChartData()

  // Highcharts configuration
  const chartOptions = {
    chart: {
      type: 'spline',
      backgroundColor: 'transparent',
      height: 400
    },
    title: {
      text: 'Sales Overview',
      style: {
        color: colors.text,
        fontSize: '20px',
        fontWeight: 'bold'
      }
    },
    xAxis: {
      categories: chartData.categories,
      labels: {
        style: {
          color: colors.textSecondary
        }
      },
      lineColor: colors.accent + '40',
      tickColor: colors.accent + '40'
    },
    yAxis: {
      title: {
        text: 'Sales Count',
        style: {
          color: colors.textSecondary
        }
      },
      labels: {
        style: {
          color: colors.textSecondary
        }
      },
      gridLineColor: colors.accent + '20'
    },
    legend: {
      itemStyle: {
        color: colors.text
      },
      itemHoverStyle: {
        color: colors.primary
      }
    },
    tooltip: {
      shared: true,
      backgroundColor: colors.background,
      borderColor: colors.accent,
      style: {
        color: colors.text
      }
    },
    plotOptions: {
      spline: {
        marker: {
          radius: 4,
          lineColor: '#666666',
          lineWidth: 1
        }
      }
    },
    series: [
      {
        name: 'Courses',
        data: chartData.courses,
        color: '#10b981'
      },
      {
        name: 'Ebooks',
        data: chartData.ebooks,
        color: '#3b82f6'
      },
      {
        name: 'Jobs',
        data: chartData.jobs,
        color: '#f59e0b'
      },
      {
        name: 'Subscription',
        data: chartData.subscription,
        color: '#8b5cf6'
      }
    ],
    credits: {
      enabled: false
    }
  }

  // Distribution chart data processing
  const getDistributionData = () => {
    const factor = distFilter === 'Day' ? 0.3 : distFilter === 'Week' ? 0.6 : 1
    
    const parseCount = (str) => {
      if (!str) return 0
      if (typeof str === 'number') return str
      const val = parseFloat(str.replace(/[^0-9.]/g, ''))
      if (str.toLowerCase().includes('k')) return val * 1000
      return val
    }

    if (distTab === 'Courses') {
      return courses.map(c => {
        const studentCount = parseCount(c.studentsCount) || 100
        return {
          name: c.title,
          y: Math.round(studentCount * factor),
          revenue: Math.round((parseInt(c.Cprice) || 0) * studentCount * factor)
        }
      })
    }
    if (distTab === 'Ebook') {
      return ebooks.map(e => ({
        name: e.title,
        y: Math.round(50 * factor), // Mocked student count
        revenue: Math.round((parseInt(e.Cprice) || 199) * 50 * factor)
      }))
    }
    if (distTab === 'Jobs') {
      return jobs.map(j => ({
        name: j.title,
        y: Math.round((parseInt(j.openings) || 5) * factor),
        revenue: 0 // Jobs might not have direct revenue in this context
      }))
    }
    if (distTab === 'Subscription') {
      return subscriptions.map(s => ({
        name: s.planType,
        y: Math.round(120 * factor), // Mocked student count
        revenue: Math.round((parseInt(s.price) || 299) * 120 * factor)
      }))
    }
    return []
  }

  const distributionData = getDistributionData()

  const distChartOptions = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: 450
    },
    title: {
      text: `${distTab} Distribution`,
      align: 'left',
      style: {
        color: colors.text,
        fontSize: '20px',
        fontWeight: 'bold'
      }
    },
    tooltip: {
      backgroundColor: colors.background,
      borderColor: colors.accent,
      style: { color: colors.text },
      pointFormat: 'Students: <b>{point.y}</b><br/>Revenue: <b>₹{point.revenue}</b><br/>Share: <b>{point.percentage:.1f}%</b>'
    },
    accessibility: {
      point: {
        valueSuffix: '%'
      }
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          connectorColor: colors.accent + '40',
          style: {
            color: colors.textSecondary,
            textOutline: 'none'
          }
        },
        showInLegend: true
      }
    },
    legend: {
      itemStyle: { color: colors.text },
      itemHoverStyle: { color: colors.primary }
    },
    series: [{
      name: 'Distribution',
      colorByPoint: true,
      data: distributionData
    }],
    credits: {
      enabled: false
    }
  }

  const handleReply = (commentId) => {
    if (replyText.trim()) {
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...comment.replies, { text: replyText, time: 'Just now' }]
          }
        }
        return comment
      }))
      setReplyText('')
      setReplyTo(null)
    }
  }

  return (
    <div className='space-y-6 p-6'>
      {/* Welcome/Overview Section */}
      <div 
        className='p-8 rounded-lg border shadow-md'
        style={{
          backgroundColor: colors.background,
          borderColor: colors.accent + '30'
        }}
      >
        <h1 className='text-3xl md:text-4xl font-bold mb-3' style={{ color: colors.text }}>
          Welcome to CodersAdda Dashboard!
        </h1>
        <p className='text-lg mb-4' style={{ color: colors.textSecondary }}>
          Get a comprehensive overview of your platform's performance and user engagement.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6'>
          <div className='flex items-center space-x-3'>
            <div className='w-12 h-12 rounded-full flex items-center justify-center text-2xl'
                 style={{ backgroundColor: colors.primary + '20', color:colors.text }}>
              <MdBarChart />
            </div>
            <div>
              <h3 className='font-semibold' style={{ color: colors.text }}>Real-time Analytics</h3>
              <p className='text-sm' style={{ color: colors.textSecondary }}>Track your metrics instantly</p>
            </div>
          </div>
          <div className='flex items-center space-x-3'>
            <div className='w-12 h-12 rounded-full flex items-center justify-center text-2xl'
                 style={{ backgroundColor: colors.accent + '30',color:colors.text }}>
              <MdShowChart />
            </div>
            <div>
              <h3 className='font-semibold' style={{ color: colors.text }}>Growth Insights</h3>
              <p className='text-sm' style={{ color: colors.textSecondary }}>Monitor your platform growth</p>
            </div>
          </div>
          <div className='flex items-center space-x-3'>
            <div className='w-12 h-12 rounded-full flex items-center justify-center text-2xl'
                 style={{ backgroundColor: colors.warning + '20', color:colors.text }}>
              <MdTrendingUp  />
            </div>
            <div>
              <h3 className='font-semibold' style={{ color: colors.text }}>User Engagement</h3>
              <p className='text-sm' style={{ color: colors.textSecondary }}>Stay connected with users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6'>
        {statsData.map((stat) => {
          const IconComponent = stat.icon
          return (
            <NavLink to={stat.path}
              key={stat.id}
              className='p-6 rounded-lg border shadow-md transition-all duration-200 hover:shadow-lg hover:scale-105'
              style={{
                backgroundColor: colors.background,
                borderColor: colors.accent + '30'
              }}
            >
              <div className='flex items-center justify-between mb-4'>
                <div 
                  className='w-12 h-12 rounded-lg flex items-center justify-center'
                  style={{ backgroundColor: stat.color + '20' }}
                >
                  <IconComponent size={24} style={{ color: stat.color }} />
                </div>
                <span 
                  className='text-xs px-2 py-1 rounded-full font-semibold'
                  style={{
                    backgroundColor: '#10b981' + '20',
                    color: '#10b981'
                  }}
                >
                  {stat.growth}
                </span>
              </div>
              <h3 className='text-3xl font-bold mb-2' style={{ color: colors.text }}>
                {stat.value}
              </h3>
              <p className='text-sm font-medium' style={{ color: colors.textSecondary }}>
                Total {stat.title}
              </p>
            </NavLink>
          )
        })}
      </div>

      {/* Sales Chart with Filter */}
      <div
        className='p-6 rounded-lg border shadow-md'
        style={{
          backgroundColor: colors.background,
          borderColor: colors.accent + '30'
        }}
      >
        <div className='flex items-center justify-between mb-4'>
          <h2 className='text-xl font-bold' style={{ color: colors.text }}>Sales Overview</h2>
          <div className='flex items-center space-x-2'>
            {['By Day', 'By Week', 'By Month'].map((filter) => (
              <button
                key={filter}
                onClick={() => setChartFilter(filter)}
                className='px-4 cursor-pointer py-2 rounded-lg text-sm font-medium transition-all duration-200'
                style={{
                  backgroundColor: chartFilter === filter ? colors.primary : colors.accent + '20',
                  color: chartFilter === filter ? colors.background : colors.text
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </div>

      {/* Category Wise Distribution Chart */}
      <div
        className='p-6 rounded-lg border shadow-md'
        style={{
          backgroundColor: colors.background,
          borderColor: colors.accent + '30'
        }}
      >
        <div className='flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4'>
          {/* Main Tabs */}
          <div className='flex items-center space-x-2'>
            {['Courses', 'Ebook', 'Jobs', 'Subscription'].map((tab) => (
              <button
                key={tab}
                onClick={() => setDistTab(tab)}
                className='px-4 cursor-pointer py-2 rounded-lg text-sm font-medium transition-all duration-200'
                style={{
                  backgroundColor: distTab === tab ? colors.primary : colors.accent + '20',
                  color: distTab === tab ? colors.background : colors.text
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Time Filters */}
          <div className='flex items-center space-x-2'>
            {['Day', 'Week', 'Monthly'].map((filter) => (
              <button
                key={filter}
                onClick={() => setDistFilter(filter)}
                className='px-4 cursor-pointer py-2 rounded-lg text-sm font-medium transition-all duration-200'
                style={{
                  backgroundColor: distFilter === filter ? colors.primary : colors.accent + '20',
                  color: distFilter === filter ? colors.background : colors.text
                }}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className='relative'>
           <HighchartsReact highcharts={Highcharts} options={distChartOptions} />
           
           {/* Summary Stats Overlay (Optional but adds premium feel) */}
           <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t pt-6' style={{ borderColor: colors.accent + '20' }}>
              <div className='text-center'>
                 <p className='text-xs font-medium uppercase tracking-tighter' style={{ color: colors.textSecondary }}>Total {distTab}</p>
                 <p className='text-xl font-bold' style={{ color: colors.text }}>{distributionData.length}</p>
              </div>
              <div className='text-center'>
                 <p className='text-xs font-medium uppercase tracking-tighter' style={{ color: colors.textSecondary }}>Total Students</p>
                 <p className='text-xl font-bold' style={{ color: colors.success || '#10b981' }}>
                    {distributionData.reduce((acc, curr) => acc + curr.y, 0).toLocaleString()}
                 </p>
              </div>
              <div className='text-center'>
                 <p className='text-xs font-medium uppercase tracking-tighter' style={{ color: colors.textSecondary }}>Total Revenue</p>
                 <p className='text-xl font-bold' style={{ color: colors.primary }}>
                    ₹{distributionData.reduce((acc, curr) => acc + curr.revenue, 0).toLocaleString()}
                 </p>
              </div>
              <div className='text-center'>
                 <p className='text-xs font-medium uppercase tracking-tighter' style={{ color: colors.textSecondary }}>Avg. Share</p>
                 <p className='text-xl font-bold' style={{ color: colors.warning || '#f59e0b' }}>
                    {(100 / (distributionData.length || 1)).toFixed(1)}%
                 </p>
              </div>
           </div>
        </div>
      </div>

      {/* Sales Progress & Latest Comments */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Sales Progress Card */}
        <div
          className='p-6 rounded-lg border shadow-md'
          style={{
            backgroundColor: colors.background,
            borderColor: colors.accent + '30'
          }}
        >
          <h3 className='text-xl font-bold mb-6' style={{ color: colors.text }}>
            Sales Data
          </h3>
          <div className='space-y-6'>
            {salesData.map((sale, index) => (
              <div key={index}>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm font-medium' style={{ color: colors.text }}>
                    {sale.name}
                  </span>
                  <span className='text-sm font-bold' style={{ color: sale.color }}>
                    {sale.percentage}%
                  </span>
                </div>
                <div
                  className='h-3 rounded-full overflow-hidden'
                  style={{ backgroundColor: colors.accent + '20' }}
                >
                  <div
                    className='h-full rounded-full transition-all duration-500'
                    style={{
                      width: `${sale.percentage}%`,
                      backgroundColor: sale.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Comments Card with Reply */}
        <div
          className='p-6 rounded-lg border shadow-md'
          style={{
            backgroundColor: colors.background,
            borderColor: colors.accent + '30'
          }}
        >
          <h3 className='text-xl font-bold mb-6' style={{ color: colors.text }}>
            Latest Shorts Comments
          </h3>
          <div className='space-y-4 max-h-96 overflow-y-auto custom-scrollbar'>
            {comments.map((comment) => (
              <div key={comment.id}>
                <div
                  className='p-4 rounded-lg transition-all duration-200 hover:shadow-md'
                  style={{
                    backgroundColor: colors.accent + '10',
                    borderLeft: `3px solid ${colors.primary}`
                  }}
                >
                  <div className='flex items-start space-x-3'>
                    <div 
                      className='w-9 h-9 rounded-full flex items-center justify-center shrink-0'
                      style={{ backgroundColor: colors.primary + '20' }}
                    >
                      <MdPerson size={18} style={{ color: colors.primary }} />
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center justify-between mb-1'>
                        <h4 className='text-sm font-semibold' style={{ color: colors.text }}>
                          {comment.user}
                        </h4>
                        <span className='text-xs' style={{ color: colors.textSecondary }}>
                          {comment.time}
                        </span>
                      </div>
                      <p className='text-sm mb-2' style={{ color: colors.textSecondary }}>
                        {comment.comment}
                      </p>
                      <button
                        onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                        className='text-xs cursor-pointer font-medium hover:underline'
                        style={{ color: colors.primary }}
                      >
                        Reply
                      </button>
                      
                      {/* Replies */}
                      {comment.replies.length > 0 && (
                        <div className='mt-3 space-y-2 pl-4 border-l-2' style={{ borderColor: colors.accent + '40' }}>
                          {comment.replies.map((reply, idx) => (
                            <div key={idx} className='text-xs'>
                              <p style={{ color: colors.text }}>
                                <span className='font-semibold'>You:</span> {reply.text}
                              </p>
                              <span style={{ color: colors.textSecondary }}>{reply.time}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Reply Input */}
                {replyTo === comment.id && (
                  <div className='mt-2 ml-8 flex items-center space-x-2'>
                    <input
                      type='text'
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder='Write a reply...'
                      className='flex-1 px-3 py-2 rounded-lg text-sm outline-none'
                      style={{
                        backgroundColor: colors.accent + '10',
                        color: colors.text,
                        border: `1px solid ${colors.accent}40`
                      }}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleReply(comment.id)
                      }}
                    />
                    <button
                      onClick={() => handleReply(comment.id)}
                      className='p-2 cursor-pointer rounded-lg transition-all hover:opacity-80'
                      style={{ backgroundColor: colors.primary, color: colors.background }}
                    >
                      <MdSend size={18} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trending Shorts Section */}
      <div
        className='p-6 rounded-lg border shadow-md'
        style={{
          backgroundColor: colors.background,
          borderColor: colors.accent + '30'
        }}
      >
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-3'>
            <div 
              className='w-10 h-10 rounded-lg flex items-center justify-center'
              style={{ backgroundColor: '#ef4444' + '20' }}
            >
              <MdTrendingUp size={20} style={{ color: '#ef4444' }} />
            </div>
            <div>
              <h3 className='text-xl font-bold' style={{ color: colors.text }}>Trending Shorts</h3>
              <p className='text-xs' style={{ color: colors.textSecondary }}>Top performing shorts by views</p>
            </div>
          </div>
          <span 
            className='text-xs px-3 py-1 rounded-full font-semibold'
            style={{ backgroundColor: '#ef4444' + '20', color: '#ef4444' }}
          >
            {shorts.length} Shorts
          </span>
        </div>
        
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {/* Sort shorts by likes (views) in descending order */}
          {[...shorts]
            .sort((a, b) => b.likes - a.likes)
            .slice(0, 6)
            .map((short, index) => (
              <div
                key={short.id}
                className='rounded-lg overflow-hidden border shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-[1.02]'
                style={{
                  backgroundColor: colors.sidebar || colors.background,
                  borderColor: colors.accent + '20'
                }}
              >
                {/* Video Thumbnail */}
                <div className='relative aspect-video bg-gray-900'>
                  <video 
                    src={short.videoUrl} 
                    className='w-full h-full object-cover'
                    muted
                  />
                  {/* Trending Badge */}
                  {index < 3 && (
                    <div 
                      className='absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1'
                      style={{ 
                        backgroundColor: index === 0 ? '#ef4444' : index === 1 ? '#f97316' : '#eab308',
                        color: '#fff'
                      }}
                    >
                      🔥 #{index + 1}
                    </div>
                  )}
                  {/* Play Icon Overlay */}
                  <div className='absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity'>
                    <div className='w-14 h-14 rounded-full flex items-center justify-center bg-white/30 backdrop-blur'>
                      <MdMovie size={28} className='text-white' />
                    </div>
                  </div>
                  {/* Status Badge */}
                  <div 
                    className={`absolute top-2 right-2 px-2 py-0.5 rounded text-xs font-bold ${
                      short.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                    } text-white`}
                  >
                    {short.status}
                  </div>
                </div>
                
                {/* Content */}
                <div className='p-4'>
                  <div className='flex items-start gap-3'>
                    <div 
                      className='w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0'
                      style={{ backgroundColor: colors.primary + '20', color: colors.primary }}
                    >
                      {short.instructor?.charAt(0) || 'A'}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h4 className='font-bold text-sm truncate' style={{ color: colors.text }}>
                        {short.instructor}
                      </h4>
                      <p 
                        className='text-xs mt-1 line-clamp-2'
                        style={{ color: colors.textSecondary }}
                      >
                        {short.description}
                      </p>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className='flex items-center justify-between mt-4 pt-3 border-t' style={{ borderColor: colors.accent + '20' }}>
                    <div className='flex items-center gap-1.5 text-xs font-medium' style={{ color: '#ef4444' }}>
                      <MdFavorite size={14} style={{ fill: '#ef4444' }} />
                      <span>{short.likes?.toLocaleString() || 0}</span>
                    </div>
                    <div className='flex items-center gap-1.5 text-xs font-medium' style={{ color: colors.textSecondary }}>
                      <MdShare size={14} />
                      <span>{short.shares || 0}</span>
                    </div>
                    <div className='flex items-center gap-1.5 text-xs font-medium' style={{ color: colors.textSecondary }}>
                      <MdVisibility size={14} />
                      <span>{short.comments?.length || 0} Comments</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
        
        {shorts.length === 0 && (
          <div className='text-center py-12 opacity-50'>
            <Film size={48} className='mx-auto mb-3' style={{ color: colors.textSecondary }} />
            <p style={{ color: colors.textSecondary }}>No shorts available</p>
          </div>
        )}
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${colors.accent}20;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${colors.primary};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${colors.primary}dd;
        }
      `}</style>
    </div>
  )
}

export default Home