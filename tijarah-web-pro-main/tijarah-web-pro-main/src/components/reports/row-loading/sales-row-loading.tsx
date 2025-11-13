import { Skeleton, TableCell, TableRow } from "@mui/material";
import { Box } from "@mui/system";

export function SalesReportRowLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
        return (
          <TableRow key={i}>
            <TableCell
              sx={{
                alignItems: "center",
                display: "flex",
              }}
            >
              <Box sx={{ ml: 2 }}>
                <Skeleton variant="text" width={200} />

                <Skeleton variant="text" width={200} />
              </Box>
            </TableCell>
            <TableCell>
              <Skeleton sx={{ ml: 10 }} variant="text" width={200} />
            </TableCell>
            <TableCell
              sx={{
                alignItems: "right",
              }}
            >
              <Box sx={{ ml: 10 }}>
                <Skeleton variant="text" width={200} />

                <Skeleton variant="text" width={200} />
              </Box>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
