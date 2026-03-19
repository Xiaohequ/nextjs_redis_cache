import { Worker } from 'bullmq';
import connection from '@/app/lib/redis_mq';

const worker = new Worker(
  'emails', // doit correspondre au nom de la Queue
  async (job) => {
    const { to, subject, body } = job.data;

    console.log(`📧 Envoi email à ${to} — sujet: ${subject}`);
    // await sendEmail(to, subject, body); ← ta logique ici

    return { sent: true };
  },
  {
    connection : connection,
    concurrency: 5,
  }
);

worker.on('completed', (job) => console.log(`✅ Job ${job.id} terminé`));
worker.on('failed', (job, err) => console.error(`❌ Job ${job?.id} échoué:`, err));

console.log('🚀 Worker démarré, en attente de jobs...');