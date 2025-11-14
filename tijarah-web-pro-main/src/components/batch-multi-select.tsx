import type { ChangeEvent, FC } from "react";
import { useCallback, useState } from "react";
import PropTypes from "prop-types";
import ChevronDownIcon from "@untitled-ui/icons-react/build/esm/ChevronDown";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  InputBase,
  Menu,
  MenuItem,
  SvgIcon,
  TextField,
} from "@mui/material";
import { usePopover } from "src/hooks/use-popover";

interface BatchMultiSelectProps {
  label: string;
  // Same as type as the value received above
  onChange?: (value: any[]) => void;
  options: { label: string; value: unknown }[];
  // This should accept string[], number[] or boolean[]
  value: any[];
  isMulti?: boolean;
}

export const BatchMultiSelect: FC<BatchMultiSelectProps> = (props) => {
  const {
    label,
    onChange,
    options,
    value = [],
    isMulti = true,
    ...other
  } = props;
  const popover = usePopover<HTMLButtonElement>();

  const handleValueChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>): void => {
      let newValue = [...value];

      if (!isMulti) {
        newValue = [event.target.value];
        onChange(newValue);
        return;
      }

      if (event.target.checked) {
        newValue.push(event.target.value);
      } else {
        newValue = newValue.filter((item) => item !== event.target.value);
      }

      onChange?.(newValue);
    },
    [onChange, value]
  );

  const checkAllSelected = (option: any) => {
    return value.includes(option.value);
  };

  return (
    <>
      <Button
        color="inherit"
        endIcon={
          <SvgIcon>
            <ChevronDownIcon />
          </SvgIcon>
        }
        onClick={popover.handleOpen}
        ref={popover.anchorRef}
        {...other}
      >
        {label}
      </Button>
      <Box sx={{ overflowY: "scroll" }}>
        <Menu
          anchorEl={popover.anchorRef.current}
          onClose={popover.handleClose}
          open={popover.open}
          PaperProps={{ style: { minWidth: 250 } }}
        >
          {options.map((option) => (
            <MenuItem key={option.label}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checkAllSelected(option)}
                    onChange={(e) => {
                      popover.handleClose();
                      handleValueChange(e);
                    }}
                    value={option.value}
                  />
                }
                label={option.label}
                sx={{
                  flexGrow: 1,
                  mr: 0,
                }}
              />
            </MenuItem>
          ))}
        </Menu>
      </Box>
    </>
  );
};

BatchMultiSelect.propTypes = {
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
  value: PropTypes.array.isRequired,
};
