import { Skeleton, TableCell, TableRow } from "@mui/material";

export function StatsLoading() {
  return (
    <>
      {[1].map((i) => {
        return (
          <TableRow key={i}>
            <TableCell sx={{ border: "none" }}>
              <Skeleton variant="text" width={80} />
            </TableCell>
          </TableRow>
        );
      })}
    </>
  );
}
