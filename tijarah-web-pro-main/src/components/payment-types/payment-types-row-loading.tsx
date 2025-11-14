import { Skeleton, TableCell, TableRow } from "@mui/material";

export const PaymentTypesRowLoading = () => {
  return (
    <TableRow>
      <TableCell>
        <Skeleton variant="text" width="100%" />
      </TableCell>
      <TableCell>
        <Skeleton variant="rectangular" width={80} height={24} />
      </TableCell>
      <TableCell>
        <Skeleton variant="rectangular" width={60} height={32} />
      </TableCell>
    </TableRow>
  );
};
