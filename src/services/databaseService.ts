import { executeQuery, executeQuerySingle } from '../config/database';
import { 
  DesaSettings, News, Gallery, Event, Organization, 
  Service, ServiceSubmission, Admin 
} from '../types';

// Desa Settings Service
export const getDesaSettingsFromDB = async (): Promise<DesaSettings | null> => {
  const query = 'SELECT * FROM desa_settings ORDER BY id DESC LIMIT 1';
  return await executeQuerySingle<DesaSettings>(query);
};

export const updateDesaSettingsInDB = async (settings: Partial<DesaSettings>): Promise<boolean> => {
  try {
    const fields = Object.keys(settings).filter(key => key !== 'id');
    const values = fields.map(field => settings[field as keyof DesaSettings]);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    const query = `UPDATE desa_settings SET ${setClause}, updated_at = NOW() WHERE id = 1`;
    await executeQuery(query, values);
    return true;
  } catch (error) {
    console.error('Error updating desa settings:', error);
    return false;
  }
};

// News Service
export const getNewsFromDB = async (page: number = 1, limit: number = 10, status: string = 'published'): Promise<{ data: News[], total: number }> => {
  const offset = (page - 1) * limit;
  
  let whereClause = '';
  let params: any[] = [];
  
  if (status !== 'all') {
    whereClause = 'WHERE status = ?';
    params.push(status);
  }
  
  const countQuery = `SELECT COUNT(*) as total FROM news ${whereClause}`;
  const dataQuery = `SELECT * FROM news ${whereClause} ORDER BY tanggal DESC LIMIT ? OFFSET ?`;
  
  const [countResult, newsData] = await Promise.all([
    executeQuerySingle<{ total: number }>(countQuery, params),
    executeQuery<News>(dataQuery, [...params, limit, offset])
  ]);
  
  return {
    data: newsData,
    total: countResult?.total || 0
  };
};

export const getNewsBySlugFromDB = async (slug: string): Promise<News | null> => {
  const query = 'SELECT * FROM news WHERE slug = ? AND status = "published"';
  return await executeQuerySingle<News>(query, [slug]);
};

export const createNewsInDB = async (newsData: Partial<News>): Promise<boolean> => {
  try {
    const query = `
      INSERT INTO news (judul, slug, konten, gambar, tanggal, penulis, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      newsData.judul,
      newsData.slug,
      newsData.konten,
      newsData.gambar || null,
      newsData.tanggal,
      newsData.penulis,
      newsData.status || 'draft'
    ];
    
    await executeQuery(query, params);
    return true;
  } catch (error) {
    console.error('Error creating news:', error);
    return false;
  }
};

export const updateNewsInDB = async (id: number, newsData: Partial<News>): Promise<boolean> => {
  try {
    const fields = Object.keys(newsData).filter(key => key !== 'id');
    const values = fields.map(field => newsData[field as keyof News]);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    const query = `UPDATE news SET ${setClause}, updated_at = NOW() WHERE id = ?`;
    await executeQuery(query, [...values, id]);
    return true;
  } catch (error) {
    console.error('Error updating news:', error);
    return false;
  }
};

export const deleteNewsFromDB = async (id: number): Promise<boolean> => {
  try {
    const query = 'DELETE FROM news WHERE id = ?';
    await executeQuery(query, [id]);
    return true;
  } catch (error) {
    console.error('Error deleting news:', error);
    return false;
  }
};

// Gallery Service
export const getGalleriesFromDB = async (kategori?: string): Promise<Gallery[]> => {
  let query = 'SELECT * FROM galleries';
  let params: any[] = [];
  
  if (kategori) {
    query += ' WHERE kategori = ?';
    params.push(kategori);
  }
  
  query += ' ORDER BY tanggal DESC';
  
  return await executeQuery<Gallery>(query, params);
};

export const createGalleryInDB = async (galleryData: Partial<Gallery>): Promise<boolean> => {
  try {
    const query = `
      INSERT INTO galleries (judul, deskripsi, gambar, kategori, tanggal)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      galleryData.judul,
      galleryData.deskripsi || null,
      galleryData.gambar,
      galleryData.kategori || null,
      galleryData.tanggal
    ];
    
    await executeQuery(query, params);
    return true;
  } catch (error) {
    console.error('Error creating gallery:', error);
    return false;
  }
};

// Events Service
export const getEventsFromDB = async (): Promise<Event[]> => {
  const query = 'SELECT * FROM events ORDER BY tanggal ASC';
  return await executeQuery<Event>(query);
};

