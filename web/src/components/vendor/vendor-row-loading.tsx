import { Box, Skeleton, TableCell, TableRow } from "@mui/material";

export function VendorRowLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
        return (
          <TableRow key={i}>
            <TableCell>
              <Box sx={{ alignItems: "center", display: "flex" }}>
                <Skeleton variant="circular" width={80} height={80} />
                <Box sx={{ ml: 2, textAlign: "start" }}>
                  <Skeleton variant="text" width={150} />
                  <Skeleton variant="text" width={150} />
                </Box>
              </Box>
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={100} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={100} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={100} />
            </TableCell>
            <TableCell>
              <Box sx={{ alignItems: "center", display: "flex" }}>
                <Skeleton variant="rectangular" width={40} />
                <Skeleton sx={{ ml: 1 }} variant="text" width={120} />
              </Box>
            </TableCell>
            <TableCell align="right">
              <Skeleton variant="text" width={20} />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
