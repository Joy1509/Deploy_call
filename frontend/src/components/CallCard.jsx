import React, { useState } from 'react';
import useCallStore from '../store/callStore';
import useAuthStore from '../store/authStore';

const CallCard = ({ call }) => {
  const [showAssign, setShowAssign] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState('');
  
  const { updateCall } = useCallStore();
  const { user, users } = useAuthStore();
  
  const canAssign = user?.role === 'HOST' || user?.role === 'ADMIN';
  const canComplete = call.assignedTo === user?.username || canAssign;

  const handleAssign = async () => {
    if (selectedWorker) {
      await updateCall(call.id, { assignedTo: selectedWorker });
      setShowAssign(false);
      setSelectedWorker('');
    }
  };

  const handleComplete = async () => {
    await updateCall(call.id, {
      status: 'COMPLETED',
      completedBy: user.username,
      completedAt: new Date().toISOString()
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{call.customerName}</h3>
          <p className="text-gray-600">{call.phone}</p>
          {call.email && <p className="text-gray-600 text-sm">{call.email}</p>}
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
          {call.status}
        </span>
      </div>

      <div className="mb-3">
        <p className="text-sm text-gray-700 mb-1"><strong>Category:</strong> {call.category}</p>
        <p className="text-sm text-gray-700 mb-2"><strong>Problem:</strong> {call.problem}</p>
        {call.address && <p className="text-sm text-gray-600"><strong>Address:</strong> {call.address}</p>}
      </div>

      <div className="text-xs text-gray-500 mb-3">
        <p>Created by: {call.createdBy} on {new Date(call.createdAt).toLocaleString()}</p>
        {call.assignedTo && <p>Assigned to: {call.assignedTo}</p>}
        {call.completedBy && (
          <p>Completed by: {call.completedBy} on {new Date(call.completedAt).toLocaleString()}</p>
        )}
      </div>

      <div className="flex gap-2">
        {canAssign && call.status !== 'COMPLETED' && (
          <button
            onClick={() => setShowAssign(!showAssign)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            {call.assignedTo ? 'Reassign' : 'Assign'}
          </button>
        )}
        
        {canComplete && call.status !== 'COMPLETED' && (
          <button
            onClick={handleComplete}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
          >
            Mark Complete
          </button>
        )}
      </div>

      {showAssign && (
        <div className="mt-3 p-3 bg-gray-50 rounded">
          <select
            value={selectedWorker}
            onChange={(e) => setSelectedWorker(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="">Select Worker</option>
            {users.filter(u => u.role === 'USER').map(u => (
              <option key={u.id} value={u.username}>{u.username}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button
              onClick={handleAssign}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Assign
            </button>
            <button
              onClick={() => setShowAssign(false)}
              className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallCard;