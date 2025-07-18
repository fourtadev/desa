import mysql from 'mysql2/promise';

// Database configuration interface
interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port: number;
  connectionLimit: number;
  acquireTimeout: number;
  timeout: number;
  reconnect: boolean;
}

// Get database configuration from environment variables
const getDatabaseConfig = (): DatabaseConfig => {
  return {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'desa_digital',
    port: parseInt(process.env.DB_PORT || '3306'),
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
  };
};

// Create connection pool
let pool: mysql.Pool | null = null;

export const createPool = (): mysql.Pool => {
  if (!pool) {
    const config = getDatabaseConfig();
    pool = mysql.createPool(config);
    
    console.log('MySQL connection pool created successfully');
  }
  return pool;
};

// Get database connection
export const getConnection = async (): Promise<mysql.PoolConnection> => {
  try {
    const connectionPool = createPool();
    const connection = await connectionPool.getConnection();
    return connection;
  } catch (error) {
    console.error('Error getting database connection:', error);
    throw new Error('Failed to connect to database');
  }
};

// Execute query with connection handling
export const executeQuery = async <T = any>(
  query: string, 
  params: any[] = []
): Promise<T[]> => {
  let connection: mysql.PoolConnection | null = null;
  
  try {
    connection = await getConnection();
    const [rows] = await connection.execute(query, params);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Execute single query and return first result
export const executeQuerySingle = async <T = any>(
  query: string, 
  params: any[] = []
): Promise<T | null> => {
  const results = await executeQuery<T>(query, params);
  return results.length > 0 ? results[0] : null;
};

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const connection = await getConnection();
    await connection.ping();
    connection.release();
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

// Close all connections
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database connection pool closed');
  }
};

// Database initialization
export const initializeDatabase = async (): Promise<void> => {
  try {
    // Test connection
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('Failed to connect to database');
    }

    // Check if tables exist, create if not
    await createTablesIfNotExist();
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
};

// Create tables if they don't exist
const createTablesIfNotExist = async (): Promise<void> => {
  const tables = [
    {
      name: 'desa_settings',
      query: `
        CREATE TABLE IF NOT EXISTS desa_settings (
          id INT PRIMARY KEY AUTO_INCREMENT,
          nama_desa VARCHAR(255) NOT NULL,
          slogan TEXT,
          alamat TEXT,
          logo VARCHAR(255),
          hero_image VARCHAR(255),
          primary_color VARCHAR(7) DEFAULT '#3B82F6',
          secondary_color VARCHAR(7) DEFAULT '#10B981',
          deskripsi TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `
    },
    {
      name: 'news',
      query: `
        CREATE TABLE IF NOT EXISTS news (
          id INT PRIMARY KEY AUTO_INCREMENT,
          judul VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE NOT NULL,
          konten LONGTEXT NOT NULL,
          gambar VARCHAR(255),
          tanggal DATE NOT NULL,
          penulis VARCHAR(255) NOT NULL,
          status ENUM('published', 'draft') DEFAULT 'draft',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_status (status),
          INDEX idx_tanggal (tanggal)
        )
      `
    },
    {
      name: 'galleries',
      query: `
        CREATE TABLE IF NOT EXISTS galleries (
          id INT PRIMARY KEY AUTO_INCREMENT,
          judul VARCHAR(255) NOT NULL,
          deskripsi TEXT,
          gambar VARCHAR(255) NOT NULL,
          kategori VARCHAR(100),
          tanggal DATE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_kategori (kategori)
        )
      `
    },
    {
      name: 'events',
      query: `
        CREATE TABLE IF NOT EXISTS events (
          id INT PRIMARY KEY AUTO_INCREMENT,
          judul VARCHAR(255) NOT NULL,
          deskripsi TEXT,
          tanggal DATETIME NOT NULL,
          lokasi VARCHAR(255),
          gambar VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_tanggal (tanggal)
        )
      `
    },
    {
      name: 'organisasi',
      query: `
        CREATE TABLE IF NOT EXISTS organisasi (
          id INT PRIMARY KEY AUTO_INCREMENT,
          nama VARCHAR(255) NOT NULL,
          jabatan VARCHAR(255) NOT NULL,
          foto VARCHAR(255),
          urutan INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_urutan (urutan)
        )
      `
    },
    {
      name: 'layanan',
      query: `
        CREATE TABLE IF NOT EXISTS layanan (
          id INT PRIMARY KEY AUTO_INCREMENT,
          nama VARCHAR(255) NOT NULL,
          deskripsi TEXT,
          persyaratan TEXT,
          template_dokumen VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `
    },
    {
      name: 'pengajuan_layanan',
      query: `
        CREATE TABLE IF NOT EXISTS pengajuan_layanan (
          id INT PRIMARY KEY AUTO_INCREMENT,
          layanan_id INT NOT NULL,
          nomor_pengajuan VARCHAR(50) UNIQUE NOT NULL,
          nama VARCHAR(255) NOT NULL,
          nik VARCHAR(16) NOT NULL,
          file_pendukung VARCHAR(255),
          status ENUM('pending', 'diproses', 'selesai', 'ditolak') DEFAULT 'pending',
          catatan TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (layanan_id) REFERENCES layanan(id) ON DELETE CASCADE,
          INDEX idx_status (status),
          INDEX idx_nomor (nomor_pengajuan)
        )
      `
    },
    {
      name: 'admins',
      query: `
        CREATE TABLE IF NOT EXISTS admins (
          id INT PRIMARY KEY AUTO_INCREMENT,
          nama VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `
    }
  ];

  for (const table of tables) {
    try {
      await executeQuery(table.query);
      console.log(`Table ${table.name} created or already exists`);
    } catch (error) {
      console.error(`Error creating table ${table.name}:`, error);
      throw error;
    }
  }
};

export default {
  createPool,
  getConnection,
  executeQuery,
  executeQuerySingle,
  testConnection,
  closePool,
  initializeDatabase
};