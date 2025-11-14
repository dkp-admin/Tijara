import repository from "../db/repository";
import { CustomCharge } from "../db/schema/custom.charge";

export async function fetchCustomCharges(
  pageParam: number = 1,
  rowsPerPage: number = 100,
  status: string = "active"
): Promise<[CustomCharge[], number]> {
  try {
    return await repository.customChargeRepository.findAndCount({
      take: rowsPerPage,
      skip: rowsPerPage * (pageParam - 1),
      where: { status },
    });
  } catch (error) {
    console.error("Error fetching custom charges:", error);
    return [[], 0];
  }
}
