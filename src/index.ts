import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { generalRateLimiter } from './middleware';
import { errorHandler, notFoundHandler } from './middleware/error';
import routes from './routes';
import logger from './config/logger';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(generalRateLimiter);

app.use(API_PREFIX, routes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Time-Off Microservice is running on port ${PORT}`);
  logger.info(`API available at http://localhost:${PORT}${API_PREFIX}`);
  logger.info(`Health check at http://localhost:${PORT}${API_PREFIX}/health`);
});

export default app;