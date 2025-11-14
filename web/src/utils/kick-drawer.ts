export const openKickDrawer = async () => {
  try {
    const nav: any = navigator;

    // Check if there's an existing device
    const existingDevices = await nav.usb.getDevices();

    if (existingDevices?.length > 0) {
      // Use the first device in the list (you may want to implement a more sophisticated logic)
      const device = existingDevices[0];

      // Open the device
      await device.open();

      // Select the configuration (assuming configuration 1 is correct)
      await device.selectConfiguration(1);

      // Claim the interface (assuming interface 0 is correct)
      await device.claimInterface(0);

      // Continue with your existing logic (skip requesting a new device)
      const alternate = device.configuration.interfaces[0].alternate;

      const outEndpoint = alternate.endpoints.find(
        (endpoint: any) => endpoint.direction === "out"
      );

      const cashDrawerCommand = new Uint8Array([0x1b, 0x70, 0x00, 0x1e, 0xff]); // Replace with the correct command

      // Transfer data using the correct endpoint
      await device.transferOut(outEndpoint.endpointNumber, cashDrawerCommand);

      // Close the device (if needed)
      await device.close();
    } else {
      // No existing device, request a new one
      const device = await nav.usb.requestDevice({
        filters: [],
      });

      // Open the device
      await device.open();

      // Select the configuration (assuming configuration 1 is correct)
      await device.selectConfiguration(1);

      // Claim the interface (assuming interface 0 is correct)
      await device.claimInterface(0);

      // Get the alternate setting for the interface
      const alternate = device.configuration.interfaces[0].alternate;

      // Find the OUT endpoint (assuming endpoint 2 is correct)
      const outEndpoint = alternate.endpoints.find(
        (endpoint: any) => endpoint.direction === "out"
      );

      const cashDrawerCommand = new Uint8Array([0x1b, 0x70, 0x00, 0x1e, 0xff]); // Replace with the correct command

      // Transfer data using the correct endpoint
      await device.transferOut(outEndpoint.endpointNumber, cashDrawerCommand);

      // Close the device
      await device.close();
    }
  } catch (e) {
    console.error(e);
  }
};
