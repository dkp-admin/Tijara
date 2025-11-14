import { Box, Skeleton, TableCell, TableRow } from "@mui/material";

export function CollectionsRowLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
        return (
          <TableRow key={i}>
            <TableCell>
              <Box sx={{ alignItems: "center", display: "flex" }}>
                <Skeleton variant="rectangular" width={50} />
                <Skeleton sx={{ ml: 2 }} variant="text" width={150} />
              </Box>
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={150} />
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
