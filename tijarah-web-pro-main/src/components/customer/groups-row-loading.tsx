import { Skeleton, TableCell, TableRow } from "@mui/material";

export function GroupsRowLoading() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => {
        return (
          <TableRow key={i}>
            <TableCell>
              <Skeleton variant="text" width={150} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={120} />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width={80} />
            </TableCell>
            <TableCell
              align="right"
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Skeleton variant="text" width={100} />
              <Skeleton sx={{ ml: 3 }} variant="text" width={40} />
              <Skeleton sx={{ ml: 1 }} variant="text" width={40} />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
