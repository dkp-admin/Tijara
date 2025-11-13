import { Box, Skeleton, TableCell, TableRow } from "@mui/material";

export function ZatcaInvoicesRowLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
        return (
          <TableRow key={i}>
            <TableCell>
              <Skeleton variant="text" width={120} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={150} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={150} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={100} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={80} />
            </TableCell>
            <TableCell>
              <Box sx={{ alignItems: "center", display: "flex" }}>
                <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
              </Box>
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={120} />
            </TableCell>
            <TableCell align="right">
              <Skeleton variant="circular" width={32} height={32} />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
