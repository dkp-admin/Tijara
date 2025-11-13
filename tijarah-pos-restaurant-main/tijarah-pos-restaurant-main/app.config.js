export default ({ config }) => {
  const appConfig = {
    ...config,
    extra: {
      eas: {
        projectId: "0f2671c5-35cf-4102-97c3-4fcecad8e7c9",
      },
      env: process.env.APP_ENV,
    },
  };

  return appConfig;
};
