import { Box, Skeleton, TableCell, TableRow } from "@mui/material";

export function POGRNsRowLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
        return (
          <TableRow key={i}>
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
              <Skeleton variant="text" width={100} />
            </TableCell>
            <TableCell align="right">
              <Skeleton sx={{ marginLeft: 5 }} variant="text" width={100} />
            </TableCell>
            <TableCell align="right">
              <Skeleton sx={{ marginLeft: 5 }} variant="text" width={100} />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
