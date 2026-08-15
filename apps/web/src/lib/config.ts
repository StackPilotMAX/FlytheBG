export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME?.trim() || "FlytheBG",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000",
  uploadMaxMb: Number(process.env.UPLOAD_MAX_MB || "12"),
};

export const companyConfig = {
  legalName: process.env.COMPANY_LEGAL_NAME?.trim() || "",
  tradingName: process.env.COMPANY_TRADING_NAME?.trim() || "FlytheBG",
  registrationNumber: process.env.COMPANY_REGISTRATION_NUMBER?.trim() || "",
  registeredAddress: process.env.COMPANY_REGISTERED_ADDRESS?.trim() || "",
  country: process.env.COMPANY_COUNTRY?.trim() || "",
  contactEmail: process.env.CONTACT_EMAIL?.trim() || "",
  legalEmail: process.env.LEGAL_EMAIL?.trim() || process.env.CONTACT_EMAIL?.trim() || "",
};

export function legalIdentityReady() {
  return Boolean(companyConfig.legalName && companyConfig.country && companyConfig.contactEmail);
}
