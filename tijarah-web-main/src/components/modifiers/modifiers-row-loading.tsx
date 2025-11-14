import { Skeleton, TableCell, TableRow } from "@mui/material";

export function ModifiersRowLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
        return (
          <TableRow key={i}>
            <TableCell>
              <Skeleton variant="text" width={150} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={150} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={120} />
            </TableCell>
            <TableCell align="right">
              <Skeleton variant="text" width={120} />
            </TableCell>
            <TableCell align="right">
              <Skeleton variant="text" width={50} />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
