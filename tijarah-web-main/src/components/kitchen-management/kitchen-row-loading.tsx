import { Box, Skeleton, TableCell, TableRow } from "@mui/material";

export function KitchenRowLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
        return (
          <TableRow key={i}>
            <TableCell>
              <Box>
                <Skeleton variant="text" width={150} />
                <Skeleton variant="text" width={150} />
              </Box>
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={120} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={60} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={60} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={120} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={120} />
            </TableCell>
            <TableCell align="right">
              <Skeleton sx={{ marginLeft: 2 }} variant="text" width={30} />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
