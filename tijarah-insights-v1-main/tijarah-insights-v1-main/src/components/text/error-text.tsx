import DefaultText, { getOriginalSize } from "./Text";

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
          style={{
            marginLeft: getOriginalSize(12),
            marginTop: getOriginalSize(5),
          }}
          color="red.default"
          fontSize="md"
        >
          {title}
        </DefaultText>
      )}
    </>
  );
}
