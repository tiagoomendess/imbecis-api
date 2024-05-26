import snoowrap from 'snoowrap';
import config from '../config';
import Logger from '../utils/logger';

const r = new snoowrap({
    userAgent: 'imbecis.app:v1 (by /u/ImbecisBot)',
    clientId: config.reddit.clientId,
    clientSecret: config.reddit.clientSecret,
    username: config.reddit.username,
    password: config.reddit.password
});

export const postUrl = async (title: string, url: string, subreddit: string): Promise<void> => {
    return await r.submitLink({
        subredditName: subreddit,
        title: title,
        url: url
    }).then(() => {
        Logger.info(`Posted to ${subreddit} subreddit with: ${title} | ${url}`);
        return
    }).catch((error) => {
        Logger.error(`Error posting to reddit: ${error}`);
        throw error;
    });
}
