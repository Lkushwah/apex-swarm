import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

function localAnalyticsLogger() {
  return {
    name: 'local-analytics-logger',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/logs' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const logsDir = path.resolve(__dirname, 'logs');
              if (!fs.existsSync(logsDir)) {
                fs.mkdirSync(logsDir);
              }
              const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
              fs.writeFileSync(path.join(logsDir, `run_log_${timestamp}.json`), body);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              console.error('Failed to save log locally:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: 'Failed to save log' }));
            }
          });
        } else {
          next();
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    localAnalyticsLogger(),
  ],
});
