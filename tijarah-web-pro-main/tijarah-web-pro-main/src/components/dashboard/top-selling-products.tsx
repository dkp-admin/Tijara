import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardHeader,
  CircularProgress,
  Divider,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import InfoCircleIcon from "@untitled-ui/icons-react/build/esm/InfoCircle";
import PropTypes from "prop-types";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { Scrollbar } from "src/components/scrollbar";
import TopSellingProductIcon from "../../icons/top-selling-product";
import NoDataAnimation from "../widgets/animations/NoDataAnimation";
import { toFinite } from "lodash";
import { toFixedNumber } from "src/utils/toFixedNumber";
import { useRouter } from "next/router";
import { tijarahPaths } from "src/paths";
import LoaderAnimation from "../widgets/animations/loader";
import { useCurrency } from "src/utils/useCurrency";

interface Product {
  id: number;
  image: string;
  name: {
    en: string;
    ar: string;
  };
  price: number;
  totalOrder: number;
  grossRevenue: number;
}

interface TopSellingProductsProps {
  loading?: boolean;
  products: Product[];
}

export const TopSellingProducts: FC<TopSellingProductsProps> = (props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { products, loading } = props;
  const currency = useCurrency();

  return (
    <Card>
      <CardHeader
        title={t("Top Selling Products")}
        action={
          <Tooltip title={t("Showing top selling products")}>
            <SvgIcon color="action">
              <InfoCircleIcon />
            </SvgIcon>
          </Tooltip>
        }
      />
      {loading ? (
        <Box
          sx={{
            height: "50vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Scrollbar>
            {products?.length > 0 ? (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{"SN"}</TableCell>
                    <TableCell>{t("Name")}</TableCell>
                    {/* <TableCell>{t("Total Order")}</TableCell> */}
                    <TableCell>{t("Total Sales")}</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {products?.map((product, index) => {
                    return (
                      <TableRow
                        key={index}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell>
                          {index == 0 || index == 1 || index == 2 ? (
                            <TopSellingProductIcon />
                          ) : (
                            <Typography variant="body2">{index + 1}</Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Stack
                            alignItems="center"
                            direction="row"
                            spacing={1}
                          >
                            <Avatar
                              src={product.image || ""}
                              sx={{
                                height: 42,
                                width: 42,
                                backgroundColor: (theme) =>
                                  theme.palette.mode === "dark"
                                    ? "#0C935633"
                                    : "#006C3533",
                              }}
                            />

                            <Typography variant="body2">
                              {product?.name?.en || ""}
                            </Typography>
                          </Stack>
                        </TableCell>

                        {/* <TableCell>{product.totalOrder || 0}</TableCell> */}

                        <TableCell>
                          {`${currency} ${toFixedNumber(
                            product.grossRevenue
                          )}` || 0}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <Box
                sx={{
                  overflow: "hidden",
                  mt: 6,
                  mb: 5,
                }}
              >
                <NoDataAnimation
                  text={
                    <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                      {t("No Top Selling Products!")}
                    </Typography>
                  }
                />
              </Box>
            )}
          </Scrollbar>
        </>
      )}

      <Divider />
      {products?.length > 0 && (
        <CardActions>
          <Button
            onClick={() => {
              router.push(tijarahPaths.reports.variantReport);
            }}
            endIcon={
              <SvgIcon>
                <ArrowRightIcon />
              </SvgIcon>
            }
            size="small"
          >
            {t("View All")}
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

TopSellingProducts.propTypes = {
  products: PropTypes.array.isRequired,
};
