import developmentConfig from './development';
import productionConfig from './production';

const env = process.env.NODE_ENV || 'local';

let config = developmentConfig;

if (env === 'development') {
  config = developmentConfig;
} else if (env === 'qa') {
  config = developmentConfig;
} else if (env === 'production') {
  config = productionConfig;
}
console.log('env', env);

export default config;
