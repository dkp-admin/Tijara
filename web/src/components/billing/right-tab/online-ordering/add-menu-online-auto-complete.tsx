import { List, ListItem, ListItemText, Paper, Popper } from "@mui/material";
import Autocomplete, {
  AutocompleteInputChangeReason,
} from "@mui/material/Autocomplete";
import { Box } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import { useEffect } from "react";
import TextFieldWrapper from "src/components/text-field-wrapper";
import { useEntity } from "src/hooks/use-entity";
import { useDebounce } from "use-debounce";

interface AddMenuTextInputProps {
  id: string;
  label: string;
  orderType: string;
  companyRef: string;
  locationRef: string;
  onProductSelect: any;
}

export default function AddMenuOnlineTextInput({
  id,
  orderType,
  companyRef,
  locationRef,
  onProductSelect,
  label = t("Product"),
}: AddMenuTextInputProps) {
  const { findOne, entity } = useEntity("menu-management/menu");

  const lng = localStorage.getItem("currentLanguage");

  const [inputValue, setInputValue] = React.useState("");
  const [debouncedQuery] = useDebounce(inputValue, 500);
  const [productList, setProductList] = React.useState([]);

  const handleInputChange = (
    event: React.ChangeEvent<{}>,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => {
    setInputValue(value);
  };

  useEffect(() => {
    findOne(
      `?_q=${debouncedQuery}&orderType=${orderType?.toLowerCase()}&locationRef=${locationRef}&companyRef=${companyRef}`
    );
  }, [debouncedQuery, orderType, companyRef, locationRef]);

  useEffect(() => {
    if (entity?.results) {
      const data: any[] = [];

      entity?.results?.products?.forEach((prod: any) => {
        const variants = prod?.variants?.filter(
          (v: any) =>
            !v?.nonSaleable &&
            v?.unit === "perItem" &&
            v?.prices?.find(
              (p: any) =>
                p?.locationRef === locationRef && Number(p?.price || 0) > 0
            )
        );

        const boxes = prod?.boxes?.filter((b: any) => !b?.nonSaleable);

        if (variants?.length > 0 || boxes?.length > 0) {
          data.push({ ...prod, boxes: boxes, variants: variants });
        }
      });

      setProductList(data);
    }
  }, [entity?.results]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Autocomplete
        id={id}
        fullWidth
        disablePortal
        value={null}
        inputValue={inputValue}
        options={productList || []}
        onInputChange={handleInputChange}
        onChange={onProductSelect}
        getOptionLabel={(option) =>
          option?.name?.[lng] || option?.name?.en || ""
        }
        renderInput={(params) => (
          <TextFieldWrapper
            {...params}
            label={label}
            fullWidth
            onKeyDown={(e) => {
              const { key } = e;
              const target = e.target as HTMLInputElement;
              if (key === "Backspace") {
                // setInputValue("");
              }
              if (key === " " && target.value === "") {
                e.preventDefault();
              }
            }}
          />
        )}
        onKeyPress={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
          }
        }}
        PopperComponent={({ children, ...popperProps }) => (
          <Popper {...popperProps} placement="bottom-start">
            <Paper>
              <List component="ul" aria-label="product options">
                {React.isValidElement(children) ? (
                  children
                ) : (
                  <ListItem>
                    <ListItemText primary="No options available" />
                  </ListItem>
                )}
              </List>
            </Paper>
          </Popper>
        )}
        ListboxComponent={({ children, ...listboxProps }) => (
          <div {...listboxProps}>{children}</div>
        )}
      />
    </Box>
  );
}
