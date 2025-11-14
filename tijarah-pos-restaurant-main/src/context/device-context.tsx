import React from "react";

type DeviceContextType = {
  user: object;
  login: () => void;
};

const DeviceContext = React.createContext({});

export default DeviceContext;
