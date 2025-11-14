import Constants from "expo-constants";

const hosts = {
  development: "https://qa-k8s.tisostudio.com",
  staging: "https://tjapi.dev.tisostudio.com",
  production: "https://be.tijarah360.com",
  qa: "https://qa-k8s.tisostudio.com",
  test: "https://test-k8s.tisostudio.com",
};

const env = Constants.expoConfig?.extra?.env;

//@ts-ignore
export const HOST = hosts[env] || hosts.development;
