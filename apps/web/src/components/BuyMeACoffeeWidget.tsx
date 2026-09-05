"use client";

import Script from "next/script";

export function BuyMeACoffeeWidget() {
  return (
    <Script
      id="bmc-widget"
      src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
      strategy="afterInteractive"
      data-name="BMC-Widget"
      data-cfasync="false"
      data-id="flythebg"
      data-description="Support me on Buy me a coffee!"
      data-message="Thank you for visiting. You can now buy me a bookkk."
      data-color="#BD5FFF"
      data-position="Right"
      data-x_margin="18"
      data-y_margin="18"
    />
  );
}
