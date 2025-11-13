import {
  Avatar,
  Box,
  Card,
  FormControlLabel,
  IconButton,
  SvgIcon,
  Switch,
  Typography,
} from "@mui/material";
import Image01Icon from "@untitled-ui/icons-react/build/esm/Image01";
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import { ChangeEvent, FC, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CategoriesRowLoading } from "src/components/categories/categories-row-loading";
import { RouterLink } from "src/components/router-link";
import NoDataAnimation from "src/components/widgets/animations/NoDataAnimation";
import { SuperTable } from "src/components/widgets/super-table";
import { SuperTableHeader } from "src/components/widgets/super-table-header";
import { useAuth } from "src/hooks/use-auth";
import { useEntity } from "src/hooks/use-entity";
import { usePageView } from "src/hooks/use-page-view";
import { tijarahPaths } from "src/paths";
import { Sort } from "src/types/sortoption";
import { sortOptions } from "src/utils/constants";
import { useDebounce } from "use-debounce";
import { TransformedArrowIcon } from "../TransformedIcons";
import { usePermissionManager } from "src/hooks/permission-manager/use-permission-manager";
import { MoleculeType } from "src/permissionManager";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";
import ProductCount from "./product-count";

interface CategoryTableCardProps {
  industry?: string;
  companyRef?: string;
  companyName?: string;
  profilePicture?: string;
  origin?: string;
}

export const CategoriesTableCard: FC<CategoryTableCardProps> = (props) => {
  usePageView();
  const { companyRef, companyName, origin, profilePicture, industry } = props;
  const canAccess = usePermissionManager();
  const canUpdate = canAccess(MoleculeType["category:update"]);

  const { find, updateEntity, loading, entities } = useEntity("category");

  const router = useRouter();

  const { t } = useTranslation();

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [isCancelAllClicked] = useState(false);
  const [queryText, setQueryText] = useState("");
  const [debouncedQuery] = useDebounce(queryText, 500);
  const [sort, setSort] = useState<Sort>(sortOptions[0].value);
  const [filter, setFilter] = useState<any>([]);

  const handlePageChange = (newPage: number): void => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (
    event: ChangeEvent<HTMLInputElement>
  ): void => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  usePageView();

  const handleQueryChange = (value: string): void => {
    if (value != undefined) {
      setQueryText(value);
      if (page > 0) {
        setPage(0);
      }
    }
  };

  const handleSortChange = (value: any) => {
    setSort(value);
  };

  const handleStatusChange = async (id: string, checked: boolean) => {
    await updateEntity(id, {
      status: checked ? "active" : "inactive",
    });
  };

  const handleFilterChange = (changedFilter: any) => {
    setPage(0);
    setFilter(changedFilter);
  };

  const tableHeaders = [
    {
      key: "category",
      label: t("Category"),
    },
    // {
    //   key: "productCount",
    //   label: t("Product Count"),
    // },
    {
      key: "status",
      label: t("Status"),
    },
    {
      key: "action",
      label: t("Action"),
    },
  ];

  const lng = localStorage.getItem("currentLanguage");

  const getProductNameInitial = (d: any) => {
    const name = d.name.en?.split(" ");

    return name?.length > 1
      ? name[0]?.charAt(0)?.toUpperCase() + name[1]?.charAt(0)?.toUpperCase()
      : name[0]?.charAt(0)?.toUpperCase();
  };

  const transformedData = useMemo(() => {
    let arr: any[] = [];
    entities?.results?.map((d: any) => {
      arr.push({
        key: d?._id,
        _id: d?._id,

        category: (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              minWidth: "180px",
            }}
          >
            {d?.image ? (
              <Avatar
                src={d?.image}
                sx={{
                  height: 80,
                  width: 80,
                  borderRadius: 1,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: (theme) =>
                    theme.palette.mode === "dark" ? "#0C935680" : "#006C3580",
                }}
              >
                <Typography variant="h6" color="#fff">
                  {getProductNameInitial(d)}
                </Typography>
              </Box>
            )}
            <Box sx={{ ml: 1, textAlign: "start" }}>
              <Typography color="inherit" variant="subtitle2">
                {d?.name?.[lng] || d?.name?.en}
              </Typography>
            </Box>
          </Box>
        ),
        status: (
          <FormControlLabel
            sx={{
              width: "120px",
              display: "flex",
              flexDirection: "row",
            }}
            control={
              <Switch
                checked={d?.status === "active" ? true : false}
                color="primary"
                edge="end"
                name="status"
                onChange={(e) => {
                  if (!canUpdate) {
                    return toast.error(t("You don't have access"));
                  }
                  handleStatusChange(d?._id, e.target.checked);
                }}
                value={d?.status === "active" ? true : false}
                sx={{
                  mr: 0.2,
                }}
              />
            }
            label={d?.status === "active" ? t("Active") : t("Deactivated")}
          />
        ),
        action: (
          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
            }}
          >
            <IconButton
              onClick={() => {
                router.push({
                  pathname: tijarahPaths?.catalogue?.categories?.create,
                  query: {
                    id: d?._id,
                    companyRef: companyRef,
                    companyName: companyName,
                    industry: industry,
                    origin: origin ? origin : "",
                  },
                });
              }}
            >
              <SvgIcon>
                <TransformedArrowIcon name="arrow-right" />
              </SvgIcon>
            </IconButton>
          </Box>
        ),
      });
    });

    return arr;
  }, [entities]);

  useEffect(() => {
    find({
      page: page,
      sort: sort,
      activeTab: filter?.status?.length > 0 ? filter?.status[0] : "all",
      limit: rowsPerPage,
      _q: debouncedQuery,
      companyRef: companyRef,
    });
  }, [page, sort, debouncedQuery, rowsPerPage, filter, companyRef]);

  return (
    <>
      <Card>
        <Box>
          <SuperTableHeader
            onQueryChange={handleQueryChange}
            onFiltersChange={handleFilterChange}
            searchPlaceholder={t("Search with Category Name")}
            onSortChange={handleSortChange}
            sort={sort}
            sortOptions={sortOptions}
          />

          <SuperTable
            isLoading={loading}
            loaderComponent={CategoriesRowLoading}
            items={transformedData}
            headers={tableHeaders}
            total={entities?.total || 0}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPage={rowsPerPage}
            page={page}
            isCancelAllClicked={isCancelAllClicked}
            noDataPlaceholder={
              <Box sx={{ mt: 6, mb: 4 }}>
                <NoDataAnimation
                  text={
                    <Typography variant="h6" textAlign="center" sx={{ mt: 2 }}>
                      {t("No Categories!")}
                    </Typography>
                  }
                />
              </Box>
            }
          />
        </Box>
      </Card>
    </>
  );
};
