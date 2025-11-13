import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useInfiniteQuery, useQueryClient } from "react-query";
import { useResponsive } from "../../hooks/use-responsiveness";
import { rowsPerPage } from "../../utils/constants";
import SeparatorVerticalView from "../common/separator-vertical-view";
import Loader from "../loader";
import ProductList from "../products/products-list";
import CollectionList from "./collection-list";
import repository from "../../db/repository";

const fetchCollections = async (
  searchText?: string,
  pageParam?: number,
  collectionsRepository?: any
) => {
  const query: any = {
    _q: searchText,
    page: pageParam,
    limit: rowsPerPage,
  };

  const [collections, totalCount] =
    await repository.collectionRepository.findAndCount({
      ...query,
    });

  return { collections, totalCount };
};

const Collections = ({ query }: any) => {
  const { hp, twoPaneView } = useResponsive();
  const queryClient = useQueryClient();

  const [selectedCollection, setSelectedCollection] = useState(null);

  const { data, hasNextPage, fetchNextPage, isLoading, isFetchingNextPage } =
    useInfiniteQuery(
      [`find-collection`, query],
      async ({ pageParam = 1 }) => {
        return fetchCollections(query, pageParam);
      },
      {
        getNextPageParam: (lastPage: any, allPages: any) => {
          const totalRows = allPages?.reduce((pv: number, cv: any) => {
            return pv + cv?.collections?.length || 0;
          }, 0);

          if (lastPage?.totalCount > totalRows) {
            return totalRows / rowsPerPage + 1;
          }
        },
      }
    );

  const collections: any = useMemo(() => {
    if (data) {
      return data?.pages?.flatMap((page) => page?.collections);
    }

    return [];
  }, [data]);

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  // useEffect(() => {
  //   if (collections?.length > 0) {
  //     if (orientation == 1 || orientation == 2) {
  //       setSelectedCollection(null);
  //     } else {
  //       // setSelectedCollection(collections[0]._id);
  //     }
  //   } else {
  //     setSelectedCollection(null);
  //   }
  // }, [orientation, collections]);

  useEffect(() => {
    return () => {
      queryClient.removeQueries(`find-collection`);
    };
  }, []);

  if (isLoading && !query) {
    return <Loader marginTop={hp("30%")} />;
  }

  return (
    <View style={{ ...styles.container }}>
      <View
        style={{
          flex: collections?.length > 0 && twoPaneView ? 0.3 : 1,
        }}
      >
        <CollectionList
          loadMore={loadMore}
          collectionsList={collections}
          selectedCollection={selectedCollection}
          setSelectedCollection={setSelectedCollection}
          isFetchingNextPage={isFetchingNextPage}
        />
      </View>

      <SeparatorVerticalView />

      {selectedCollection && collections?.length > 0 && twoPaneView && (
        <View style={{ flex: 0.7 }}>
          <ProductList
          // isFromCollection={true}
          // collectionId={selectedCollection}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
});

export default Collections;
