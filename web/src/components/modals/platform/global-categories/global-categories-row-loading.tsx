import { Box, Skeleton, TableCell, TableRow } from "@mui/material";

export function GlobalCategoriesRowLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
        return (
          <TableRow key={i}>
            <TableCell>
              <Box sx={{ alignItems: "center", display: "flex" }}>
                <Skeleton variant="circular" width={42} height={42} />
                <Box sx={{ ml: 1, textAlign: "start" }}>
                  <Skeleton variant="text" width={220} />
                </Box>
              </Box>
            </TableCell>
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
              <Skeleton sx={{ ml: 12 }} variant="text" width={30} />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
