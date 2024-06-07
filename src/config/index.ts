import dotenv from "dotenv";
import { url } from "inspector";
import { features } from "process";

dotenv.config();

const AppConfig = {
    app: {
      name: process.env.APP_NAME || "",
      url: process.env.APP_URL || "https://imbecis.app",
      server: process.env.SERVER,
      isDevelopment: ["development", "dev", "local"].includes(
        <string>process.env.SERVER
      ),
      port: parseInt(<string>process.env.PORT, 10) || 3000,
      secret: process.env.SECRET || "",
      reportsEmail: process.env.REPORTS_EMAIL || "denuncias@imbecis.app",
      reportsEmailName: process.env.REPORTS_EMAIL_NAME || "Denúncias de Estacionamento",
    },
    db: {
      mongoUri: <string>process.env.MONGO_URI || "",
      mongoDb: <string>process.env.MONGO_DB || "",
    },
    storage: {
      s3: {
        accountId: <string>process.env.S3_ACCOUNT_ID || "",
        accessKeyId: <string>process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: <string>process.env.S3_SECRET,
        bucket: <string>process.env.S3_BUCKET || "",
        endpoint: <string>process.env.S3_ENDPOINT || "",
        region: <string>process.env.S3_REGION || "",
      }
    },
    reddit: {
      clientId: <string>process.env.REDDIT_CLIENT_ID || "",
      clientSecret: <string>process.env.REDDIT_CLIENT_SECRET || "",
      username: <string>process.env.REDDIT_USERNAME || "",
      password: <string>process.env.REDDIT_PASSWORD || "",
    },
    mailjet: {
      apiKeyPublic: <string>process.env.MJ_APIKEY_PUBLIC || "",
      apiKeyPrivate: <string>process.env.MJ_APIKEY_PRIVATE || "",
      apiToken: <string>process.env.MJ_API_TOKEN || "",
    },
    features: {
      email_notification: process.env.FEATURE_EMAIL_NOTIFICATION === "true",
      reddit_notification: process.env.FEATURE_REDDIT_NOTIFICATION === "true",
    }
  };
  
  export default Object.freeze(AppConfig);
