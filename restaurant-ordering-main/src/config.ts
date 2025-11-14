type Env = 'development' | 'qa' | 'production';

type AppConfig = {
  HOST: string;
  GOOGLE_API_KEY: string;
};

const CONFIGS: Record<Env, AppConfig> = {
  development: {
    HOST: 'https://qa-k8s.tisostudio.com',
    GOOGLE_API_KEY: 'AIzaSyAOfoQHduiicOroXyJ5udHiUNEUG-hfx1M',
  },
  qa: {
    HOST: 'https://qa-k8s.tisostudio.com',
    GOOGLE_API_KEY: 'AIzaSyAOfoQHduiicOroXyJ5udHiUNEUG-hfx1M',
  },
  production: {
    HOST: 'https://qa-k8s.tisostudio.com',
    GOOGLE_API_KEY: 'AIzaSyAOfoQHduiicOroXyJ5udHiUNEUG-hfx1M',
  },
};

const ENV = process.env.NEXT_PUBLIC_APP_ENV || 'development';

export const config: AppConfig = CONFIGS[ENV as Env];
