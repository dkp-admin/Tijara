export default function generateUniqueCode(length: number) {
  const characters = "ABC1DE2FGH3J4KM5NPQ6RST7UVW8XYZ9";
  let code = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }

  return code;
}
