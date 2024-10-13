
export interface MonitorConfig {
    // General settings
    enabled: boolean;
    serviceName: string;
  
    // Logging settings
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    logFormat: 'json' | 'text';
  
    // Storage settings
    storageType: 'memory' | 'mssql';
    mssqlConfig?: {
      server: string;
      database: string;
      user: string;
      password: string;
      options: {
        encrypt: boolean;
        trustServerCertificate: boolean;
      };
    };
  
    // Sampling and filtering
    sampleRate: number; // Between 0 and 1
    ignorePaths: string[]; // Paths to ignore, e.g. ['/health', '/metrics']
  
    // Performance thresholds
    slowRequestThreshold: number; // In milliseconds
  
    // Dashboard settings
    dashboardEnabled: boolean;
    dashboardPort: number;
  
    // Alert settings
    alertsEnabled: boolean;
    alertWebhook?: string;
  }
  
  export interface ConfigProvider {
    getConfig(): MonitorConfig;
  }
