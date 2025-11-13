import React from "react";
import DefaultText from "./Text";

export default function ErrorText({
  errors,
  title,
}: {
  errors: Boolean;
  title?: string;
}) {
  return (
    <>
      {errors && (
        <DefaultText
          style={{ marginLeft: 12, marginTop: 5 }}
          color="red.default"
          fontSize="md"
        >
          {title}
        </DefaultText>
      )}
    </>
  );
}
