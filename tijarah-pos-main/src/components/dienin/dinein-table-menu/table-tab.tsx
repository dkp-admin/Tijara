import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FlatList, View } from "react-native";
import { useInfiniteQuery } from "react-query";
import { ILike } from "typeorm";
import { t } from "../../../../i18n";
import AuthContext from "../../../context/auth-context";
import { useResponsive } from "../../../hooks/use-responsiveness";
import { AuthType } from "../../../types/auth-types";
import { rowsPerPage } from "../../../utils/constants";
import { repo } from "../../../utils/createDatabaseConnection";
import { debugLog } from "../../../utils/log-patch";
import EmptyOrLoaderComponent from "../../empty";
import Loader from "../../loader";
import FloorMenuOptions from "./table/floor-menu-options";
import SectionTabButton from "./table/section-tab-button";
import TableRow from "./table/table-row";
import MMKVDB from "../../../utils/DB-MMKV";

export default function TableTab() {
  const { hp, twoPaneView } = useResponsive();
  const authContext = useContext<AuthType>(AuthContext);

  const [floor, setFloor] = useState("floor0");
  const [section, setSection] = useState("all");
  const [sectionList, setSectionList] = useState([
    { _id: "all", name: { en: "All", ar: "الجميع" } },
  ]);

  const { data, isLoading } = useInfiniteQuery(
    [`find-section-tables`, authContext, floor],
    async ({ pageParam = 1 }) => {
      let dbQuery = {} as any;

      // if (section !== "all") {
      //   dbQuery["_id"] = section;
      // }

      if (floor !== "") {
        dbQuery["floorType"] = ILike(`%${floor}%`);
      }

      dbQuery["status"] = "active";

      debugLog(
        "Section tables fetched from db",
        {},
        "section-tables-screen",
        "fetchSectionTables"
      );

      return repo.sectionTables.findAndCount({
        take: rowsPerPage,
        skip: rowsPerPage * (pageParam - 1),
        where: dbQuery,
      });
    }
  );

  const tablesList = useMemo(() => {
    if (data?.pages) {
      let tables: any[] = [];
      const sectionList = [];

      if (section === "all") {
        tables = data?.pages[0][0].flatMap((op) => op.tables);
      } else
        tables = data?.pages[0][0]?.flatMap((op) => {
          if (op?._id === section) {
            return op.tables;
          }
        });

      tables = tables.filter((op) => {
        if (op && op.status !== "inactive" && op?.status !== "false") {
          return op;
        }
      });

      data?.pages[0][0]?.map((section) =>
        sectionList.push({ _id: section._id, name: section.name })
      );

      if (data?.pages[0][0]?.length > 1) {
        sectionList.push({ _id: "all", name: { en: "All", ar: "الجميع" } });
      }

      setSectionList(sectionList);

      return tables || [];
    } else {
      setSectionList([{ _id: "all", name: { en: "All", ar: "الجميع" } }]);
      return [];
    }
  }, [data?.pages, section]);

  useEffect(() => {
    setSection("all");
  }, [floor]);

  useEffect(() => {
    MMKVDB.set("activeTableDineIn", null);
  }, []);

  const floorMenuOptions = useMemo(() => {
    return (
      <FloorMenuOptions
        data={data}
        floor={floor}
        handleFloor={(floor: string) => setFloor(floor)}
      />
    );
  }, [floor, data]);

  const sectionTabButton = useMemo(() => {
    return (
      <SectionTabButton
        data={data}
        currentTab={section}
        sectionOptions={sectionList}
        handleCurrentTab={(sectionId: string) => setSection(sectionId)}
      />
    );
  }, [section, sectionList]);

  const renderTables = useCallback(({ item }: any) => {
    return <TableRow data={item} />;
  }, []);

  const listEmptyComponent = useMemo(() => {
    return (
      <EmptyOrLoaderComponent
        isEmpty={tablesList.length === 0}
        title={t("No Tables!")}
        showBtn={false}
        btnTitle={""}
        handleOnPress={() => {}}
      />
    );
  }, []);

  const footerComponent = useMemo(
    () => <View style={{ height: hp("8%") }}></View>,
    []
  );

  return (
    <View
      style={{
        flex: 1,
        height: "100%",
        paddingHorizontal: hp("2%"),
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {floorMenuOptions}
        {sectionList?.length > 1 && sectionTabButton}
      </View>

      {isLoading ? (
        <Loader marginTop={hp("30%")} />
      ) : (
        <FlatList
          contentContainerStyle={{ paddingVertical: hp("2%") }}
          keyExtractor={(_, index) => index.toString()}
          onEndReached={() => {}}
          onEndReachedThreshold={0.01}
          numColumns={twoPaneView ? 4 : 2}
          bounces={false}
          alwaysBounceVertical={false}
          showsVerticalScrollIndicator={false}
          data={tablesList}
          renderItem={renderTables}
          ListEmptyComponent={listEmptyComponent}
          ListFooterComponent={footerComponent}
        />
      )}
    </View>
  );
}
