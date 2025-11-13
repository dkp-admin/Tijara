import { TextField, TextFieldProps } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useDebouncedCallback } from "use-debounce";

const INPUT_DELAY = 250;

const TextFieldWrapper: React.FC<TextFieldProps> = (props) => {
  const [innerValue, setInnerValue] = useState("");

  useEffect(() => {
    if (props.value) {
      setInnerValue(props.value as string);
    } else {
      setInnerValue("");
    }
  }, [props.value]);

  const debouncedHandleOnChange = useDebouncedCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (props.onChange) {
        props.onChange(event);
      }
    },
    INPUT_DELAY
  );

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // event.persist();

    const newValue = event?.currentTarget?.value;
    setInnerValue(newValue);
    debouncedHandleOnChange(event);
  };

  return <TextField {...props} value={innerValue} onChange={handleOnChange} />;
};

export default TextFieldWrapper;
