import cron from 'node-cron';
import { blurPlatesAfterConfirm } from '../jobs/blurPlates';
import { dispatchNotifications } from '../jobs/dispatchNotifications';

const jobs = [] as cron.ScheduledTask[];
jobs.push(cron.schedule('* * * * *', () => {
    blurPlatesAfterConfirm();
}));

jobs.push(cron.schedule('* * * * *', () => {
    dispatchNotifications();
}));

for (const job of jobs) {
    job.start();
}