export const createEventInDB = async (eventData: Partial<Event>): Promise<boolean> => {
  try {
    const query = `
      INSERT INTO events (judul, deskripsi, tanggal, lokasi, gambar)
      VALUES (?, ?, ?, ?, ?)
    `;
    const params = [
      eventData.judul,
      eventData.deskripsi || null,
      eventData.tanggal,
      eventData.lokasi || null,
      eventData.gambar || null
    ];
    
    await executeQuery(query, params);
    return true;
  } catch (error) {
    console.error('Error creating event:', error);
    return false;
  }
};

// Organization Service
export const getOrganizationFromDB = async (): Promise<Organization[]> => {
  const query = 'SELECT * FROM organisasi ORDER BY urutan ASC';
  return await executeQuery<Organization>(query);
};

export const createOrganizationInDB = async (orgData: Partial<Organization>): Promise<boolean> => {
  try {
    const query = `
      INSERT INTO organisasi (nama, jabatan, foto, urutan)
      VALUES (?, ?, ?, ?)
    `;
    const params = [
      orgData.nama,
      orgData.jabatan,
      orgData.foto || null,
      orgData.urutan || 0
    ];
    
    await executeQuery(query, params);
    return true;
  } catch (error) {
    console.error('Error creating organization member:', error);
    return false;
  }
};

// Services
export const getServicesFromDB = async (): Promise<Service[]> => {
  const query = 'SELECT * FROM layanan ORDER BY id ASC';
  return await executeQuery<Service>(query);
};

export const createServiceInDB = async (serviceData: Partial<Service>): Promise<boolean> => {
  try {
    const query = `
      INSERT INTO layanan (nama, deskripsi, persyaratan, template_dokumen)
      VALUES (?, ?, ?, ?)
    `;
    const params = [
      serviceData.nama,
      serviceData.deskripsi || null,
      serviceData.persyaratan || null,
      serviceData.template_dokumen || null
    ];
    
    await executeQuery(query, params);
    return true;
  } catch (error) {
    console.error('Error creating service:', error);
    return false;
  }
};

// Service Submissions
export const createServiceSubmissionInDB = async (submissionData: Partial<ServiceSubmission>): Promise<ServiceSubmission | null> => {
  try {
    const nomorPengajuan = `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    
    const query = `
      INSERT INTO pengajuan_layanan (layanan_id, nomor_pengajuan, nama, nik, file_pendukung, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;
    const params = [
      submissionData.layanan_id,
      nomorPengajuan,
      submissionData.nama,
      submissionData.nik,
      submissionData.file_pendukung || null
    ];
    
    await executeQuery(query, params);
    
    // Return the created submission
    return await executeQuerySingle<ServiceSubmission>(
      'SELECT * FROM pengajuan_layanan WHERE nomor_pengajuan = ?',
      [nomorPengajuan]
    );
  } catch (error) {
    console.error('Error creating service submission:', error);
    return null;
  }
};

export const getServiceSubmissionsFromDB = async (): Promise<ServiceSubmission[]> => {
  const query = 'SELECT * FROM pengajuan_layanan ORDER BY created_at DESC';
  return await executeQuery<ServiceSubmission>(query);
};

// Auth Service
export const loginFromDB = async (email: string, password: string): Promise<Admin | null> => {
  // For demo purposes, using simple password check
  // In production, use proper password hashing
  const query = 'SELECT * FROM admins WHERE email = ? AND password = ?';
  return await executeQuerySingle<Admin>(query, [email, password]);
};

export const createAdminInDB = async (adminData: Partial<Admin>): Promise<boolean> => {
  try {
    const query = `
      INSERT INTO admins (nama, email, password)
      VALUES (?, ?, ?)
    `;
    const params = [
      adminData.nama,
      adminData.email,
      adminData.password // Should be hashed in production
    ];
    
    await executeQuery(query, params);
    return true;
  } catch (error) {
    console.error('Error creating admin:', error);
    return false;
  }
};

// Statistics Service
export const getStatisticsFromDB = async () => {
  try {
    const [newsCount, galleryCount, eventsCount, submissionsCount] = await Promise.all([
      executeQuerySingle<{ count: number }>('SELECT COUNT(*) as count FROM news'),
      executeQuerySingle<{ count: number }>('SELECT COUNT(*) as count FROM galleries'),
      executeQuerySingle<{ count: number }>('SELECT COUNT(*) as count FROM events'),
      executeQuerySingle<{ count: number }>('SELECT COUNT(*) as count FROM pengajuan_layanan')
    ]);

    return {
      news: newsCount?.count || 0,
      gallery: galleryCount?.count || 0,
      events: eventsCount?.count || 0,
      submissions: submissionsCount?.count || 0,
      documents: 0 // Add document count when table is available
    };
  } catch (error) {
    console.error('Error fetching statistics:', error);
    return {
      news: 0,
      gallery: 0,
      events: 0,
      submissions: 0,
      documents: 0
    };
  }
};