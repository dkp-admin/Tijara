import { Box, IconButton, SvgIcon, TableCell, Typography } from "@mui/material";
import PropTypes from "prop-types";
import { type FC } from "react";
import { TransformedArrowIcon } from "src/components/TransformedIcons";

interface CategoryItemsProps {
  categorylist: any;
}

export const CategoryItems: FC<CategoryItemsProps> = (props) => {
  const { categorylist } = props;

  const lng = localStorage.getItem("currentLanguage");
  const isRTL = lng === "ar" || lng === "ur";

  const getCategoryNameInitial = () => {
    const name = categorylist.name.en?.split(" ");

    return name?.length > 1
      ? name[0]?.charAt(0)?.toUpperCase() + name[1]?.charAt(0)?.toUpperCase()
      : name[0]?.charAt(0)?.toUpperCase();
  };

  return (
    <>
      <TableCell sx={{ cursor: "pointer" }}>
        <Box
          sx={{
            pl: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {categorylist?.image ? (
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 1,
                display: "flex",
                overflow: "hidden",
                alignItems: "center",
                backgroundSize: "cover",
                justifyContent: "center",
                backgroundPosition: "center",
                backgroundColor: "neutral.50",
                backgroundImage: `url(${categorylist.image})`,
              }}
            />
          ) : (
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark" ? "#0C935680" : "#006C3580",
              }}
            >
              <Typography variant="h6" color="#fff">
                {getCategoryNameInitial()}
              </Typography>
            </Box>
          )}
          <Box sx={{ flex: 1, ml: 2 }}>
            <Typography variant="subtitle2">
              {isRTL ? categorylist.name.ar : categorylist.name.en}
            </Typography>
          </Box>
        </Box>
      </TableCell>

      <TableCell sx={{ pr: 2.5, textAlign: "right" }}>
        <IconButton>
          <SvgIcon>
            <TransformedArrowIcon name="chevron-right" />
          </SvgIcon>
        </IconButton>
      </TableCell>
    </>
  );
};

CategoryItems.propTypes = {
  // @ts-ignore
  categorylist: PropTypes.object,
};
