import i18n from "../../i18n";

const handleKeyDown = (
  timeoutId: any,
  entities: any,
  context: any,
  keyEvent: any,
  queryRef: any,
  handleProduct: any,
  showToast: any
) => {
  console.log("key", keyEvent.pressedKey);

  clearTimeout(timeoutId); // Clear any previous timeout
  queryRef.current.queryText += keyEvent.pressedKey?.toString();
  // Delay the state update and clearing the query text
  timeoutId = setTimeout(async () => {
    let prod = entities?.find(
      (prod: any) =>
        prod.variants.findIndex(
          (variant: any) =>
            variant.sku === queryRef.current.queryText &&
            variant.locationRefs?.includes(context?.user?.locationRef)
        ) !== -1
    );
    if (prod) {
      const variant: any = prod?.variants?.find(
        (prod: any) => prod.sku === queryRef.current.queryText
      );
      prod.variants = [variant];
      handleProduct(prod);
    } else if (queryRef.current.queryText != undefined) {
      showToast("error", i18n.t("Product Not Found"), "");
    }
    queryRef.current.queryText = ""; // Empty the query text
  }, 500); // Adjust the delay time (in milliseconds) as needed
};
export default handleKeyDown;
