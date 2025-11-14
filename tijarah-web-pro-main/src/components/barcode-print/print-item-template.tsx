import { Box } from "@mui/system";
import { format } from "date-fns";
import Barcode from "react-barcode";
import { toFixedNumber } from "src/utils/toFixedNumber";

interface PrintableItemProps {
  item: any;
  key: any;
  user: any;
  selectedOptions: string[];
}

export const PrintableItem: React.FC<PrintableItemProps> = ({
  item,
  key,
  user,
  selectedOptions,
}) => {
  return (
    <>
      {Array.from({ length: item.quantity }, (_, index) => (
        <Box
          key={index}
          style={{
            border: "1px solid #000",
            backgroundColor: "#fff",
            padding: "20px",
            textAlign: "center",
            fontSize: "16px",
          }}
        >
          {selectedOptions.includes("companyName") && (
            <Box style={{ fontSize: "20px", marginBottom: "5px" }}>
              {user.en}
            </Box>
          )}
          {selectedOptions.includes("price") && (
            <Box style={{ fontSize: "18px", marginBottom: "5px" }}>
              {toFixedNumber(item.price)}
            </Box>
          )}

          {selectedOptions.includes("productName") && (
            <Box
              style={{
                marginBottom: "5px",
                fontWeight: "bold",
              }}
            >
              {item.name.en}
            </Box>
          )}
          {selectedOptions.includes("barCode") && (
            <Box>
              <Barcode displayValue={false} value={item.sku} width={2} />
            </Box>
          )}
          <Box
            style={{
              marginTop: "-20px",
              letterSpacing: "4px",
              fontSize: "24px",
              position: "relative",
            }}
          >
            {item.sku}
          </Box>
          {item.expiry && (
            <Box
              style={{
                marginBottom: "5px",
                fontWeight: "bold",
                marginTop: "5px",
              }}
            >
              {format(new Date(item.expiry), "dd/MM/yyyy")}
            </Box>
          )}
        </Box>
      ))}
    </>
  );
};
