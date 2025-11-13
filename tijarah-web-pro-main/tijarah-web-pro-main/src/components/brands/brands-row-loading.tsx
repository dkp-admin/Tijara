import { Box, Skeleton, TableCell, TableRow } from "@mui/material";

export function BrandsRowLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
        return (
          <TableRow key={i}>
            <TableCell>
              <Box sx={{ alignItems: "center", display: "flex" }}>
                <Skeleton variant="circular" width={42} height={42} />
                <Box sx={{ ml: 1, textAlign: "start" }}>
                  <Skeleton variant="text" width={200} />
                </Box>
              </Box>
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
