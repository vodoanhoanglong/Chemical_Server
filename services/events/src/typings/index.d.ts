declare namespace NodeJS {
  export interface ProcessEnv {
    POSTGRES_HOST: string;
    POSTGRES_PORT: number;
    POSTGRES_PASSWORD: string;
    POSTGRES_DB: string;
    POSTGRES_USER: string;
  }
}
