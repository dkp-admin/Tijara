import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { format } from "date-fns";
import { t } from "i18next";
import Barcode from "react-barcode";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useCurrency } from "src/utils/useCurrency";

interface PrintableItemTwoProps {
  item: any;
  key: any;
  user: any;
  selectedOptions: string[];
}

export const PrintableItemTwo: React.FC<PrintableItemTwoProps> = ({
  item,
  key,
  user,
  selectedOptions,
}) => {
  const currency = useCurrency();
  return (
    <>
      {Array.from({ length: item.quantity }, (_, index) => (
        <Box
          key={index}
          style={{
            border: "1px solid #000",
            backgroundColor: "#fff",
            padding: "10px",
            textAlign: "left",
            fontSize: "16px",
          }}
        >
          {selectedOptions.includes("companyName") && (
            <Box
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              <Typography>{user.en}</Typography>
              <Typography></Typography>
            </Box>
          )}
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
            }}
          >
            {selectedOptions.includes("barCode") && (
              <Box style={{ width: "100%", height: "auto" }}>
                <Barcode displayValue={false} value={item.sku} width={2} />
              </Box>
            )}
          </Box>
          <Box
            style={{
              marginTop: "-20px",
              textAlign: "center",
              letterSpacing: "4px",
              position: "relative",
              fontSize: "25px",
            }}
          >
            {" "}
            {item.sku}
          </Box>
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gridColumnGap: "5px",
              fontWeight: "bold",
              marginTop: "10px",
            }}
          >
            {selectedOptions.includes("productName") && (
              <Box style={{ marginBottom: "5px" }}>
                <Typography style={{ display: "block", fontWeight: "normal" }}>
                  {item.name.en}
                </Typography>
              </Box>
            )}
            {selectedOptions.includes("price") && (
              <Box style={{ marginBottom: "5px" }}>
                <Typography style={{ display: "block", fontWeight: "normal" }}>
                  {`${currency}: `}
                </Typography>
                <Typography style={{ display: "block" }}>
                  {toFixedNumber(item.price)}
                </Typography>
              </Box>
            )}
            {item.expiry && (
              <Box style={{ marginBottom: "5px" }}>
                <Typography style={{ display: "block", fontWeight: "normal" }}>
                  {t("Expiry Date")}
                </Typography>
                <Typography style={{ display: "block" }}>
                  {format(new Date(item.expiry), "dd/MM/yyyy")}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      ))}
    </>
  );
};
