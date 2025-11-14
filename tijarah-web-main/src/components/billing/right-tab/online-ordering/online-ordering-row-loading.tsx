import { Box, Skeleton, TableCell, TableRow } from "@mui/material";

export function OnlineOrderingRowLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
        return (
          <TableRow key={i}>
            <TableCell>
              <Box>
                <Skeleton variant="text" width={80} />
                <Skeleton variant="text" width={80} />
              </Box>
            </TableCell>
            <TableCell>
              <Box>
                <Skeleton variant="text" width={120} />
                <Skeleton variant="text" width={100} />
              </Box>
            </TableCell>
            <TableCell>
              <Box>
                <Skeleton variant="text" width={120} />
                <Skeleton variant="text" width={120} />
              </Box>
            </TableCell>
            <TableCell>
              <Box>
                <Skeleton variant="text" width={80} />
                <Skeleton variant="text" width={80} />
              </Box>
            </TableCell>
            <TableCell>
              <Box>
                <Skeleton variant="text" width={100} />
                <Skeleton variant="text" width={80} />
              </Box>
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={100} />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
