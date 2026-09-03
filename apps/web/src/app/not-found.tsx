import { FlytheBGLogo } from "@/components/FlytheBGLogo";

export default function NotFound() {
  return (
    <main className="fly404">
      <video className="fly404Video" autoPlay loop muted playsInline aria-hidden="true">
        <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260801_001207_ec20d138-aa45-4b2b-ab8c-bdc71607f240.mp4" type="video/mp4" />
      </video>
      <div className="fly404Logo" aria-label="FlyThe BG"><FlytheBGLogo size={40} /></div>
      <div className="fly404Content"><h1>404</h1><div className="fly404Rule" /><p>The path may be broken, but the journey isn&apos;t. Let&apos;s get you back.</p></div>
      <style>{`@font-face{font-family:"Geist Mono:SemiBold";font-style:normal;font-weight:600;font-display:swap;src:url("https://static.figma.com/font/GeistMono_wght__1") format("woff2")} .fly404{min-height:100svh;position:relative;overflow:hidden;background:#000;color:#fff;display:grid;place-items:center;font-family:"Geist Mono:SemiBold",ui-monospace,monospace}.fly404Video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:1;z-index:0}.fly404Logo{position:absolute;top:80px;left:50%;transform:translateX(-50%);width:233px;height:40px;display:flex;align-items:center;justify-content:center;z-index:1;filter:brightness(0) invert(1)}.fly404Content{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:483px;display:flex;flex-direction:column;align-items:center;text-align:center;gap:44px;z-index:1}.fly404Content h1{font:600 295.751px/1.1 "Geist Mono:SemiBold",ui-monospace,monospace;letter-spacing:-24.6459px;margin:0;padding:0 0 .12em;background:linear-gradient(247.3282658084845deg,rgb(255,255,255) 2.5334%,rgba(255,255,255,.4) 93.612%);-webkit-background-clip:text;background-clip:text;color:transparent}.fly404Rule{width:425px;height:1px;background:#fff;flex:none}.fly404Content p{width:100%;margin:0;color:#fff;font:600 24px/1.1 "Geist Mono:SemiBold",ui-monospace,monospace;letter-spacing:-2px}@media(max-width:640px){.fly404Logo{top:32px;transform:translateX(-50%) scale(.75)}.fly404Content{width:min(calc(100% - 40px),360px);gap:28px}.fly404Content h1{font-size:clamp(140px,52vw,200px);letter-spacing:-.09em;line-height:1.05;height:auto;min-height:0;padding-bottom:.12em}.fly404Rule{width:100%}.fly404Content p{font-size:clamp(16px,4.5vw,20px);letter-spacing:-1.3px}}`}</style>
    </main>
  );
}
