import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis({ maxRetriesPerRequest: null });

const emailQueue = new Queue('emailQueue', { connection });

export { emailQueue, connection };
