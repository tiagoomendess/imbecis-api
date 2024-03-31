import cron from 'node-cron';
import { blurPlatesAfterConfirm } from '../jobs/blurPlates';

const jobs = [] as cron.ScheduledTask[];
jobs.push(cron.schedule('* * * * *', () => {
    blurPlatesAfterConfirm();
}));

for (const job of jobs) {
    job.start();
}
