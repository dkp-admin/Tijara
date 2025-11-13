export default ({ config }) => {
  const appConfig = {
    ...config,
    extra: {
      eas: {
        projectId: "6107991e-125a-4b4f-8763-d8a18b585a73",
      },
      env: process.env.APP_ENV,
    },
  };

  return appConfig;
};
