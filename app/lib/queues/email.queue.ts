import { Queue } from 'bullmq';
import connection from '@/app/lib/redis_mq';

export const emailQueue = new Queue('emails', {
  connection: connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 3000 },
    removeOnComplete: { count: 1000 },
    removeOnFail: { count: 5000 },
  },
});