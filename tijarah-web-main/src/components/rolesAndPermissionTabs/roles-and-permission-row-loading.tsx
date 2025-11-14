import { Box, Skeleton, TableCell, TableRow } from "@mui/material";

export function RolesAndPermissionsRowLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
        return (
          <TableRow key={i}>
            <TableCell>
              <Skeleton variant="text" width={100} />
            </TableCell>
            <TableCell>
              <Box sx={{ alignItems: "center", display: "flex" }}>
                <Skeleton variant="rectangular" width={40} />
                <Skeleton sx={{ ml: 1 }} variant="text" width={120} />
              </Box>
            </TableCell>
            <TableCell align="right">
              <Skeleton variant="text" width={20} />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
