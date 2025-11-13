import { Box, Typography } from "@mui/material";
import { useEffect } from "react";
import { useEntity } from "src/hooks/use-entity";

const DeviceCount = (props: any) => {
  const { id } = props;
  const { findOne, entity } = useEntity("apk-management/device-count");

  useEffect(() => {
    if (id !== null || id !== undefined) {
      findOne(id.toString());
    }
  }, [id]);

  return (
    <Box>
      <Typography>{entity?.deviceCount || "-"}</Typography>
    </Box>
  );
};

export default DeviceCount;
