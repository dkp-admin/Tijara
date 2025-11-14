import { CircularProgress } from "@mui/material";
import Autocomplete, {
  AutocompleteInputChangeReason,
} from "@mui/material/Autocomplete";
import { Box, darken, lighten, styled } from "@mui/system";
import { t } from "i18next";
import * as React from "react";
import serviceCaller from "src/api/serviceCaller";
import { useEntity } from "src/hooks/use-entity";
import { useDebounce } from "use-debounce";
import TextFieldWrapper from "../text-field-wrapper";

const GroupHeader = styled("div")(({ theme }) => ({
  position: "sticky",
  top: "-8px",
  padding: "7px 10px",
  color: theme.palette.primary.main,
  backgroundColor:
    theme.palette.mode === "light"
      ? lighten(theme.palette.primary.light, 0.7)
      : darken(theme.palette.primary.main, 0.8),
}));

const GroupItems = styled("ul")({
  padding: 0,
});

export default function KitchenProductSelect({
  id,
  companyRef,
  locationRef,
  onChange,
  label = t("Products/Categories"),
}: {
  id: string;
  label?: string;
  companyRef: any;
  locationRef: any;
  onChange: (x: any, y: any, z?: any) => any;
}) {
  const lng = localStorage.getItem("currentLanguage");

  const [inputValue, setInputValue] = React.useState("");
  const [debouncedQuery] = useDebounce(inputValue, 500);

  const { find, entities, loading } = useEntity("product/search");
  const { find: findProduct, entities: products } = useEntity("product");
  const { find: findCategory, entities: categories } = useEntity("category");

  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (companyRef && locationRef) {
      find({
        _q: debouncedQuery || "",
        companyRef: companyRef,
        locationRef: locationRef,
        showNonSaleable: false,
      });
    }
  }, [debouncedQuery, companyRef, locationRef]);

  React.useEffect(() => {
    if (companyRef && locationRef) {
      findProduct({
        _q: "",
        page: 0,
        limit: 500,
        sort: "asc",
        activeTab: "all",
        companyRef: companyRef,
        locationRef: locationRef,
        showNonSaleable: false,
      });
    }
  }, [companyRef, locationRef]);

  React.useEffect(() => {
    if (companyRef) {
      findCategory({
        _q: "",
        page: 0,
        limit: 100,
        sort: "asc",
        activeTab: "all",
        companyRef: companyRef,
      });
    }
  }, [companyRef]);

  const filterItems = (items: any, data: any, type: string) => {
    const dataObj = items?.filter((item: any) => data.includes(item._id)) || [];

    return dataObj?.map((d: any) => {
      return { ...d, type: type };
    });
  };

  const transformOptions = (items: any, locationRef: string) => {
    return items.reduce((acc: any, item: any) => {
      const isAssignedToLocation = item.kitchens?.some(
        (kitchen: any) => kitchen.locationRef === locationRef
      );

      if (!isAssignedToLocation) {
        acc.push(item);
      }

      return acc;
    }, []);
  };

  const kitchenFilteredOptions = React.useMemo(() => {
    if (entities?.results?.length > 0) {
      const data = entities?.results?.map((d: any) => d.value);
      const productList = filterItems(products?.results, data, "Products");
      const categoryList = filterItems(categories?.results, data, "Categories");
      const combinedList = [...categoryList, ...productList];
      const transformedOptions = transformOptions(combinedList, locationRef);

      return transformedOptions;
    } else {
      return [];
    }
  }, [entities, products, categories, locationRef]);

  const handleInputChange = (
    event: React.ChangeEvent<{}>,
    value: string,
    reason: AutocompleteInputChangeReason
  ) => {
    setInputValue(value);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      <Autocomplete
        id={id}
        fullWidth
        disablePortal
        value={null}
        onInputChange={handleInputChange}
        options={kitchenFilteredOptions || []}
        groupBy={(option) => option.type}
        getOptionLabel={(option) =>
          option?.name?.[lng] || option?.name?.en || ""
        }
        renderGroup={(params) => (
          <li key={params.key}>
            <GroupHeader>{params.group}</GroupHeader>
            <GroupItems>{params.children}</GroupItems>
          </li>
        )}
        renderOption={(props, option, { selected }) => (
          <li {...props}>{option?.name?.[lng] || option.name?.en}</li>
        )}
        onChange={async (e, newValue) => {
          if (newValue?.variants?.length > 0) {
            onChange(newValue, "product");
          } else {
            const products = await serviceCaller("/product", {
              method: "GET",
              query: {
                _q: "",
                page: 0,
                limit: 100,
                sort: "asc",
                activeTab: "active",
                companyRef: companyRef,
                locationRef: locationRef,
                categoryRefs: [newValue?._id],
              },
            });

            onChange(newValue, "category", products?.results);
          }

          setInputValue("");
          inputRef.current?.blur();
        }}
        noOptionsText={loading ? <CircularProgress /> : "No options"}
        renderInput={(params) => (
          <TextFieldWrapper
            {...params}
            fullWidth
            label={label}
            inputRef={inputRef}
            onKeyDown={(e) => {
              const { key } = e;
              const target = e.target as HTMLInputElement;
              if (key === "Backspace") {
                onChange("", "");
              }
              if (key === " " && target.value === "") {
                e.preventDefault();
              }
            }}
          />
        )}
      />
    </Box>
  );
}
