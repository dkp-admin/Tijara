import { Card, CardContent, CardHeader, IconButton } from "@mui/material";
import { red } from "@mui/material/colors";
import Trash02 from "@untitled-ui/icons-react/build/esm/Trash02";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import ProductDNDCard from "./product-dnd-card";

const reorder = (list: any, startIndex: any, endIndex: any) => {
  const result = Array.from(list);

  const [removed] = result.splice(startIndex, 1);

  result.splice(endIndex, 0, removed);

  return result;
};

const CategoryDNDCard = ({
  item,
  formik,
  index,
}: {
  item: any;
  formik: any;
  index: number;
}) => {
  const onDragEnd = (result: any) => {
    if (!result.destination) {
      return;
    }

    const newItems = reorder(
      formik.values.products,
      result.source.index,
      result.destination.index
    ) as any;

    formik.values.products = newItems;

    const IdsAndPos = formik.values.products.map((d: any, idx: number) => {
      const obj = { _id: d._id, ...d, sortOrder: idx };
      return obj;
    });

    formik.values.products = IdsAndPos;
  };

  return (
    <Card key={item._id} sx={{ mt: 3, p: 0 }}>
      <CardHeader
        sx={{ p: 2 }}
        title={item?.name?.en}
        action={
          <IconButton
            color="default"
            onClick={() => {
              const menuData = formik.values.categories;

              const categoryRef = formik.values.categories[index]?.categoryRef;

              const filterProds = formik?.values.products?.filter(
                (op: any) => op?.categoryRef !== categoryRef
              );

              menuData.splice(index, 1);

              formik.setFieldValue("categories", menuData);

              formik.setFieldValue("products", filterProds);
            }}
            aria-label="delete"
          >
            <Trash02 />
          </IconButton>
        }
      />

      <CardContent sx={{ p: 1, pb: "16px!important", pt: 0 }}>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="droppable">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {formik.values?.products?.map((items: any, idx: number) => {
                  if (items?.categoryRef === item?.categoryRef)
                    return (
                      <ProductDNDCard
                        categoryIndex={index}
                        remove={() => {
                          const array = formik.values.products;

                          array.splice(idx, 1);

                          formik.setFieldValue("products", [...array]);
                        }}
                        item={items}
                        index={idx}
                        key={idx}
                        formik={formik}
                      />
                    );
                })}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  );
};

export default CategoryDNDCard;
