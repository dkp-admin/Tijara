import ArrowLeftIcon from "@untitled-ui/icons-react/build/esm/ArrowLeft";
import ArrowRightIcon from "@untitled-ui/icons-react/build/esm/ArrowRight";
import ChevronLeftIcon from "@untitled-ui/icons-react/build/esm/ChevronLeft";
import ChevronRightIcon from "@untitled-ui/icons-react/build/esm/ChevronRight";

export const TransformedArrowIcon = ({ name }: { name: string }) => {
  const lng = localStorage.getItem("currentLanguage");
  const isRtl = lng === "ar" || lng === "ur";

  const Icons: any = {
    "arrow-right": () => (isRtl ? <ArrowLeftIcon /> : <ArrowRightIcon />),
    "chevron-right": () => (isRtl ? <ChevronLeftIcon /> : <ChevronRightIcon />),
  };
  const Icon = Icons[name];

  return <Icon />;
};
