import { Box, Skeleton, TableCell, TableRow } from "@mui/material";

export function ExpenseRowLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
        return (
          <TableRow key={i}>
            <TableCell>
              <Skeleton variant="text" width={120} />
            </TableCell>
            <TableCell>
              <Skeleton sx={{ ml: 1 }} variant="text" width={100} />
            </TableCell>
            <TableCell align="right">
              <Skeleton sx={{ ml: 1 }} variant="text" width={100} />
            </TableCell>
            <TableCell align="right">
              <Skeleton sx={{ ml: 1 }} variant="text" width={100} />
            </TableCell>
            <TableCell align="right">
              <Skeleton sx={{ ml: 1 }} variant="text" width={100} />
            </TableCell>
            <TableCell align="right">
              <Skeleton sx={{ ml: 1 }} variant="text" width={100} />
            </TableCell>
            <TableCell align="right">
              <Skeleton sx={{ ml: 1 }} variant="text" width={100} />
            </TableCell>
            <TableCell align="right">
              <Skeleton sx={{ ml: 1 }} variant="text" width={100} />
            </TableCell>
            <TableCell align="right">
              <Skeleton sx={{ ml: 1 }} variant="text" width={100} />
            </TableCell>
            <TableCell align="right">
              <Skeleton sx={{ ml: 1 }} variant="text" width={60} />
            </TableCell>
            <TableCell align="right">
              <Skeleton sx={{ ml: 1 }} variant="text" width={120} />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
