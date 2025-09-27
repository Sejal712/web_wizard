import React, { createContext, useContext, useState, useRef } from 'react';
import axios from 'axios';

const ImageContext = createContext();

export const useImages = () => {
  const context = useContext(ImageContext);
  if (!context) {
    throw new Error('useImages must be used within an ImageProvider');
  }
  return context;
};

export const ImageProvider = ({ children }) => {
  const [images, setImages] = useState([]);
  const [pendingImages, setPendingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const fetchTimeoutRef = useRef(null);

  const uploadImage = async (formData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post('/api/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      
      if (response.data.success) {
        return { success: true, data: response.data.image };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Upload failed'
      };
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async (status = 'approved', page = 1, limit = 20, search = '') => {
    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Debounce the request to prevent excessive API calls
    return new Promise((resolve) => {
      fetchTimeoutRef.current = setTimeout(async () => {
        try {
          setLoading(true);
          const params = new URLSearchParams({
            status,
            page: page.toString(),
            limit: limit.toString(),
            ...(search && { search })
          });

          const token = localStorage.getItem('token');
          const response = await axios.get(`/api/images?${params}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.data.success) {
            if (status === 'approved') {
              setImages(response.data.images);
            } else if (status === 'pending') {
              setPendingImages(response.data.images);
            }
            resolve({
              success: true,
              images: response.data.images,
              pagination: response.data.pagination
            });
          }
        } catch (error) {
          console.error('Fetch images error:', error);
          resolve({
            success: false,
            message: error.response?.data?.message || 'Failed to fetch images'
          });
        } finally {
          setLoading(false);
        }
      }, 300); // 300ms debounce
    });
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/images/stats/summary', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data.success) {
        setStats(response.data.stats);
        return { success: true, stats: response.data.stats };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch stats'
      };
    }
  };

  const approveImage = async (imageId, action, rejectionReason = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(`/api/admin/images/${imageId}/approve`, {
        action,
        rejection_reason: rejectionReason
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.success) {
        // Update local state
        setPendingImages(prev => prev.filter(img => img.id !== imageId));
        
        if (action === 'approve') {
          setImages(prev => [response.data.image, ...prev]);
        }
        
        // Refresh stats
        await fetchStats();
        
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to process image'
      };
    }
  };

  const bulkApprove = async (imageIds, action, rejectionReason = '') => {
    try {
      const response = await axios.patch('/api/admin/images/bulk', {
        image_ids: imageIds,
        action,
        rejection_reason: rejectionReason
      });

      if (response.data.success) {
        // Update local state
        setPendingImages(prev => prev.filter(img => !imageIds.includes(img.id)));
        
        // Refresh data
        await fetchImages('pending');
        await fetchStats();
        
        return { success: true, processedCount: response.data.processedCount };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to process bulk action'
      };
    }
  };

  const deleteImage = async (imageId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`/api/admin/images/${imageId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data.success) {
        // Update local state
        setImages(prev => prev.filter(img => img.id !== imageId));
        setPendingImages(prev => prev.filter(img => img.id !== imageId));
        
        // Refresh stats
        await fetchStats();
        
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete image'
      };
    }
  };

  const value = {
    images,
    pendingImages,
    loading,
    stats,
    uploadImage,
    fetchImages,
    fetchStats,
    approveImage,
    bulkApprove,
    deleteImage
  };

  return (
    <ImageContext.Provider value={value}>
      {children}
    </ImageContext.Provider>
  );
};
