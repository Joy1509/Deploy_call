import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

const EngineerAnalytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30');
  const [sortField, setSortField] = useState('completionRate');
  const [sortDirection, setSortDirection] = useState('desc');
  const { user } = useAuthStore();

  const timeFilters = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 3 months' },
    { value: '180', label: 'Last 6 months' },
    { value: 'all', label: 'All time' }
  ];

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/analytics/engineers?days=${timeFilter}`);
      setAnalytics(response.data.engineers || []);
    } catch (error) {
      toast.error('Failed to fetch analytics');
      setAnalytics([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'HOST') {
      fetchAnalytics();
    }
  }, [timeFilter, user]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedAnalytics = [...analytics].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    
    if (sortField === 'username') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  const getSortIcon = (field) => {
    if (sortField !== field) return '↕️';
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  if (user?.role !== 'HOST') {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚫</span>
            <span>Access denied. Only HOST users can view analytics.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">Engineer Analytics 📊</h1>
          <p className="text-gray-600">Performance metrics and insights for all engineers</p>
        </div>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white hover:border-gray-400 transition-colors text-sm w-full sm:w-auto"
        >
          {timeFilters.map(filter => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      {analytics.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl shadow-sm border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-medium text-blue-700 mb-1">Total Engineers</h3>
                <p className="text-2xl sm:text-3xl font-bold text-blue-800">{analytics.length}</p>
              </div>
              <div className="text-blue-500 text-2xl">👥</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 sm:p-6 rounded-xl shadow-sm border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-medium text-green-700 mb-1">Avg Completion</h3>
                <p className="text-2xl sm:text-3xl font-bold text-green-800">
                  {Math.round(analytics.reduce((sum, eng) => sum + eng.completionRate, 0) / analytics.length)}%
                </p>
              </div>
              <div className="text-green-500 text-2xl">✅</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 sm:p-6 rounded-xl shadow-sm border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-medium text-purple-700 mb-1">Total Completed</h3>
                <p className="text-2xl sm:text-3xl font-bold text-purple-800">
                  {analytics.reduce((sum, eng) => sum + eng.completedCalls, 0)}
                </p>
              </div>
              <div className="text-purple-500 text-2xl">🎯</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 sm:p-6 rounded-xl shadow-sm border border-orange-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-medium text-orange-700 mb-1">Total Pending</h3>
                <p className="text-2xl sm:text-3xl font-bold text-orange-800">
                  {analytics.reduce((sum, eng) => sum + eng.pendingCalls, 0)}
                </p>
              </div>
              <div className="text-orange-500 text-2xl">⏳</div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-lg font-medium">Loading analytics...</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span>📈</span> Engineer Performance
            </h2>
          </div>

          {sortedAnalytics.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-lg font-medium">No data available</p>
              <p className="text-sm">No analytics found for the selected time period</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('username')}
                    >
                      Engineer {getSortIcon('username')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('totalCalls')}
                    >
                      Total Assigned {getSortIcon('totalCalls')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('completedCalls')}
                    >
                      Completed {getSortIcon('completedCalls')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('pendingCalls')}
                    >
                      Pending {getSortIcon('pendingCalls')}
                    </th>
                    <th 
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('completionRate')}
                    >
                      Completion Rate {getSortIcon('completionRate')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedAnalytics.map((engineer, index) => (
                    <tr key={engineer.username} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">👨💻</span>
                          <div className="text-sm font-medium text-gray-900">{engineer.username}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {engineer.totalCalls}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {engineer.completedCalls}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-yellow-600">
                        {engineer.pendingCalls}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          engineer.completionRate >= 80 ? 'bg-green-100 text-green-800' :
                          engineer.completionRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {engineer.completionRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {engineer.role}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EngineerAnalytics;