import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import RelationHeader from "./relation-header";
import RelationRow from "./relation-row";
import { useTheme } from "../../../context/theme-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import NoDataPlaceholder from "../../no-data-placeholder/no-data-placeholder";
import { t } from "../../../../i18n";
import repository from "../../../db/repository";

async function fetchBoxesCrates(product: any) {
  return repository.boxCratesRepository.findByProduct(product._id);
}

export default function RelationList({ product }: { product: any }) {
  const theme = useTheme();
  const { hp } = useResponsive();

  const [boxCrateList, setBoxCrateList] = useState<any[]>([]);

  const renderRelationRow = useCallback(
    ({ item, index }: any) => {
      return <RelationRow key={index} data={item} product={product} />;
    },
    [product, boxCrateList]
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
      const boxesCrates: any = await fetchBoxesCrates(product);
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
