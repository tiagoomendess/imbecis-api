import cron from 'node-cron';
import { blurPlatesAfterConfirm } from '../jobs/blurPlates';
import { dispatchNotifications } from '../jobs/dispatchNotifications';
import { fillGeoLocationData } from '../jobs/fillGeoLocationData';
import { generateReportPdfs } from '../jobs/generateReportPdf';

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

jobs.push(cron.schedule('* * * * *', () => {
    generateReportPdfs();
}));

for (const job of jobs) {
    job.start();
}
