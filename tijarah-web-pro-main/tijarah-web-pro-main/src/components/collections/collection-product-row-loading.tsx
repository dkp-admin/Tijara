import { Skeleton, TableCell, TableRow } from "@mui/material";

export function CollectionProductRowLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => {
        return (
          <TableRow key={i}>
            <TableCell>
              <Skeleton variant="text" width={180} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={150} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={150} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={180} />
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
