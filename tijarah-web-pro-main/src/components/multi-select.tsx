import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Menu,
  MenuItem,
  SvgIcon,
} from "@mui/material";
import ChevronDownIcon from "@untitled-ui/icons-react/build/esm/ChevronDown";
import PropTypes from "prop-types";
import type { ChangeEvent, FC } from "react";
import { useCallback } from "react";
import { usePopover } from "src/hooks/use-popover";

interface MultiSelectProps {
  label: string;
  // Same as type as the value received above
  onChange?: (value: any[]) => void;
  options: { label: string; value: unknown }[];
  // This should accept string[], number[] or boolean[]
  value: any[];
  isMulti?: boolean;
}

export const MultiSelect: FC<MultiSelectProps> = (props) => {
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
          <MenuItem key={"all"}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={value?.length == 0}
                  onChange={() => {
                    if (value?.length > 0) {
                      onChange?.([]);
                    }
                    popover.handleClose();
                  }}
                />
              }
              label={"All"}
              sx={{
                flexGrow: 1,
                mr: 0,
              }}
            />
          </MenuItem>

          {options?.map((option) => (
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

MultiSelect.propTypes = {
  label: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  options: PropTypes.array.isRequired,
  value: PropTypes.array.isRequired,
};
