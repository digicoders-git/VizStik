import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { MdPeople, MdStorefront, MdCheckCircle, MdCancel } from 'react-icons/md';
import { getEmployees } from '../apis/employee';
import { getShops } from '../apis/shop';
import Loader from '../components/ui/Loader';

const Home = () => {
  const { colors } = useTheme();
  const [filter, setFilter] = useState('Year'); // Day, Week, Month, Year
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ employees: [], shops: [] });
  
  // Stats state (Total All Time)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalShops: 0,
    activeShops: 0,
    inactiveShops: 0
  });

  // Graph Data State (Filtered)
  const [chartData, setChartData] = useState({
    categories: [],
    series: { employees: [], shops: [] },
    filteredCounts: { employees: 0, shops: 0 },
    shopStatus: { active: 0, inactive: 0 }
  });

  // Calculate greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Helper: Get Date Range and Labels based on Filter
  const processFilteredData = (employees, shops, filterType) => {
    const now = new Date();
    let categories = [];
    let empCounts = [];
    let shopCounts = [];
    
    // Dataset for Pie/Column charts (items in range)
    let filteredEmp = [];
    let filteredShops = [];

    const isSameDate = (d1, d2) => 
      d1.getDate() === d2.getDate() && 
      d1.getMonth() === d2.getMonth() && 
      d1.getFullYear() === d2.getFullYear();

    if (filterType === 'Day') {
      // Last 7 Days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        categories.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
        
        const dayStart = new Date(d.setHours(0,0,0,0));
        const dayEnd = new Date(d.setHours(23,59,59,999));

        const eCount = employees.filter(e => {
            const c = new Date(e.createdAt);
            return c >= dayStart && c <= dayEnd;
        });
        const sCount = shops.filter(s => {
            const c = new Date(s.createdAt);
            return c >= dayStart && c <= dayEnd;
        });

        empCounts.push(eCount.length);
        shopCounts.push(sCount.length);
        filteredEmp = [...filteredEmp, ...eCount];
        filteredShops = [...filteredShops, ...sCount];
      }
    } else if (filterType === 'Week') {
      // Last 4 Weeks
      for (let i = 3; i >= 0; i--) {
        categories.push(`Week ${4-i}`);
        // Simple approximation: 1 week chunks backwards from now
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7) - 6);
        weekStart.setHours(0,0,0,0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23,59,59,999);

        const eCount = employees.filter(e => {
            const c = new Date(e.createdAt);
            return c >= weekStart && c <= weekEnd;
        });
        const sCount = shops.filter(s => {
            const c = new Date(s.createdAt);
            return c >= weekStart && c <= weekEnd;
        });

        empCounts.push(eCount.length);
        shopCounts.push(sCount.length);
        filteredEmp = [...filteredEmp, ...eCount];
        filteredShops = [...filteredShops, ...sCount];
      }
    } else if (filterType === 'Month') {
      // Last 12 Months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        categories.push(monthNames[d.getMonth()]);
        
        const monthStart = new Date(d.getFullYear(), d.getMonth(), 1);
        const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

        const eCount = employees.filter(e => {
            const c = new Date(e.createdAt);
            return c >= monthStart && c <= monthEnd;
        });
        const sCount = shops.filter(s => {
            const c = new Date(s.createdAt);
            return c >= monthStart && c <= monthEnd;
        });

        empCounts.push(eCount.length);
        shopCounts.push(sCount.length);
        filteredEmp = [...filteredEmp, ...eCount];
        filteredShops = [...filteredShops, ...sCount];
      }
    } else {
        // Year (Default - Current Year Monthly) - Same as Month logic basically but strictly current year
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentYear = now.getFullYear();
        categories = monthNames;
        
        for (let i = 0; i < 12; i++) {
             const monthStart = new Date(currentYear, i, 1);
             const monthEnd = new Date(currentYear, i + 1, 0, 23, 59, 59);

             const eCount = employees.filter(e => {
                const c = new Date(e.createdAt);
                return c >= monthStart && c <= monthEnd;
             });
             const sCount = shops.filter(s => {
                const c = new Date(s.createdAt);
                return c >= monthStart && c <= monthEnd;
             });

             empCounts.push(eCount.length);
             shopCounts.push(sCount.length);
             filteredEmp = [...filteredEmp, ...eCount];
             filteredShops = [...filteredShops, ...sCount];
        }
    }

    // Pie Chart Data
    const activeShops = filteredShops.filter(s => s.isActive).length;
    const inactiveShops = filteredShops.length - activeShops;

    setChartData({
        categories,
        series: { employees: empCounts, shops: shopCounts },
        filteredCounts: { employees: filteredEmp.length, shops: filteredShops.length },
        shopStatus: { active: activeShops, inactive: inactiveShops }
    });
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [employeesData, shopsData] = await Promise.all([
          getEmployees(),
          getShops()
        ]);

        const shops = shopsData.shops || [];
        const employees = employeesData.employees || [];
        
        setData({ employees, shops });

        const activeShopsCount = shops.filter(s => s.isActive).length;
        setStats({
          totalEmployees: employees.length,
          totalShops: shops.length,
          activeShops: activeShopsCount,
          inactiveShops: shops.length - activeShopsCount
        });

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update charts when filter changes
  useEffect(() => {
    if (data.employees.length || data.shops.length) {
        processFilteredData(data.employees, data.shops, filter);
    }
  }, [filter, data]);

  // Growth Line Chart
  const lineChartOptions = {
    chart: { type: 'spline', backgroundColor: 'transparent', height: 350 },
    title: {
      text: `Growth Overview (${filter})`,
      align: 'left',
      style: { color: colors.text, fontSize: '18px', fontWeight: 'bold' }
    },
    subtitle: {
        text: 'New additions over time',
        align: 'left',
        style: { color: colors.textSecondary }
    },
    xAxis: {
      categories: chartData.categories,
      labels: { style: { color: colors.textSecondary } },
      lineColor: colors.accent + '40',
      gridLineWidth: 0
    },
    yAxis: {
      title: { text: null },
      labels: { style: { color: colors.textSecondary } },
      gridLineColor: colors.accent + '20'
    },
    legend: { itemStyle: { color: colors.text }, itemHoverStyle: { color: colors.primary } },
    tooltip: { shared: true, backgroundColor: colors.background, style: { color: colors.text } },
    plotOptions: { spline: { marker: { radius: 4, lineColor: '#666666', lineWidth: 1 } } },
    credits: { enabled: false },
    series: [
      { name: 'Employees', data: chartData.series.employees, color: colors.primary },
      { name: 'Shops', data: chartData.series.shops, color: '#f59e0b' }
    ]
  };

  // Shop Status Pie Chart
  const shopStatusChartOptions = {
    chart: { type: 'pie', backgroundColor: 'transparent', height: 300 },
    title: { text: `New Shops Status (${filter})`, style: { color: colors.text } },
    tooltip: { pointFormat: '<b>{point.y}</b> Shops ({point.percentage:.1f}%)' },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: { enabled: true, format: '<b>{point.name}</b>: {point.y}', style: { color: colors.textSecondary } },
        showInLegend: true
      }
    },
    legend: { itemStyle: { color: colors.text }, itemHoverStyle: { color: colors.primary } },
    credits: { enabled: false },
    series: [{
      name: 'Shops',
      colorByPoint: true,
      data: [
        { name: 'Active', y: chartData.shopStatus.active, color: '#22c55e' },
        { name: 'Inactive', y: chartData.shopStatus.inactive, color: '#ef4444' }
      ]
    }]
  };

  // Overview Column Chart
  const overviewChartOptions = {
    chart: { type: 'column', backgroundColor: 'transparent', height: 300 },
    title: { text: `Total Added (${filter})`, style: { color: colors.text } },
    xAxis: {
      categories: ['Employees', 'Shops'],
      labels: { style: { color: colors.textSecondary } },
      lineColor: colors.accent + '40'
    },
    yAxis: {
      title: { text: 'Count', style: { color: colors.textSecondary } },
      labels: { style: { color: colors.textSecondary } },
      gridLineColor: colors.accent + '20'
    },
    legend: { enabled: false },
    tooltip: { shared: true, backgroundColor: colors.background, style: { color: colors.text } },
    plotOptions: { column: { borderRadius: 5, dataLabels: { enabled: true, style: { color: colors.text } } } },
    credits: { enabled: false },
    series: [{
      name: 'Total Added',
      data: [
        { y: chartData.filteredCounts.employees, color: colors.primary },
        { y: chartData.filteredCounts.shops, color: '#f59e0b' }
      ]
    }]
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-10">
        <Loader size={60} />
      </div>
    );
  }

  return (
    <div className='p-6 space-y-8'>
      {/* Greeting Section */}
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
        <div>
          <h1 className='text-3xl md:text-4xl font-bold mb-2' style={{ color: colors.text }}>
            {getGreeting()}, Admin
          </h1>
          <p className='text-base' style={{ color: colors.textSecondary }}>
            Overview of your platform's performance.
          </p>
        </div>
        
        {/* Global Filter */}
        <div className='flex items-center bg-gray-100/10 p-1 rounded-lg border' 
             style={{ borderColor: colors.accent + '30', backgroundColor: colors.accent + '10' }}>
          {['Day', 'Week', 'Month', 'Year'].map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`px-4 cursor-pointer py-1.5 rounded-md text-sm font-medium transition-all ${
                filter === item ? 'shadow-sm' : 'hover:bg-black/5'
              }`}
              style={{
                backgroundColor: filter === item ? colors.background : 'transparent',
                color: filter === item ? colors.primary : colors.textSecondary
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Total Employees */}
        <div className='p-6 rounded-xl border shadow-sm transition-all hover:scale-105'
             style={{ backgroundColor: colors.background, borderColor: colors.accent + '30' }}>
          <div className='flex items-center justify-between mb-4'>
            <div className='p-3 rounded-lg' style={{ backgroundColor: colors.primary + '20' }}>
              <MdPeople size={24} style={{ color: colors.primary }} />
            </div>
          </div>
          <h3 className='text-3xl font-bold mb-1' style={{ color: colors.text }}>
            {stats.totalEmployees}
          </h3>
          <p className='text-sm' style={{ color: colors.textSecondary }}>Total Employees</p>
        </div>

        {/* Total Shops */}
        <div className='p-6 rounded-xl border shadow-sm transition-all hover:scale-105'
             style={{ backgroundColor: colors.background, borderColor: colors.accent + '30' }}>
          <div className='flex items-center justify-between mb-4'>
            <div className='p-3 rounded-lg' style={{ backgroundColor: '#f59e0b20' }}>
              <MdStorefront size={24} style={{ color: '#f59e0b' }} />
            </div>
          </div>
          <h3 className='text-3xl font-bold mb-1' style={{ color: colors.text }}>
            {stats.totalShops}
          </h3>
          <p className='text-sm' style={{ color: colors.textSecondary }}>Total Shops</p>
        </div>

        {/* Active Shops */}
        <div className='p-6 rounded-xl border shadow-sm transition-all hover:scale-105'
             style={{ backgroundColor: colors.background, borderColor: colors.accent + '30' }}>
          <div className='flex items-center justify-between mb-4'>
            <div className='p-3 rounded-lg' style={{ backgroundColor: '#22c55e20' }}>
              <MdCheckCircle size={24} style={{ color: '#22c55e' }} />
            </div>
          </div>
          <h3 className='text-3xl font-bold mb-1' style={{ color: colors.text }}>
            {stats.activeShops}
          </h3>
          <p className='text-sm' style={{ color: colors.textSecondary }}>Active Shops</p>
        </div>

        {/* Inactive Shops */}
        <div className='p-6 rounded-xl border shadow-sm transition-all hover:scale-105'
             style={{ backgroundColor: colors.background, borderColor: colors.accent + '30' }}>
          <div className='flex items-center justify-between mb-4'>
            <div className='p-3 rounded-lg' style={{ backgroundColor: '#ef444420' }}>
              <MdCancel size={24} style={{ color: '#ef4444' }} />
            </div>
          </div>
          <h3 className='text-3xl font-bold mb-1' style={{ color: colors.text }}>
            {stats.inactiveShops}
          </h3>
          <p className='text-sm' style={{ color: colors.textSecondary }}>Inactive Shops</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className='flex flex-col gap-6'>
        {/* Growth Line Chart (Full Width) */}
        <div className='p-6 rounded-xl border shadow-sm'
             style={{ backgroundColor: colors.background, borderColor: colors.accent + '30' }}>
           <HighchartsReact highcharts={Highcharts} options={lineChartOptions} />
        </div>

        {/* Bottom Split Charts */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Shop Status Chart */}
          <div className='p-6 rounded-xl border shadow-sm'
               style={{ backgroundColor: colors.background, borderColor: colors.accent + '30' }}>
             <HighchartsReact highcharts={Highcharts} options={shopStatusChartOptions} />
          </div>

          {/* Overview Chart */}
          <div className='p-6 rounded-xl border shadow-sm'
               style={{ backgroundColor: colors.background, borderColor: colors.accent + '30' }}>
             <HighchartsReact highcharts={Highcharts} options={overviewChartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;