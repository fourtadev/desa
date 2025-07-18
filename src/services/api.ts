import { 
  DesaSettings, News, Gallery, Event, Organization, Service, 
  ServiceSubmission, Document, Admin, ApiResponse, PaginatedResponse 
} from '../types';
import {
  getDesaSettingsFromDB,
  updateDesaSettingsInDB,
  getNewsFromDB,
  getNewsBySlugFromDB,
  createNewsInDB,
  updateNewsInDB,
  deleteNewsFromDB,
  getGalleriesFromDB,
  createGalleryInDB,
  getEventsFromDB,
  createEventInDB,
  getOrganizationFromDB,
  createOrganizationInDB,
  getServicesFromDB,
  createServiceInDB,
  createServiceSubmissionInDB,
  getServiceSubmissionsFromDB,
  loginFromDB,
  createAdminInDB,
  getStatisticsFromDB
} from './databaseService';

// API Base URL - should be configured based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Helper function to make API requests
const apiRequest = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('auth_token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Desa Settings Service
export const getDesaSettings = async (): Promise<DesaSettings> => {
  try {
    // Try to get from database first
    const dbSettings = await getDesaSettingsFromDB();
    
    if (dbSettings) {
      return dbSettings;
    }
    
    // Fallback to default settings if no data in database
    const defaultSettings: DesaSettings = {
      id: 1,
      nama_desa: 'Desa Maju Sejahtera',
      slogan: 'Menuju Desa Modern dan Sejahtera',
      alamat: 'Jl. Desa Maju No. 123, Kecamatan Sejahtera, Kabupaten Makmur, Provinsi Jaya 12345',
      logo: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
      hero_image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&fit=crop',
      primary_color: '#3B82F6',
      secondary_color: '#10B981',
      deskripsi: 'Desa Maju Sejahtera adalah desa yang terletak di kawasan strategis dengan potensi alam yang melimpah. Desa ini memiliki sejarah panjang dan kaya akan budaya lokal yang masih dilestarikan hingga saat ini.',
      created_at: new Date(),
      updated_at: new Date()
    };
    
    return defaultSettings;
  } catch (error) {
    console.error('Error fetching desa settings:', error);
    // Return default settings if API fails
    return {
      id: 0,
      nama_desa: 'Desa Digital',
      slogan: 'Menuju Desa Modern dan Sejahtera',
      alamat: 'Alamat Desa',
      logo: '',
      hero_image: '',
      primary_color: '#3B82F6',
      secondary_color: '#10B981',
      deskripsi: 'Deskripsi desa',
      created_at: new Date(),
      updated_at: new Date()
    };
  }
};

export const updateDesaSettings = async (settings: Partial<DesaSettings>): Promise<ApiResponse<DesaSettings>> => {
  try {
    const success = await updateDesaSettingsInDB(settings);
    
    if (success) {
      const updatedSettings = await getDesaSettingsFromDB();
      return { 
        success: true, 
        data: updatedSettings || undefined,
        message: 'Settings updated successfully' 
      };
    } else {
      return { success: false, message: 'Failed to update settings' };
    }
  } catch (error) {
    console.error('Error updating desa settings:', error);
    return { success: false, message: 'Failed to update settings' };
  }
};

// News Service
export const getNews = async (page: number = 1, limit: number = 10, status: string = 'published'): Promise<PaginatedResponse<News>> => {
  try {
    const { data, total } = await getNewsFromDB(page, limit, status);
    
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    console.error('Error fetching news:', error);
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0
    };
  }
};

export const getNewsBySlug = async (slug: string): Promise<News | null> => {
  try {
    return await getNewsBySlugFromDB(slug);
  } catch (error) {
    console.error('Error fetching news by slug:', error);
    return null;
  }
};

export const createNews = async (newsData: Partial<News>): Promise<ApiResponse<News>> => {
  try {
    const success = await createNewsInDB(newsData);
    
    if (success) {
      return { success: true, message: 'News created successfully' };
    } else {
      return { success: false, message: 'Failed to create news' };
    }
  } catch (error) {
    console.error('Error creating news:', error);
    return { success: false, message: 'Failed to create news' };
  }
};

export const updateNews = async (id: number, newsData: Partial<News>): Promise<ApiResponse<News>> => {
  try {
    const success = await updateNewsInDB(id, newsData);
    
    if (success) {
      return { success: true, message: 'News updated successfully' };
    } else {
      return { success: false, message: 'Failed to update news' };
    }
  } catch (error) {
    console.error('Error updating news:', error);
    return { success: false, message: 'Failed to update news' };
  }
};

export const deleteNews = async (id: number): Promise<ApiResponse<boolean>> => {
  try {
    const success = await deleteNewsFromDB(id);
    
    if (success) {
      return { success: true, message: 'News deleted successfully' };
    } else {
      return { success: false, message: 'Failed to delete news' };
    }
  } catch (error) {
    console.error('Error deleting news:', error);
    return { success: false, message: 'Failed to delete news' };
  }
};

// Gallery Service
export const getGalleries = async (kategori?: string): Promise<Gallery[]> => {
  try {
    return await getGalleriesFromDB(kategori);
  } catch (error) {
    console.error('Error fetching galleries:', error);
    return [];
  }
};

export const createGallery = async (galleryData: Partial<Gallery>): Promise<ApiResponse<Gallery>> => {
  try {
    const success = await createGalleryInDB(galleryData);
    
    if (success) {
      return { success: true, message: 'Gallery item created successfully' };
    } else {
      return { success: false, message: 'Failed to create gallery item' };
    }
  } catch (error) {
    console.error('Error creating gallery:', error);
    return { success: false, message: 'Failed to create gallery item' };
  }
};

