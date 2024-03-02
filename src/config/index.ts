import dotenv from "dotenv";

dotenv.config();

const AppConfig = {
    app: {
      name: process.env.APP_NAME || "",
      server: process.env.SERVER,
      isDevelopment: ["development", "dev", "local"].includes(
        <string>process.env.SERVER
      ),
      port: parseInt(<string>process.env.PORT, 10) || 3000,
      secret: process.env.SECRET || "",
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
  };
  
  export default Object.freeze(AppConfig);
