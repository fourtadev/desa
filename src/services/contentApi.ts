import { ApiResponse } from '../types';

// Content Management API Service
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface WebsiteContent {
  id: number;
  content_key: string;
  content_value: string;
  content_type: 'text' | 'textarea' | 'html' | 'json';
  page: string;
  section: string;
  label: string;
  description: string;
  is_required: boolean;
  max_length: number | null;
  sort_order: number;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface WebsiteSection {
  id: number;
  section_key: string;
  section_name: string;
  page: string;
  description: string;
  icon: string;
  sort_order: number;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface ContentByPage {
  [page: string]: {
    [section: string]: {
      [key: string]: string;
    };
  };
}

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

// Get all website content
export const getWebsiteContent = async (): Promise<ContentByPage> => {
  try {
    // Mock data for development - replace with actual API call
    const mockContent: ContentByPage = {
      homepage: {
        hero: {
          hero_title: 'Selamat Datang di Desa Maju Sejahtera',
          hero_subtitle: 'Menuju Desa Modern dan Sejahtera',
          hero_description: 'Website resmi desa yang menyediakan informasi terkini dan layanan publik untuk masyarakat'
        },
        about_preview: {
          about_preview_title: 'Tentang Desa Maju Sejahtera',
          about_preview_description: 'Desa modern yang mengutamakan pelayanan publik yang prima dan transparansi dalam pengelolaan pemerintahan.',
          about_preview_button: 'Selengkapnya'
        },
        services_preview: {
          services_preview_title: 'Layanan Publik',
          services_preview_description: 'Berbagai layanan administratif untuk masyarakat',
          services_preview_button: 'Lihat Semua Layanan'
        },
        statistics: {
          statistics_title: 'Data Statistik Desa'
        }
      },
      about: {
        about_hero: {
          about_hero_title: 'Tentang Desa Maju Sejahtera',
          about_hero_subtitle: 'Menuju Desa Modern dan Sejahtera'
        },
        about_content: {
          about_content_title: 'Sejarah & Profil Desa',
          about_content_text: 'Desa yang terletak di kawasan strategis dengan potensi alam yang melimpah. Desa ini memiliki sejarah panjang dan kaya akan budaya lokal yang masih dilestarikan hingga saat ini.'
        },
        vision_mission: {
          vision_title: 'Visi',
          vision_text: 'Mewujudkan desa yang maju, mandiri, dan sejahtera berdasarkan nilai-nilai gotong royong dan kearifan lokal.',
          mission_title: 'Misi',
          mission_text: JSON.stringify([
            'Meningkatkan kualitas pelayanan publik yang prima dan transparan',
            'Mengembangkan potensi ekonomi lokal dan pariwisata desa',
            'Membangun infrastruktur yang mendukung kemajuan desa',
            'Melestarikan budaya dan tradisi lokal yang bernilai positif',
            'Meningkatkan partisipasi masyarakat dalam pembangunan desa'
          ])
        },
        achievements: {
          achievements_title: 'Prestasi & Penghargaan',
          achievements_subtitle: 'Pencapaian yang membanggakan'
        }
      },
      contact: {
        contact_hero: {
          contact_hero_title: 'Hubungi Kami',
          contact_hero_subtitle: 'Kami siap membantu dan mendengarkan aspirasi Anda'
        },
        contact_form: {
          contact_form_title: 'Kirim Pesan',
          contact_form_name_label: 'Nama Lengkap',
          contact_form_email_label: 'Email',
          contact_form_subject_label: 'Subjek',
          contact_form_message_label: 'Pesan',
          contact_form_submit_button: 'Kirim Pesan',
          contact_form_success_message: 'Pesan berhasil dikirim! Kami akan segera merespons.'
        },
        contact_info: {
          contact_info_title: 'Informasi Kontak',
          contact_address_label: 'Alamat',
          contact_phone_label: 'Telepon',
          contact_email_label: 'Email',
          contact_hours_label: 'Jam Operasional'
        }
      },
      services: {
        services_hero: {
          services_hero_title: 'Layanan Publik',
          services_hero_subtitle: 'Berbagai layanan administratif untuk masyarakat'
        },
        services_info: {
          services_list_title: 'Daftar Layanan',
          services_list_subtitle: 'Pilih layanan yang Anda butuhkan',
          services_track_title: 'Lacak Status Pengajuan',
          services_track_subtitle: 'Cek status pengajuan layanan Anda',
          services_track_placeholder: 'Masukkan nomor pengajuan',
          services_track_button: 'Cek Status'
        }
      },
      news: {
        news_hero: {
          news_hero_title: 'Berita Desa',
          news_hero_subtitle: 'Informasi terkini dan terpercaya dari desa',
          news_search_placeholder: 'Cari berita...',
          news_read_more: 'Baca Selengkapnya',
          news_view_all: 'Lihat Semua Berita'
        }
      },
      gallery: {
        gallery_hero: {
          gallery_hero_title: 'Galeri Foto',
          gallery_hero_subtitle: 'Dokumentasi kegiatan dan momen berharga di desa',
          gallery_search_placeholder: 'Cari foto...',
          gallery_all_categories: 'Semua Kategori'
        }
      },
      events: {
        events_hero: {
          events_hero_title: 'Agenda Kegiatan',
          events_hero_subtitle: 'Jadwal kegiatan dan acara di desa',
          events_upcoming_title: 'Kegiatan Mendatang',
          events_past_title: 'Kegiatan Sebelumnya',
          events_search_placeholder: 'Cari kegiatan...'
        }
      },
      organization: {
        organization_hero: {
          organization_hero_title: 'Struktur Organisasi',
          organization_hero_subtitle: 'Profil perangkat desa dan struktur pemerintahan'
        },
        organization_info: {
          organization_duties_title: 'Tugas dan Tanggung Jawab',
          organization_duties_subtitle: 'Setiap perangkat desa memiliki tugas dan tanggung jawab yang jelas'
        }
      },
      global: {
        navigation: {
          nav_home: 'Beranda',
          nav_about: 'Tentang',
          nav_news: 'Berita',
          nav_gallery: 'Galeri',
          nav_events: 'Agenda',
          nav_organization: 'Struktur',
          nav_services: 'Layanan',
          nav_contact: 'Kontak'
        },
        footer: {
          footer_quick_links_title: 'Tautan Cepat',
          footer_contact_title: 'Kontak',
          footer_follow_us: 'Ikuti Kami',
          footer_copyright: '© 2024 Desa Maju Sejahtera. All rights reserved.'
        },
        buttons: {
          btn_submit: 'Kirim',
          btn_cancel: 'Batal',
          btn_save: 'Simpan',
          btn_edit: 'Edit',
          btn_delete: 'Hapus',
          btn_view: 'Lihat',
          btn_download: 'Download',
          btn_back: 'Kembali',
          btn_next: 'Selanjutnya',
          btn_previous: 'Sebelumnya',
          btn_search: 'Cari',
          btn_filter: 'Filter'
        },
        messages: {
          msg_loading: 'Memuat...',
          msg_no_data: 'Tidak ada data yang ditemukan',
          msg_error: 'Terjadi kesalahan. Silakan coba lagi.',
          msg_success: 'Berhasil!',
          msg_confirm_delete: 'Apakah Anda yakin ingin menghapus item ini?',
          msg_required_field: 'Field ini wajib diisi',
          msg_invalid_email: 'Format email tidak valid',
          msg_file_too_large: 'Ukuran file terlalu besar',
          msg_invalid_file_type: 'Tipe file tidak didukung'
        }
      }
    };

    return mockContent;
  } catch (error) {
    console.error('Error fetching website content:', error);
    return {};
  }
};

// Get content by page
export const getContentByPage = async (page: string): Promise<ContentByPage[string]> => {
  try {
    const allContent = await getWebsiteContent();
    return allContent[page] || {};
  } catch (error) {
    console.error('Error fetching content by page:', error);
    return {};
  }
};

// Get specific content value
export const getContentValue = async (page: string, section: string, key: string): Promise<string> => {
  try {
    const pageContent = await getContentByPage(page);
    return pageContent[section]?.[key] || '';
  } catch (error) {
    console.error('Error fetching content value:', error);
    return '';
  }
};

// Admin functions for content management
export const getAllWebsiteContent = async (): Promise<WebsiteContent[]> => {
  try {
    return await apiRequest<WebsiteContent[]>('/admin/website-content');
  } catch (error) {
    console.error('Error fetching all website content:', error);
    return [];
  }
};

export const getWebsiteSections = async (): Promise<WebsiteSection[]> => {
  try {
    return await apiRequest<WebsiteSection[]>('/admin/website-sections');
  } catch (error) {
    console.error('Error fetching website sections:', error);
    return [];
  }
};

export const updateWebsiteContent = async (id: number, content: Partial<WebsiteContent>): Promise<ApiResponse<WebsiteContent>> => {
  try {
    return await apiRequest<ApiResponse<WebsiteContent>>(`/admin/website-content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(content),
    });
  } catch (error) {
    console.error('Error updating website content:', error);
    return { success: false, message: 'Failed to update content' };
  }
};

export const createWebsiteContent = async (content: Partial<WebsiteContent>): Promise<ApiResponse<WebsiteContent>> => {
  try {
    return await apiRequest<ApiResponse<WebsiteContent>>('/admin/website-content', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  } catch (error) {
    console.error('Error creating website content:', error);
    return { success: false, message: 'Failed to create content' };
  }
};

export const deleteWebsiteContent = async (id: number): Promise<ApiResponse<boolean>> => {
  try {
    return await apiRequest<ApiResponse<boolean>>(`/admin/website-content/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting website content:', error);
    return { success: false, message: 'Failed to delete content' };
  }
};

// Helper function to replace placeholders in content
export const processContentValue = (value: string, replacements: Record<string, string> = {}): string => {
  let processedValue = value;
  
  // Default replacements
  const defaultReplacements = {
    '{village_name}': 'Desa Maju Sejahtera',
    '{village_slogan}': 'Menuju Desa Modern dan Sejahtera',
    '{year}': new Date().getFullYear().toString(),
    ...replacements
  };
  
  // Replace placeholders
  Object.entries(defaultReplacements).forEach(([placeholder, replacement]) => {
    processedValue = processedValue.replace(new RegExp(placeholder, 'g'), replacement);
  });
  
  return processedValue;
};