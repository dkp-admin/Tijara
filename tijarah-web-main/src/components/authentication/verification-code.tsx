import { Box, FormHelperText, TextField } from "@mui/material";
import { FC, useEffect, useRef, useState } from "react";

interface VerificationCodeProsp {
  onValueChange: (val: any) => void;
  value: any;
  errors: any;
  touched: any;
}

export const VerificationCode: FC<VerificationCodeProsp> = (props) => {
  const { onValueChange, value, errors, touched } = props;
  const itemsRef = useRef([]);

  const [verificationCode, setVerificationCode] = useState<string[]>([]);

  if (props.value && verificationCode.length === 0) {
    setVerificationCode(value.split(""));
  }

  const setVerificationCodeAtIndex = (v: string, i: number) => {
    setVerificationCode((pln) => {
      const plnCopy = [...pln];
      plnCopy[i] = v;
      return plnCopy;
    });
  };

  useEffect(() => {
    onValueChange(verificationCode.join(""));
  }, [verificationCode]);

  return (
    <>
      <Box
        sx={{
          columnGap: "30px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          py: 1,
          width: "100%",
        }}
      >
        {[1, 2, 3, 4].map((_, index) => {
          return (
            <TextField
              variant="outlined"
              key={`code-${index}`}
              tabIndex={0}
              inputProps={{ maxLength: 1, style: { textAlign: "center" } }}
              value={verificationCode[index] || ""}
              onKeyDown={(e) => {
                const { key } = e;
                const getNextIndex = () => (index < 3 ? index + 1 : index);
                const getPrevIndex = () => (index > 0 ? index - 1 : 0);

                if (index <= 3 && key !== "Backspace") {
                  // number
                  if (!Number.isNaN(Number(key))) {
                    setVerificationCodeAtIndex(key, index);
                    itemsRef.current[getNextIndex()].focus();
                  } else {
                    // set error
                  }
                } else if (key === "Backspace") {
                  setVerificationCodeAtIndex("", index);
                  itemsRef.current[getPrevIndex()].focus();
                }
              }}
              inputRef={(el) => {
                itemsRef.current[index] = el;
              }}
            />
          );
        })}
      </Box>
      {touched && errors && (
        <Box sx={{ ml: 2 }}>
          <FormHelperText error>{errors}</FormHelperText>
        </Box>
      )}
    </>
  );
};
