import { Box, Skeleton, TableCell, TableRow } from "@mui/material";

export function WalletHistoryRowLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => {
        return (
          <TableRow key={i}>
            <TableCell>
              <Skeleton variant="text" width={150} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={60} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={80} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={100} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={100} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={180} />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
