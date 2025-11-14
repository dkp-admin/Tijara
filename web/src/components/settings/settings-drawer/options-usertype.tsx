import type { FC } from "react";
import PropTypes from "prop-types";
import { Chip, Stack, Typography } from "@mui/material";
import type { UserRole } from "src/theme";

interface Option {
  label: string;
  value: UserRole;
}

const options: Option[] = [
  {
    label: "Super Admin",
    value: "superAdmin",
  },
  {
    label: "Merchant",
    value: "merchant",
  },
];

interface OptionsUserTypeProps {
  onChange?: (value: UserRole) => void;
  value?: UserRole;
}

export const OptionsUserType: FC<OptionsUserTypeProps> = (props) => {
  const { onChange, value } = props;

  return (
    <Stack spacing={1}>
      <Typography color="text.secondary" variant="overline">
        User Type
      </Typography>
      <Stack alignItems="center" direction="row" flexWrap="wrap" gap={2}>
        {options.map((option) => (
          <Chip
            key={option.label}
            label={option.label}
            onClick={() => onChange?.(option.value)}
            sx={{
              borderColor: "transparent",
              borderRadius: 1.5,
              borderStyle: "solid",
              borderWidth: 2,
              ...(option.value === value && {
                borderColor: "primary.main",
              }),
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
};

OptionsUserType.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.oneOf(["superAdmin", "merchant"]),
};
