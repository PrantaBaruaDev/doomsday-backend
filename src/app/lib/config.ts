import dotenv from 'dotenv';
dotenv.config();

export class Config {
  private static instance: Config | null = null;

  public readonly port: number;
  public readonly nodeEnv: string;
  public readonly logLevel: string;
  public readonly databaseUrl: string;

  private constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is required');
    this.databaseUrl = url;
    this.port = Number(process.env.PORT ?? 4000);
    this.nodeEnv = process.env.NODE_ENV ?? 'development';
    this.logLevel = process.env.LOG_LEVEL ?? 'info';
  }

  static getInstance(): Config {
    if (!Config.instance) Config.instance = new Config();
    return Config.instance;
  }
}

export const config = Config.getInstance();