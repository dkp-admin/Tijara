import React from "react";
import { View } from "react-native";
import TableTab from "./dinein-table-menu/table-tab";

export default function DineinTableMenu() {
  return (
    <>
      <View style={{ flex: 1, height: "100%" }}>
        <TableTab />
      </View>
    </>
  );
}
