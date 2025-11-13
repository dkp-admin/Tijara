export const buildPermission = (permissions: string[]) => {
  return permissions.reduce((ac: any, cv: any) => {
    const tokens = cv?.split(":");
    const action = tokens?.pop();
    const key = tokens?.join(":");

    if (!ac[key]) {
      ac[key] = {};
    }
    ac[key][action] = true;
    return ac;
  }, {});
};
