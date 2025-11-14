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

interface AddProductTextInputProps {
  id: string;
  label: string;
  companyRef: string;
  locationRef: string;
  onProductSelect: any;
}

export default function AddProductOnlineTextInput({
  id,
  companyRef,
  locationRef,
  onProductSelect,
  label = t("Product"),
}: AddProductTextInputProps) {
  const { find, entities } = useEntity("menu");

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
    find({
      page: 0,
      limit: 100,
      sort: "desc",
      activeTab: "active",
      companyRef: companyRef,
      locationRef: locationRef,
      _q: debouncedQuery || "",
    });
  }, [debouncedQuery, companyRef, locationRef]);

  useEffect(() => {
    if (entities?.results?.length > 0) {
      const data: any[] = [];

      entities?.results?.forEach((result: any) => {
        const variants = result?.variants?.filter(
          (v: any) =>
            !v?.nonSaleable &&
            v?.unit === "perItem" &&
            v?.prices?.find(
              (p: any) =>
                p?.locationRef === locationRef && Number(p?.price || 0) > 0
            )
        );

        const boxes = result?.boxes?.filter((b: any) => !b?.nonSaleable);

        if (variants?.length > 0 || boxes?.length > 0) {
          data.push({ ...result, boxes: boxes, variants: variants });
        }
      });

      setProductList(data);
    }
  }, [entities]);

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
