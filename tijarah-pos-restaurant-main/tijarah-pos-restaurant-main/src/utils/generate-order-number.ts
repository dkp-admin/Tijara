import repository from "../db/repository";
import MMKVDB from "./DB-MMKV";
import { DBKeys } from "./DBKeys";

export default async function generateOrderNumber() {
  try {
    const device = await MMKVDB.get(DBKeys.DEVICE);
    const deviceCode = device?.phone;
    if (!deviceCode) {
      throw new Error("Device code is not available.");
    }
    //extract month and year from current date and convert to string like 0125
    const currentDate = new Date();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = String(currentDate.getFullYear()).slice(-2);
    // Generate a random string of the specified length
    let orderNumberSequence =
      await repository.orderNumberSequenceRepository.findByKey(
        `${deviceCode}${month}${year}`
      );
    console.log("FINAL SEQUENCE", orderNumberSequence);
    // Combine the device code, month, year, and random string to form the unique code
    const uniqueCode = `${deviceCode}${month}${year}${orderNumberSequence}`;
    console.log("TEST SEQ", uniqueCode);

    return uniqueCode;
  } catch (error) {
    console.log("Sequence error", error);
  }
}
