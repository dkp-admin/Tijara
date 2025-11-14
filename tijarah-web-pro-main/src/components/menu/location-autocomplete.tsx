import LocationOnIcon from "@mui/icons-material/LocationOn";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import throttle from "lodash/throttle";
import * as React from "react";
import { useTranslation } from "react-i18next";

const autocompleteService: any = { current: null };

interface MainTextMatchedSubstrings {
  offset: number;
  length: number;
}
interface StructuredFormatting {
  main_text: string;
  secondary_text: string;
  main_text_matched_substrings: readonly MainTextMatchedSubstrings[];
}
interface PlaceType {
  description: string;
  terms: any[];
  structured_formatting: StructuredFormatting;
}

export default function LocationAutocomplete({
  onSelectLocation,
  title = "Search Location",
  defaultValue = "",
  error = "",
  required = false,
}: {
  onSelectLocation: any;
  title: string;
  defaultValue: string;
  error?: string;
  required?: boolean;
}) {
  const { t } = useTranslation();
  const [value, setValue] = React.useState<PlaceType | null>(null);
  const [inputValue, setInputValue] = React.useState(defaultValue);
  const [options, setOptions] = React.useState<readonly PlaceType[]>([]);

  const fetch = React.useMemo(
    () =>
      throttle(
        (
          request: { input: string },
          callback: (results?: readonly PlaceType[]) => void
        ) => {
          (autocompleteService.current as any).getPlacePredictions(
            request,
            callback
          );
        },
        500
      ),
    [inputValue]
  );

  React.useEffect(() => {
    const active = true;
    if (!autocompleteService.current) {
      autocompleteService.current = new (
        window as any
      ).google.maps.places.AutocompleteService();
    }
    if (!autocompleteService.current) {
      return undefined;
    }

    if (inputValue === "") {
      setOptions(value ? [value] : []);
      return undefined;
    }

    fetch({ input: inputValue }, (results?: readonly PlaceType[]) => {
      if (active) {
        let newOptions: readonly PlaceType[] = [];

        if (value) {
          newOptions = [value];
        }

        if (results) {
          newOptions = [...newOptions, ...results];
        }

        setOptions(newOptions);
      }
    });
  }, [value, inputValue, fetch]);

  React.useEffect(() => {
    if ((window as any)?.google?.maps) {
      const geocode = new (window as any).google.maps.Geocoder();

      geocode.geocode(
        { address: value?.description },
        (results: any, status: any) => {
          if (status == "OK") {
            onSelectLocation({
              terms: value?.terms,
              address: results[0].formatted_address,
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            });
          }
        }
      );
    }
  }, [value]);

  React.useEffect(() => {
    fetch({ input: defaultValue }, (results?: readonly PlaceType[]) => {
      setValue(results[0]);
      setOptions([]);
    });

    setInputValue(defaultValue);
  }, [defaultValue]);

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Autocomplete
          id="google-map-demo"
          fullWidth
          getOptionLabel={(option) =>
            typeof option === "string" ? option : option.description
          }
          filterOptions={(x) => x}
          options={options}
          autoComplete
          includeInputInList
          filterSelectedOptions
          value={value}
          onChange={(event: any, newValue: PlaceType | null) => {
            setOptions(newValue ? [newValue, ...options] : options);
            setValue(newValue);
          }}
          onInputChange={(event, newInputValue) => {
            setInputValue(newInputValue);
          }}
          renderInput={(params) => {
            return (
              <TextField
                {...params}
                label={t(title)}
                fullWidth
                required={required}
              />
            );
          }}
          renderOption={(props, option) => {
            if (!option) {
              return;
            }
            return (
              <li {...props}>
                <Grid container alignItems="center">
                  <Grid item>
                    <Box
                      component={LocationOnIcon}
                      sx={{ color: "text.secondary", mr: 2 }}
                    />
                  </Grid>
                  <Grid item xs>
                    <span
                      style={{
                        fontWeight: 700,
                      }}
                    >
                      {option?.structured_formatting?.main_text}
                    </span>

                    <Typography variant="body2" color="text.secondary">
                      {option?.structured_formatting?.secondary_text}
                    </Typography>
                  </Grid>
                </Grid>
              </li>
            );
          }}
        />
        {error && (
          <Typography color="error" variant="caption" sx={{ ml: 1.5 }}>
            {error}
          </Typography>
        )}
      </Box>
    </>
  );
}
