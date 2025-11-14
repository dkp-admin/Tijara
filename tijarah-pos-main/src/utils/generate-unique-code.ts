export default function generateUniqueCode(length: number) {
  const characters = "ABC0DE1FGH2IJ3KLM4NO5PQR6ST7UVW8XYZ9";
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}
