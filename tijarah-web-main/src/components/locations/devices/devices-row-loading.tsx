import { Box, Skeleton, TableCell, TableRow } from "@mui/material";

export function DevicesRowLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
        return (
          <TableRow key={i}>
            <TableCell>
              <Skeleton variant="text" width={120} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={120} />
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
              <Box>
                <Skeleton variant="text" width={90} />
                <Skeleton variant="text" width={90} />
              </Box>
            </TableCell>
            <TableCell>
              <Box>
                <Skeleton variant="text" width={90} />
                <Skeleton variant="text" width={90} />
              </Box>
            </TableCell>
            <TableCell>
              <Box sx={{ alignItems: "center", display: "flex" }}>
                <Skeleton variant="rectangular" width={25} />
                <Skeleton sx={{ ml: 1 }} variant="text" width={60} />
              </Box>
            </TableCell>
            <TableCell align="right">
              <Skeleton sx={{ marginLeft: 2 }} variant="text" width={20} />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
