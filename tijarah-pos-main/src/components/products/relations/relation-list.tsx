import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { repo } from "../../../utils/createDatabaseConnection";
import RelationHeader from "./relation-header";
import RelationRow from "./relation-row";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import { t } from "../../../../i18n";

async function fetchBoxesCrates(product: any) {
  const queryBuilder = repo.boxCrates
    .createQueryBuilder("box-crates")
    .where("box-crates.product LIKE :productId", {
      product: "productRef",
      productId: `%${product._id}%`,
    });

  return queryBuilder.getMany();
}

export default function RelationList({ product }: { product: any }) {
  const theme = useTheme();
  const { hp } = useResponsive();

  const [boxCrateList, setBoxCrateList] = useState<any[]>([]);

  const renderRelationRow = useCallback(
    ({ item, index }: any) => {
      return <RelationRow key={index} data={item} product={product} />;
    },
    [product]
  );

  const listEmptyComponent = useMemo(() => {
    return (
      <View
        style={{
          paddingBottom: hp("6%"),
          backgroundColor: theme.colors.white[1000],
        }}
      >
        <NoDataPlaceholder title={t("No Relations!")} marginTop={hp("6%")} />
      </View>
    );
  }, []);

  useEffect(() => {
    (async () => {
      const boxesCrates = await fetchBoxesCrates(product);
      setBoxCrateList(boxesCrates || []);
    })();
  }, [product]);

  return (
    <View style={{ ...styles.container }}>
      <RelationHeader />

      <FlatList
        scrollEnabled={false}
        alwaysBounceVertical={false}
        showsVerticalScrollIndicator={false}
        data={boxCrateList}
        renderItem={renderRelationRow}
        ListEmptyComponent={listEmptyComponent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
