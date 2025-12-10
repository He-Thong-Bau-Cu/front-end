export function isValidPhone(phone: string): boolean {
  const regex = /^(0?)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-5]|9[0-9])\d{7}$/;
  return regex.test(phone);
}

export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function isValidateCitizenId(id: string): boolean {
  if (!id) throw new Error("Citizen ID không được để trống");

  const trimmed = id.trim();

  if (!/^[0-9]+$/.test(trimmed)) {
    throw new Error("Citizen ID chỉ được chứa số");
  }

  if (trimmed.length !== 9 && trimmed.length !== 12) {
    throw new Error("Citizen ID phải có 9 số (CMND) hoặc 12 số (CCCD)");
  }

  return true;
}
