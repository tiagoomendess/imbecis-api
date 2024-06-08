import cron from 'node-cron';
import { blurPlatesAfterConfirm } from '../jobs/blurPlates';
import { dispatchNotifications } from '../jobs/dispatchNotifications';
import { fillGeoLocationData } from '../jobs/fillGeoLocationData';

const jobs = [] as cron.ScheduledTask[];
jobs.push(cron.schedule('* * * * *', () => {
    blurPlatesAfterConfirm();
}));

jobs.push(cron.schedule('* * * * *', () => {
    dispatchNotifications();
}));

jobs.push(cron.schedule('* * * * *', () => {
    fillGeoLocationData();
}));

for (const job of jobs) {
    job.start();
}
