const { sequelize } = require('./config/database');
const { JobQueue } = require('./models/JobQueue');
const assignmentService = require('./services/assignment.service');
const slaService = require('./services/sla.service');
const notificationService = require('./services/notification.service');

async function processJob(job) {
  try {
    console.log(`👷 [Worker] Processing job ${job.id} (${job.job_type})`);
    // Example: parse payload
    const payload = typeof job.payload === 'string' ? JSON.parse(job.payload) : job.payload;
    
    switch (job.job_type) {
      case 'assign_ticket':
        await assignmentService.autoAssignTechnician(payload.ticketId);
        break;
      case 'sla_escalate':
        await slaService.handleEscalation(payload.ticketId);
        break;
      case 'send_notification':
        await notificationService.createNotification(payload.userId, payload.title, payload.message, payload.type);
        break;
      default:
        console.warn(`👷 [Worker] Unknown job type: ${job.job_type}`);
    }

    // Mark as done
    job.status = 'done';
    await job.save();
    console.log(`👷 [Worker] Job ${job.id} done.`);
  } catch (err) {
    console.error(`👷 [Worker] Error processing job ${job.id}:`, err);
    job.attempts += 1;
    if (job.attempts >= job.max_attempts) {
      job.status = 'failed';
    } else {
      job.status = 'pending';
      // simple backoff: wait 1 minute before retry
      job.run_at = new Date(Date.now() + 60000); 
    }
    await job.save();
  }
}

async function pollQueue() {
  try {
    // Read pending jobs scheduled to run now or in the past
    // Using simple query logic since SELECT FOR UPDATE SKIP LOCKED is highly specific 
    // and sometimes fails on non-transactional simple calls or unsupported DBs. 
    // We wrap it in a transaction for MySQL 8 support:
    await sequelize.transaction(async (t) => {
      const jobs = await JobQueue.findAll({
        where: {
          status: 'pending',
          run_at: { [sequelize.Sequelize.Op.lte]: new Date() }
        },
        order: [['run_at', 'ASC']],
        limit: 5,
        lock: t.LOCK.UPDATE,
        skipLocked: true,
        transaction: t
      });

      if (jobs.length > 0) {
        // Mark them as processing in the same transaction
        for (let job of jobs) {
           job.status = 'processing';
           await job.save({ transaction: t });
        }
        
        t.afterCommit(async () => {
          for (let job of jobs) {
            await processJob(job);
          }
        });
      }
    });
  } catch (err) {
    console.error(`👷 [Worker] Polling error:`, err.message);
  } finally {
    // Schedule next poll
    setTimeout(pollQueue, 10000); // 10 seconds
  }
}

function startWorker() {
  console.log('👷 Background worker started polling...');
  pollQueue();
}

module.exports = { startWorker };
