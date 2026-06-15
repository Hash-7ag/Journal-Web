export const formatPhone = (value) => {
  // rəqəmləri saxlayırıq
  const digits = value.replace(/\D/g, '');

  // Əgər istifadəçi özü 994 yazıbsa silirik
  const local = digits.startsWith('994') ? digits.slice(3) : digits;

  // max 9 rəqəm
  const cut = local.slice(0, 9);
  return cut ? `+994${cut}` : '+994';
};

export const phoneToRaw = (value) => {
  // Bekendə atmaq üçün təmiz nömrəni göndəririk
  return value.replace(/\s/g, '');
};
