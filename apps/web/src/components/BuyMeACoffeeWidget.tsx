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
      data-description="Support FlyTheBG on Buy Me a Coffee"
      data-message="Thanks for supporting FlyTheBG."
      data-color="#FF5F5F"
      data-position="Right"
      data-x_margin="18"
      data-y_margin="18"
    />
  );
}
