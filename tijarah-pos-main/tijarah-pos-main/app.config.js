export default ({ config }) => {
  const appConfig = {
    ...config,
    extra: {
      eas: {
        projectId: "4a9a53fc-afde-4206-a608-7de1c651fead",
      },
      env: process.env.APP_ENV,
    },
  };

  return appConfig;
};
