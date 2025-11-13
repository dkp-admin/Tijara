import DeviceLogin from "./auth/login.js";
import orderPush from "./order/push.js";

export const options = {
  stages: [
    { duration: "30s", target: 100 },
    { duration: "10m", target: 400 },
    { duration: "10m", target: 250 },
    { duration: "10m", target: 350 },
    { duration: "10m", target: 150 },
    { duration: "10m", target: 75 },
    { duration: "10m", target: 0 },
  ],
};

const DEVICES = [
  { deviceCode: "TXQ433AQ", devicePassword: "X53C2T" },
  { deviceCode: "JMV3EHT3", devicePassword: "CAY8GN" },
  { deviceCode: "VBZYKTBR", devicePassword: "DGW78X" },
  { deviceCode: "KGYTWZV2", devicePassword: "UCWYT9" },
  { deviceCode: "J49FHMJX", devicePassword: "BYB5RC" },
  { deviceCode: "2T3HKZS4", devicePassword: "D7P6DS" },
  { deviceCode: "R29TEXF5", devicePassword: "U33XZ3" },
  { deviceCode: "GGXEPJHP", devicePassword: "4YGRT5" },
  { deviceCode: "GEWU7GD3", devicePassword: "AEU37X" },
  { deviceCode: "TKV4A8S4", devicePassword: "W5H84Y" },
];

export async function setup() {
  const loginResponses = await Promise.all(
    DEVICES.map((device) =>
      DeviceLogin({
        deviceCode: device.deviceCode,
        devicePassword: device.devicePassword,
      })
    )
  );

  const deviceData = await Promise.all(loginResponses.map((rsp) => rsp.json()));

  return deviceData;
}

export default async function (data) {
  const deviceIndex = (__VU - 1) % DEVICES.length;

  const { deviceCode, devicePassword } = DEVICES[deviceIndex];
  const { user, token } = data[deviceIndex];

  await orderPush({
    token: token,
    companyRef: user.companyRef,
    locationRef: user.locationRef,
    location: user.location,
    deviceCode: deviceCode,
    deviceRef: user.deviceRef,
  });
}
