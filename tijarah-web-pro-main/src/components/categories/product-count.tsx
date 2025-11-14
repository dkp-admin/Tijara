import { Box, Typography } from "@mui/material";
import { useEffect } from "react";
import { useFindOne } from "src/hooks/use-find-one";

const ProductCount = (props: any) => {
  const { id } = props;
  const { findOne, entity } = useFindOne("category/count");

  useEffect(() => {
    if (id !== null) {
      const query: any = {
        id: id?.toString(),
      };

      findOne(query);
    }
  }, [id]);

  return (
    <Box>
      <Typography>{entity?.count || "-"}</Typography>
    </Box>
  );
};

export default ProductCount;
