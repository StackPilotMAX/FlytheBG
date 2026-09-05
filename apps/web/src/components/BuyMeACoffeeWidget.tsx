import Script from "next/script";

const BMC_URL = "https://www.buymeacoffee.com/flythebg";

export function BuyMeACoffeeWidget() {
  return (
    <>
      <Script
        id="bmc-widget"
        src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
        strategy="afterInteractive"
        data-name="BMC-Widget"
        data-cfasync="false"
        data-id="flythebg"
        data-description="Support me on Buy me a coffee!"
        data-message="Thank you for visiting. You can now buy me a book."
        data-color="#FF5F5F"
        data-position="Right"
        data-x_margin="18"
        data-y_margin="18"
      />
      <a href={BMC_URL} target="_blank" rel="noopener noreferrer" aria-label="Donate to FlyTheBG on Buy Me a Coffee" className="bmcFloatingDonate">
        <span aria-hidden="true">📖</span><span>Buy Me a Book</span><span aria-hidden="true">↗</span>
      </a>
      <style jsx>{`
        .bmcFloatingDonate{position:fixed;right:18px;bottom:18px;z-index:2147483000;display:inline-flex;align-items:center;gap:7px;min-height:44px;padding:0 14px;border:1px solid rgba(255,95,95,.75);border-radius:999px;background:#ff5f5f;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.22);font:800 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;text-decoration:none;transition:transform .18s ease,box-shadow .18s ease}.bmcFloatingDonate:hover,.bmcFloatingDonate:focus-visible{transform:translateY(-2px);box-shadow:0 14px 34px rgba(0,0,0,.28);outline:none}@media(max-width:600px){.bmcFloatingDonate{right:12px;bottom:12px;min-height:42px;padding:0 12px}}
      `}</style>
    </>
  );
}