// Events Service
export const getEvents = async (): Promise<Event[]> => {
  try {
    return await getEventsFromDB();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const createEvent = async (eventData: Partial<Event>): Promise<ApiResponse<Event>> => {
  try {
    const success = await createEventInDB(eventData);
    
    if (success) {
      return { success: true, message: 'Event created successfully' };
    } else {
      return { success: false, message: 'Failed to create event' };
    }
  } catch (error) {
    console.error('Error creating event:', error);
    return { success: false, message: 'Failed to create event' };
  }
};

// Organization Service
export const getOrganization = async (): Promise<Organization[]> => {
  try {
    return await getOrganizationFromDB();
  } catch (error) {
    console.error('Error fetching organization:', error);
    return [];
  }
};

export const createOrganization = async (orgData: Partial<Organization>): Promise<ApiResponse<Organization>> => {
  try {
    const success = await createOrganizationInDB(orgData);
    
    if (success) {
      return { success: true, message: 'Organization member created successfully' };
    } else {
      return { success: false, message: 'Failed to create organization member' };
    }
  } catch (error) {
    console.error('Error creating organization:', error);
    return { success: false, message: 'Failed to create organization member' };
  }
};

// Services
export const getServices = async (): Promise<Service[]> => {
  try {
    return await getServicesFromDB();
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
};

export const createService = async (serviceData: Partial<Service>): Promise<ApiResponse<Service>> => {
  try {
    const success = await createServiceInDB(serviceData);
    
    if (success) {
      return { success: true, message: 'Service created successfully' };
    } else {
      return { success: false, message: 'Failed to create service' };
    }
  } catch (error) {
    console.error('Error creating service:', error);
    return { success: false, message: 'Failed to create service' };
  }
};

// Service Submissions
export const createServiceSubmission = async (submissionData: Partial<ServiceSubmission>): Promise<ApiResponse<ServiceSubmission>> => {
  try {
    const submission = await createServiceSubmissionInDB(submissionData);
    
    if (submission) {
      return {
        success: true,
        data: submission,
        message: 'Pengajuan berhasil disubmit'
      };
    } else {
      return { success: false, message: 'Failed to create service submission' };
    }
  } catch (error) {
    console.error('Error creating service submission:', error);
    return { success: false, message: 'Failed to create service submission' };
  }
};

export const getServiceSubmissions = async (): Promise<ServiceSubmission[]> => {
  try {
    return await getServiceSubmissionsFromDB();
  } catch (error) {
    console.error('Error fetching service submissions:', error);
    return [];
  }
};

export const updateServiceSubmissionStatus = async (id: number, status: string, catatan?: string): Promise<ApiResponse<boolean>> => {
  try {
    return await apiRequest<ApiResponse<boolean>>(`/service-submissions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, catatan }),
    });
  } catch (error) {
    console.error('Error updating submission status:', error);
    return { success: false, message: 'Failed to update submission status' };
  }
};

// Documents Service
export const getDocuments = async (kategori?: string): Promise<Document[]> => {
  try {
    const params = kategori ? `?kategori=${encodeURIComponent(kategori)}` : '';
    return await apiRequest<Document[]>(`/documents${params}`);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

export const createDocument = async (documentData: Partial<Document>): Promise<ApiResponse<Document>> => {
  try {
    return await apiRequest<ApiResponse<Document>>('/documents', {
      method: 'POST',
      body: JSON.stringify(documentData),
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return { success: false, message: 'Failed to create document' };
  }
};

// Auth Service
export const login = async (email: string, password: string): Promise<ApiResponse<{ admin: Admin; token: string }>> => {
  try {
    // Try database login first
    const admin = await loginFromDB(email, password);
    
    if (admin) {
      const token = btoa(JSON.stringify({ id: admin.id, email: admin.email, timestamp: Date.now() }));
      localStorage.setItem('auth_token', token);
      
      return {
        success: true,
        data: { admin, token },
        message: 'Login berhasil'
      };
    }
    
    // Fallback to demo login
    if (email === 'admin@desa.go.id' && password === 'admin123') {
      const demoAdmin: Admin = {
        id: 1,
        nama: 'Administrator',
        email: 'admin@desa.go.id',
        password: '',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const token = btoa(JSON.stringify({ id: 1, email, timestamp: Date.now() }));
      localStorage.setItem('auth_token', token);
      
      return {
        success: true,
        data: { admin: demoAdmin, token },
        message: 'Login berhasil (demo)'
      };
    } else {
      return {
        success: false,
        message: 'Email atau password salah'
      };
    }
  } catch (error) {
    console.error('Error during login:', error);
    return { success: false, message: 'Login failed' };
  }
};

export const createAdmin = async (adminData: Partial<Admin>): Promise<ApiResponse<Admin>> => {
  try {
    const success = await createAdminInDB(adminData);
    
    if (success) {
      return { success: true, message: 'Admin created successfully' };
    } else {
      return { success: false, message: 'Failed to create admin' };
    }
  } catch (error) {
    console.error('Error creating admin:', error);
    return { success: false, message: 'Failed to create admin' };
  }
};

// Statistics Service
export const getStatistics = async () => {
  try {
    return await getStatisticsFromDB();
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return {
      news: 0,
      gallery: 0,
      events: 0,
      submissions: 0,
      documents: 0,
    };
  }
};