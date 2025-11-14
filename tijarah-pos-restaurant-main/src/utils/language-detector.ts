const isArabicText = (text: any) => {
  const arabicPattern =
    /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
  const isArabic = arabicPattern.test(text);

  return isArabic;
};

export default isArabicText;
