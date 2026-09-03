const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://flythebg.com";
const configuredContactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "";

export const appConfig = {
  name: process.env.NEXT_PUBLIC_APP_NAME?.trim() || "FlyThe BG",
  siteUrl: configuredSiteUrl.replace(/\/+$/, ""),
  domain: "flythebg.com",
  uploadMaxMb: Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_MB || "12"),
  contactEmail: configuredContactEmail,
};

export const companyConfig = {
  legalName: "",
  tradingName: "FlyThe BG",
  registrationNumber: "",
  registeredAddress: "",
  country: "",
  contactEmail: appConfig.contactEmail,
  legalEmail: appConfig.contactEmail,
};

export function legalIdentityReady() {
  return false;
}
