import { Box, Skeleton, TableCell, TableRow } from "@mui/material";

export function CustomerAddressesRowLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => {
        return (
          <TableRow key={i}>
            <TableCell>
              <Skeleton variant="text" width={120} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={250} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={80} />
            </TableCell>
            <TableCell>
              <TableCell align="right">
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Skeleton sx={{ mr: 2 }} variant="rectangular" width={40} />
                  <Skeleton variant="rectangular" width={40} />
                </Box>
              </TableCell>
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
