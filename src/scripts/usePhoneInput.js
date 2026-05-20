export const formatPhone = (value) => {
  // rəqəmləri saxlayırıq
  const digits = value.replace(/\D/g, "");

  // Əgər istifadəçi özü 994 yazıbsa silirik
  const local = digits.startsWith("994") ? digits.slice(3) : digits;

  // max 9 rəqəm
  const cut = local.slice(0, 9);

  // format: XX XXX XX XX
  let formatted = "";
  if (cut.length > 0) formatted += cut.slice(0, 2);
  if (cut.length > 2) formatted += " " + cut.slice(2, 5);
  if (cut.length > 5) formatted += " " + cut.slice(5, 7);
  if (cut.length > 7) formatted += " " + cut.slice(7, 9);

  return formatted ? `+994 ${formatted}` : "+994 ";
};

export const phoneToRaw = (value) => {
  // Bekendə atmaq üçün təmiz nömrəni göndəririk
  return value.replace(/\s/g, "");
};
