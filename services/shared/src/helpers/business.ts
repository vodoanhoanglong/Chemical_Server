export function parsePhoneNumber(phoneNumber: string) {
  return phoneNumber.startsWith("0") ? `+84${phoneNumber.substring(1)}` : phoneNumber;
}

export function convertCurrencyToVND(value: number | string, replace = "Đồng") {
  return typeof value === "number"
    ? value.toLocaleString("it-IT", { style: "currency", currency: "VND" }).replace("VND", replace)
    : parseInt(value).toLocaleString("it-IT", { style: "currency", currency: "VND" }).replace("VND", replace);
}
