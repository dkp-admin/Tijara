import { EventRegister } from "react-native-event-listeners";
import serviceCaller from "../../../api";
import endpoint from "../../../api/endpoints";
import logToAxiom from "../../../utils/log-to-axiom";
import EntityNames from "../../../types/entity-name";

const handleActions = async (values: any, res: any) => {
  logToAxiom({
    context: "handleActions",
    message: `Actions: ${JSON.stringify(values.actions)}`,
    type: "info",
  });

  if (!values.actions?.length) {
    logToAxiom({
      context: "handleActions",
      message: "No actions to process",
      type: "info",
    });
    return;
  }

  console.log("Actions----Unoreverese",JSON.stringify(values.actions))
  let actions = values.actions
  if(actions.length>0){
    actions = actions.filter((ac:any) => ac.previousStockCount !== 0)
  }

  const promises = actions.map(async (action: any, index: any) => {

    try {
      const actionData = {
        productRef: action.productRef || res._id,
        product: action.product || { name: res.name },
        categoryRef: values.category.key,
        category: { name: values.category.value },
        companyRef: action.companyRef,
        company: action.company,
        locationRef: action.locationRef,
        location: action.location,
        variant: action.variant,
        hasMultipleVariants: action.hasMultipleVariants,
        sku: action.sku,
        batching: action.batching,
        action: action.action,
        expiry: action.expiry,
        ...(action.vendorRef && {
          vendorRef: action.vendorRef,
          vendor: action.vendor,
        }),
        price: Number(action.price),
        count: Number(action.count),
        sourceRef: action.sourceRef,
        destRef: action.destRef,
        available: action.available,
        received: action.received,
        transfer: action.transfer,
        availableSource: action.availableSource,
        receivedSource: action.receivedSource,
        transferSource: action.transferSource,
        previousStockCount: action.previousStockCount,
        createdAt: new Date().toISOString() as any,
        updatedAt: new Date().toISOString() as any,
      };

   

      logToAxiom({
        context: "handleActions",
        message: `Processing action ${index + 1}: ${JSON.stringify(
          actionData
        )}`,
        type: "info",
      });

      const response = await serviceCaller(endpoint.stockHistoryCreate.path, {
        method: endpoint.stockHistoryCreate.method,
        body: actionData,
      });

      logToAxiom({
        context: "handleActions",
        message: `Action ${index + 1} response: ${JSON.stringify(response)}`,
        type: "info",
      });

      return response;
    } catch (error: any) {
      logToAxiom({
        context: "handleActions",
        message: `Error processing action ${index + 1}: ${error.message}`,
        type: "error",
      });
      throw error; // Re-throw to be caught by Promise.all
    }
  });

  try {
    const responses = await Promise.all(promises);

    logToAxiom({
      context: "handleActions",
      message: `All actions processed successfully`,
      type: "info",
    });

    if (responses.length > 0) {
      EventRegister.emit("sync:enqueue", {
        entityName: EntityNames.BatchPull,
      });

      EventRegister.emit("sync:enqueue", {
        entityName: EntityNames.StockHistoryPull,
      });

      logToAxiom({
        context: "handleActions",
        message: "Sync events emitted for BatchPull and StockHistoryPull",
        type: "info",
      });
    }

    return responses;
  } catch (error: any) {
    logToAxiom({
      context: "handleActions",
      message: `Error handling actions: ${error.message}`,
      type: "error",
    });
    throw new Error(`Failed to process one or more actions: ${error.message}`);
  }
};

export default handleActions;
