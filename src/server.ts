import app from './app';
import config from './config';
import Logger from './utils/logger';

const PORT = config.app.port;

app.listen(PORT, () => {
  Logger.info(`Server is running on port ${PORT}`);
});
