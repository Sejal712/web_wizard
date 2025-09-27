import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Users, Image, Clock, CheckCircle, XCircle, Plus, Edit, Trash2, Eye,
  LogOut, Menu, X, Home, BookOpen, Camera, BarChart3, UserPlus, FileText
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState({});
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    instructions: '',
    due_date: '',
    max_images: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'students') {
      fetchUsers();
    } else if (activeTab === 'assignments') {
      fetchAssignments();
    } else if (activeTab === 'images') {
      fetchData();
    }
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch stats
      const statsResponse = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsData = await statsResponse.json();
      if (statsData.success) setStats(statsData.stats);

      // Fetch assignments
      const assignmentsResponse = await fetch('/api/assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const assignmentsData = await assignmentsResponse.json();
      if (assignmentsData.success) setAssignments(assignmentsData.assignments);

      // Fetch images (all statuses for admin)
      const imagesResponse = await fetch('/api/images?status=all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const imagesData = await imagesResponse.json();
      if (imagesData.success) setImages(imagesData.images);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setStudents(data.users.students);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) setAssignments(data.assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to fetch assignments');
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(assignmentForm)
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success('Assignment created successfully!');
        setShowCreateAssignment(false);
        setAssignmentForm({
          title: '',
          description: '',
          instructions: '',
          due_date: '',
          max_images: 1
        });
        fetchAssignments(); // Refresh assignments
      } else {
        toast.error(data.message || 'Failed to create assignment');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast.error('Failed to create assignment');
    }
  };

  const handleApproveImage = async (imageId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/images/${imageId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ action })
      });

      const data = await response.json();
      
      if (data.success) {
        toast.success(`Image ${action}d successfully!`);
        fetchData(); // Refresh data
      } else {
        toast.error(data.message || `Failed to ${action} image`);
      }
    } catch (error) {
      console.error(`Error ${action}ing image:`, error);
      toast.error(`Failed to ${action} image`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Camera className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">Admin Panel</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 rounded-md hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'overview' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            {sidebarOpen && <span>Overview</span>}
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'students' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Users className="w-5 h-5" />
            {sidebarOpen && <span>Students</span>}
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'assignments' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            {sidebarOpen && <span>Assignments</span>}
          </button>

          <button
            onClick={() => setActiveTab('images')}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              activeTab === 'images' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            <Image className="w-5 h-5" />
            {sidebarOpen && <span>Images</span>}
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {activeTab === 'overview' && 'Dashboard Overview'}
                  {activeTab === 'students' && 'Student Management'}
                  {activeTab === 'assignments' && 'Assignment Management'}
                  {activeTab === 'images' && 'Image Management'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {activeTab === 'overview' && 'Monitor system activity and statistics'}
                  {activeTab === 'students' && 'Manage student accounts and information'}
                  {activeTab === 'assignments' && 'Create and manage assignments'}
                  {activeTab === 'images' && 'Review and manage image submissions'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.totalStudents || 0}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Image className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Images</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.totalImages || 0}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Clock className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Pending Images</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.pendingImages || 0}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Approved Images</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.approvedImages || 0}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {images.slice(0, 5).map((image) => (
                      <div key={image.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <img
                            src={`http://localhost:5000/uploads/${image.filename}`}
                            alt={image.caption}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{image.caption}</p>
                            <p className="text-xs text-gray-500">by {image.uploader_name}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          image.status === 'approved' ? 'bg-green-100 text-green-800' :
                          image.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {image.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Student Management</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.map((student) => (
                        <tr key={student.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.full_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.roll_number}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.department}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.year}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              student.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {student.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Assignment Management</h3>
                <button
                  onClick={() => setShowCreateAssignment(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Assignment</span>
                </button>
              </div>

              {/* Create Assignment Modal */}
              {showCreateAssignment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg p-6 w-full max-w-md">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Assignment</h3>
                    <form onSubmit={handleCreateAssignment} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                          type="text"
                          value={assignmentForm.title}
                          onChange={(e) => setAssignmentForm({...assignmentForm, title: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                          value={assignmentForm.description}
                          onChange={(e) => setAssignmentForm({...assignmentForm, description: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          rows="3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Instructions</label>
                        <textarea
                          value={assignmentForm.instructions}
                          onChange={(e) => setAssignmentForm({...assignmentForm, instructions: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                          rows="3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Due Date</label>
                        <input
                          type="datetime-local"
                          value={assignmentForm.due_date}
                          onChange={(e) => setAssignmentForm({...assignmentForm, due_date: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Max Images</label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={assignmentForm.max_images}
                          onChange={(e) => setAssignmentForm({...assignmentForm, max_images: parseInt(e.target.value)})}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                        />
                      </div>
                      <div className="flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setShowCreateAssignment(false)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Create
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Assignments List */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="space-y-4">
                    {assignments.map((assignment) => (
                      <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-lg font-medium text-gray-900">{assignment.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                              <span>Due: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'No due date'}</span>
                              <span>Max Images: {assignment.max_images}</span>
                              <span className={`px-2 py-1 rounded-full ${
                                assignment.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {assignment.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Images Tab */}
          {activeTab === 'images' && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Image Submissions ({images.length} images)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images.map((image) => (
                    <div key={image.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={`http://localhost:5000/uploads/${image.filename}`}
                        alt={image.caption}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{image.caption}</h4>
                        <p className="text-xs text-gray-500 mt-1">by {image.uploader_name}</p>
                        <p className="text-xs text-gray-500">Roll: {image.roll_number}</p>
                        
                        <div className="mt-2 flex justify-between items-center">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            image.status === 'approved' ? 'bg-green-100 text-green-800' :
                            image.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {image.status}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(image.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Action buttons for pending images */}
                        {image.status === 'pending' && (
                          <div className="mt-3 flex space-x-2">
                            <button
                              onClick={() => handleApproveImage(image.id, 'approve')}
                              className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleApproveImage(image.id, 'reject')}
                              className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700 transition-colors"
                            >
                              ✗ Reject
                            </button>
                          </div>
                        )}

                        {/* Show approval info for approved/rejected images */}
                        {image.status !== 'pending' && image.approved_by && (
                          <div className="mt-2 text-xs text-gray-500">
                            {image.status === 'approved' ? 'Approved' : 'Rejected'} by {image.approved_by}
                            {image.approved_at && (
                              <span className="ml-2">
                                on {new Date(image.approved_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;