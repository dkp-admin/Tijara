export const trimText = (text: string, length: number) => {
  if (text?.length > length) return text?.substr(0, length) + "...";
  else return text;
};
