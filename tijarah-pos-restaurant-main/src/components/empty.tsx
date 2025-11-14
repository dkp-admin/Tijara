import { View } from "react-native";
import { t } from "../../i18n";
import { useResponsive } from "../hooks/use-responsiveness";
import FooterComponent from "./footer";
import NoDataPlaceholder from "./no-data-placeholder/no-data-placeholder";

const EmptyOrLoaderComponent = ({
  handleOnPress,
  title,
  btnTitle,
  showBtn = false,
  isFetchingNextPage,
  isEmpty,
}: {
  handleOnPress: () => void;
  title: string;
  btnTitle: string;
  showBtn?: boolean;
  isFetchingNextPage?: boolean;
  isEmpty: boolean;
}) => {
  const { hp } = useResponsive();
  if (isFetchingNextPage)
    return <FooterComponent isFetchingNextPage={isFetchingNextPage} />;
  if (!isEmpty) return <></>;
  return (
    <View style={{ marginHorizontal: 16 }}>
      <NoDataPlaceholder
        title={title}
        marginTop={hp("25%")}
        showBtn={showBtn}
        btnTitle={btnTitle}
        handleOnPress={handleOnPress}
      />
    </View>
  );
};

export default EmptyOrLoaderComponent;
