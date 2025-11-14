/**
 * Formats printer text with proper spacing
 * @param text The text to format
 * @param is2Inch Whether the printer is 2-inch (true) or 3-inch (false)
 * @returns Formatted string with appropriate spacing
 */
export const formatPrinterText = (text: string, is2Inch: boolean): string => {
  const length = !is2Inch
    ? "Total Taxable Amount                                   SAR14.00".length
    : "Total Taxable Amount      SAR14.00".length;

  // Split the text into label and value if it contains a price
  const matches = text.split(":");
  if (!matches) {
    return text; // Return as is if no price pattern found
  }

  const label = matches[0].trim();
  const value = matches[1];

  const labelLength = label?.length;
  const valueLength = value?.length;
  let spaces = length - labelLength - valueLength;
  if (labelLength < "Total Taxable Amount".length) {
    spaces += "Total Taxable Amoun".length - labelLength;
  }

  // Create the formatted string with the fixed spacing
  return `${label}${" ".repeat(spaces)}${value}`;
};

/**
 * Comprehensive function to generate formatted printer content
 * @param label English label text
 * @param arLabel Arabic label text (optional)
 * @param value Value text (e.g. "SAR14.00")
 * @param is2Inch Whether the printer is 2-inch (true) or 3-inch (false)
 * @returns Formatted printer content string
 */
export const formatPrinterLine = async (
  isBt: boolean,
  label: string,
  arLabel: string | null,
  value: string,
  currency: string,
  is2Inch: boolean,
  printerConfig: any
): Promise<string> => {
  // Make sure value has the SAR prefix if it's just a number
  const formattedValue = `${currency}${value}`;

  // Create the English label with proper spacing
  const formattedText = formatPrinterText(
    `${label}:${formattedValue}`,
    is2Inch
  );

  // Create the complete printer content
  let printContent = "";

  try {
    // Add the formatted English text with proper alignment
    const convertedAmount = await ExpoPrintHelp.convertAmount(
      isBt,
      formattedText,
      printerConfig?.printerWidthMM,
      is2Inch ? "160" : "199",
      printerConfig?.charsPerLine,
      "R",
      isBt ? "34" : "30"
    );
    printContent += `${convertedAmount}\n`;

    // Add the Arabic label if provided
    if (arLabel && isBt) {
      printContent += `[L]<img>${ExpoPrintHelp.imageToHexBt(
        arLabel,
        "left",
        "20"
      )}</img>\n`;
    } else if (arLabel && !isBt) {
      printContent += `[L]<img>${ExpoPrintHelp.imageToHex(
        arLabel,
        "left",
        "20"
      )}</img>\n`;
    }

    return printContent;
  } catch (error) {
    console.log("Error formatting printer line:", error);
    return "";
  }
};

// Import ExpoPrintHelp at the top of the file
import * as ExpoPrintHelp from "expo-print-help";
