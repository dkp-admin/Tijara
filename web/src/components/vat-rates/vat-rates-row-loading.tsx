import { Box, Skeleton, TableCell, TableRow } from "@mui/material";

export function VATRatesRowLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
        return (
          <TableRow key={i}>
            <TableCell>
              <Skeleton variant="text" width={180} />
            </TableCell>
            <TableCell>
              <Box sx={{ alignItems: "center", display: "flex" }}>
                <Skeleton variant="rectangular" width={40} />
                <Skeleton sx={{ ml: 1 }} variant="text" width={150} />
              </Box>
            </TableCell>
            <TableCell align="right">
              <Skeleton sx={{ ml: 10 }} variant="text" width={40} />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
