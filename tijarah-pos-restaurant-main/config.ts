const hosts = {
  production: "https://be.tijarah360.com",
  qa: "https://qa-k8s.tisostudio.com",
};

const logTopics = {
  production: "production",
  qa: "qa",
};

const env = process.env.EXPO_PUBLIC_APP_ENV as keyof typeof hosts;

export const AxiomConfig = {
  token: "xaat-abcfa366-04ba-47f0-b603-7c9f8b3738a3",
  dataset: logTopics[env] || logTopics.qa,
};

export const HOST = hosts[env] || hosts.qa;

console.log("API HOST", HOST);

export const LOG_TOPIC = logTopics[env] || logTopics.production;
