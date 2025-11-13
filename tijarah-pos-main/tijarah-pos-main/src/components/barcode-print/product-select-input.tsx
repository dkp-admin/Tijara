import nextFrame from "next-frame";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import RBSheet from "react-native-raw-bottom-sheet";
import { Like } from "typeorm";
import { useDebounce } from "use-debounce";
import { t } from "../../../i18n";
import { useTheme } from "../../context/theme-context";
import { checkDirection } from "../../hooks/check-direction";
import { useResponsive } from "../../hooks/use-responsiveness";
import { rowsPerPage } from "../../utils/constants";
import { repo } from "../../utils/createDatabaseConnection";
import ICONS from "../../utils/icons";
import { debugLog, errorLog } from "../../utils/log-patch";
import ItemDivider from "../action-sheet/row-divider";
import Input from "../input/input";
import Loader from "../loader";
import NoDataPlaceholder from "../no-data-placeholder/no-data-placeholder";
import Spacer from "../spacer";
import DefaultText from "../text/Text";

async function fetchProducts(query: string) {
  const queryBuilder = repo.product
    .createQueryBuilder("products")
    .where("products.name LIKE :name", { name: `%${query}%` });

  if (query && (Number(query) || 0) > 0) {
    queryBuilder.orWhere("products.variants LIKE :variantSku", {
      variants: "sku",
      variantSku: `%${query}%`,
    });
  }

  if (query) {
    queryBuilder.orWhere("products.variants LIKE :variantCode", {
      variants: "code",
      variantCode: `%${query}%`,
    });
  }

  await nextFrame();

  return queryBuilder.take(rowsPerPage).skip(0).getManyAndCount();
}

async function fetchBoxesCrates(query: string) {
  return repo.boxCrates.findOne({
    where: [
      { boxSku: Like(`%${query}%`) },
      { crateSku: Like(`%${query}%`) },
      { code: Like(`%${query}%`) },
    ],
  });
}

async function fetchProductsAndBoxCrates(query: string) {
  const productPromise = fetchProducts(query);
  const boxCratePromise = fetchBoxesCrates(query);

  // Run both queries in parallel
  const [products, boxCrate] = await Promise.all([
    productPromise,
    boxCratePromise,
  ]);

  if (query && boxCrate && products?.[0]?.length === 0) {
    const prod = await repo.product
      .createQueryBuilder("products")
      .where("products.variants LIKE :variantSku", {
        variants: "sku",
        variantSku: `%${boxCrate.productSku}%`,
      })
      .getOne();

    if (prod) {
      const variantDoc = prod.variants.find((variant: any) => {
        return variant.sku === boxCrate.productSku;
      });

      const boxCrateDoc = {
        ...boxCrate,
        unit: "perItem",
        name: variantDoc?.name,
        localImage: variantDoc?.localImage,
        noOfUnits: boxCrate.qty,
        parentSku: boxCrate.productSku,
        boxSku: boxCrate.boxSku,
        crateSku: boxCrate.type === "box" ? "" : boxCrate.crateSku,
        boxRef: boxCrate.type === "box" ? boxCrate._id : boxCrate.boxRef,
        crateRef: boxCrate.type === "box" ? "" : boxCrate._id,
        sku: boxCrate.type === "box" ? boxCrate.boxSku : boxCrate.crateSku,
      };

      return [
        {
          productRef: prod._id,
          name: prod.name,
          categoryRef: prod.categoryRef,
          batching: prod.enabledBatching,
          tax: prod.tax.percentage,
          taxRef: prod.taxRef,
          variant: boxCrateDoc,
          productVariants: prod.variants,
          hasMultipleVariants: prod.variants.length > 1,
          sku: boxCrateDoc.sku,
          company: prod.company,
          labelPrint: "1",
          expiryDate: undefined as any,
        },
      ];
    }
  }

  const transformedData: any[] = [];

  products?.[0]?.map((product: any) => {
    product.variants.forEach((variant: any) => {
      if (variant.unit !== "perItem") return;

      transformedData.push({
        productRef: product._id,
        name: product.name,
        categoryRef: product.categoryRef,
        batching: product.enabledBatching,
        tax: product.tax.percentage,
        taxRef: product.taxRef,
        variant: variant,
        productVariants: product.variants,
        hasMultipleVariants: product.variants.length > 1,
        sku: variant.sku,
        company: product?.company,
        labelPrint: "1",
        expiryDate: undefined as any,
      });
    });
  });

  return transformedData;
}

