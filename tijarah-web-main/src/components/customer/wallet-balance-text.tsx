import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import { useEffect } from "react";
import { useFindOne } from "src/hooks/use-find-one";

interface WalletBalancePropType {
  companyRef: string;
  customerRef: string;
}

const WalletBalance = (props: WalletBalancePropType) => {
  const { companyRef, customerRef } = props;

  const { findOne, entity, loading } = useFindOne("wallet/get");

  useEffect(() => {
    const query: any = {
      customerRef: customerRef?.toString(),
      companyRef: companyRef?.toString(),
    };
    if (companyRef && customerRef) findOne({ ...query });
  }, [companyRef, customerRef]);

  return (
    <Box>
      <Typography>{entity?.closingBalance || "-"}</Typography>
    </Box>
  );
};

export default WalletBalance;
