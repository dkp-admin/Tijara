import {
  FormControl,
  FormGroup,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Phone as PhoneIcon } from "src/icons/phone";
import { FormikTouched } from "formik";
import countries from "src/utils/country_code.json";
import { DefaultTFuncReturn } from "i18next";

interface PhoneInputProps {
  style?: any;
  handleChangeCountry: (e: any) => void;
  touched?: boolean | undefined | FormikTouched<any> | FormikTouched<any>[];
  value: any;
  error: any;
  onChange: (e: string | ChangeEvent<any>) => void;
  onFocus?: (e: any) => void;
  onBlur?: (e: any) => void;
  country?: string;
  required: boolean;
  label?: string | DefaultTFuncReturn;
  disabled?: any;
  dataTestId?: string;
}

export default function PhoneInput({
  style,
  handleChangeCountry,
  touched,
  value,
  error,
  onChange,
  onFocus,
  onBlur,
  country,
  required,
  label,
  disabled = false,
  dataTestId,
}: PhoneInputProps) {
  const [open, setOpen] = React.useState(false);
  const [phoneLength, setPhoneLength] = useState(0);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  useEffect(() => {
    const countryObj: any = countries.find(
      (count) => count.dial_code === country
    );

    setPhoneLength(countryObj?.phLength);
  }, [country]);

  return (
    <FormGroup>
      <FormControl sx={{ ...style }}>
        <TextField
          fullWidth
          InputLabelProps={{
            style: {
              overflow: "visible",
            },
          }}
          id="phone"
          disabled={disabled}
          required={required}
          inputProps={{
            "data-testid": dataTestId,
            maxLength: phoneLength,
          }}
          autoComplete="off"
          InputProps={{
            value: value,
            startAdornment: (
              <FormControl style={{ width: 120 }}>
                <Select
                  disabled={disabled}
                  disableUnderline
                  variant="standard"
                  style={{ minWidth: 70 }}
                  open={open}
                  onClose={handleClose}
                  onOpen={handleOpen}
                  value={country}
                  name="country"
                  onChange={handleChangeCountry}
                  inputProps={{
                    id: "open-select",
                    maxLength: 15,
                  }}
                  sx={{
                    mr: 2,
                    mt: 2.25,
                  }}
                >
                  {countries.map((option, key) => (
                    <MenuItem value={option.dial_code} key={key}>
                      {option.dial_code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <PhoneIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          // autoFocus
          error={Boolean(touched && error)}
          helperText={touched && error}
          label={label}
          margin="normal"
          onFocus={onFocus}
          onBlur={onBlur}
          onChange={(e) => {
            const value = e.target.value;
            if (value) {
              // remove all non numeric characters
              const cleanedNumber = e.target.value.replace(/\D/g, "");
              e.target.value = cleanedNumber
                ? (Number(cleanedNumber) as any)
                : "";
            }
            onChange(e);
          }}
          type="tel"
          onWheel={(event: any) => {
            event.stopPropagation();
            event.target.blur();
          }}
          onKeyDown={(e) => {
            if (e.key == "ArrowUp" || e.key == "ArrowDown") {
              e.preventDefault();
            }
          }}
        />
      </FormControl>
    </FormGroup>
  );
}