export default function ProductSelectInput({
  sheetRef,
  barcodeData,
  handleSelected,
}: {
  sheetRef: any;
  barcodeData: any;
  handleSelected: any;
}) {
  const theme = useTheme();
  const isRTL = checkDirection();
  const { hp } = useResponsive();

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [debouncedQuery] = useDebounce(query, 500);
  const [products, setProducts] = useState<any[]>([]);

  const getProducts = async () => {
    setLoading(true);

    try {
      fetchProductsAndBoxCrates(debouncedQuery).then((data) => {
        debugLog(
          "Products fetched from db",
          {},
          "barcode-print",
          "fetchProducts"
        );

        const filteredArray = data?.filter(
          (objOne) =>
            !barcodeData?.products?.some(
              (objTwo: any) => objTwo.variant.sku === objOne.variant.sku
            )
        );

        setProducts(filteredArray);
      });
    } catch (error: any) {
      errorLog(error?.message, {}, "barcode-print", "fetchProducts", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getItemLabel = (item: any) => {
    if (isRTL) {
      if (item.variant.type === "box") {
        return `${item.name.ar || ""} ${
          item.hasMultipleVariants ? item.variant.name.ar : ""
        } [${t("Box")} - ${item.variant.noOfUnits || 0} ${t(
          "Unit(s)"
        )}] - (SKU: ${item.variant.sku || "N/A"}) ${""}`;
      } else if (item.variant.type === "crate") {
        return `${item.name.ar || ""} ${
          item.hasMultipleVariants ? item.variant.name.ar : ""
        } [${t("Crate")} - ${item.variant.noOfUnits || 0} ${t(
          "Unit(s)"
        )}] - (SKU: ${item.variant.sku || "N/A"}) ${""}`;
      } else {
        return `${item.name.ar || ""} ${
          item.hasMultipleVariants ? item.variant.name.ar : ""
        } - (SKU: ${item.variant.sku || "N/A"}) ${""}`;
      }
    } else {
      if (item.variant.type === "box") {
        return `${item.name.en || ""} ${
          item.hasMultipleVariants ? item.variant.name.en : ""
        } [Box - ${item.variant.noOfUnits || 0} Unit(s)] - (SKU: ${
          item.variant.sku || "N/A"
        }) ${""}`;
      } else if (item.variant.type === "crate") {
        return `${item.name.en || ""} ${
          item.hasMultipleVariants ? item.variant.name.en : ""
        } [Crate - ${item.variant.noOfUnits || 0} Unit(s)] - (SKU: ${
          item.variant.sku || "N/A"
        }) ${""}`;
      } else {
        return `${item.name.en || ""} ${
          item.hasMultipleVariants ? item.variant.name.en : ""
        } - (SKU: ${item.variant.sku || "N/A"}) ${""}`;
      }
    }
  };

  useEffect(() => {
    getProducts();
  }, [barcodeData, debouncedQuery]);

  return (
    //@ts-ignore
    <RBSheet
      ref={sheetRef}
      closeOnDragDown={true}
      closeOnPressMask={true}
      animationType="fade"
      onClose={() => {
        setQuery("");
      }}
      customStyles={{
        container: {
          ...styles.card_view,
          minHeight: hp("75%"),
          backgroundColor: theme.colors.bgColor,
        },
        wrapper: {
          backgroundColor: theme.colors.transparentBg,
        },
      }}
    >
      <View>
        <DefaultText
          style={{ marginLeft: hp("2.25%") }}
          fontSize="2xl"
          fontWeight="medium"
        >
          {t("Products")}
        </DefaultText>

        <Spacer space={10} />

        <ItemDivider
          style={{
            margin: 0,
            borderWidth: 0,
            borderBottomWidth: 1,
            borderTop: 10,
          }}
        />

        <View
          style={{
            paddingTop: 20,
            paddingBottom: 5,
            paddingHorizontal: 26,
          }}
        >
          <DefaultText fontSize="lg" fontWeight="medium" color="otherGrey.100">
            {`${t("Note")}: ${t(
              "Boxes and crates can be listed only when you search for it"
            )}`}
          </DefaultText>
        </View>

        <Input
          leftIcon={
            <ICONS.SearchIcon
              color={
                query?.length > 0
                  ? theme.colors.primary[1000]
                  : theme.colors.dark[600]
              }
            />
          }
          placeholderText={t("Search products with name or SKU")}
          values={query}
          allowClear={query !== ""}
          handleChange={(val: string) => setQuery(val)}
          containerStyle={{
            height: hp("7%"),
            marginTop: hp("2%"),
            borderRadius: 10,
            marginHorizontal: hp("2.25%"),
            backgroundColor: theme.colors.bgColor2,
          }}
          style={{
            ...styles.textInput,
            color: theme.colors.text.primary,
          }}
        />

        {loading ? (
          <Loader marginTop={hp("15%")} />
        ) : (
          <FlatList
            style={{ marginTop: 5, minHeight: hp("60%") }}
            alwaysBounceVertical={false}
            showsVerticalScrollIndicator={false}
            data={products}
            renderItem={({ item, index }) => {
              return (
                <TouchableOpacity
                  key={index}
                  style={{
                    ...styles.item_row,
                    borderBottomWidth: 1,
                    borderStyle: "dashed",
                    borderColor: theme.colors.dividerColor.main,
                    backgroundColor: theme.colors.bgColor,
                  }}
                  onPress={() => {
                    handleSelected(item);
                    Keyboard.dismiss();
                  }}
                >
                  <DefaultText fontWeight="normal" color="text.primary">
                    {getItemLabel(item)}
                  </DefaultText>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={() => {
              return (
                <View style={{ marginHorizontal: 16 }}>
                  <NoDataPlaceholder
                    title={t("No Data!")}
                    marginTop={hp("10%")}
                  />
                </View>
              );
            }}
            ListFooterComponent={() => <Spacer space={hp("25%")} />}
          />
        )}
      </View>
    </RBSheet>
  );
}

const styles = StyleSheet.create({
  card_view: {
    elevation: 100,
    marginTop: "3%",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  textInput: {
    flex: 0.99,
    marginRight: -16,
  },
  item_row: {
    paddingVertical: 18,
    paddingHorizontal: 26,
    flexDirection: "row",
    alignItems: "center",
  },
});
