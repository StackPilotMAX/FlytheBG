// Adapted from https://github.com/ishara-madu/gemini-watermark-remover (MIT).
// The original project embeds Gemini sparkle reference imagery and uses
// template correlation + alpha-map reverse blending. Ad/Monetag/controller
// code from the original site is intentionally not included.

type Size = { size: number; x: number; y: number; width: number; height: number };
export type Detection = Size & { score: number; matchFound: boolean; gain: number };
export type WatermarkPosition = { x: number; y: number; width: number; height: number };
export type WatermarkEngine = {
  getWatermarkInfo: (width: number, height: number) => { size: number; position: WatermarkPosition };
  getAlphaMap: (size: number) => Promise<Float32Array>;
  removeWatermarkFromImage: (canvas: HTMLCanvasElement) => Promise<HTMLCanvasElement>;
};

const ALPHA_THRESHOLD = 0.002;
const MAX_ALPHA = 0.99;
const LOGO_VALUE = 255;

// Original project's embedded 48x48 Gemini sparkle reference.
const BG_48 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAIAAADYYG7QAAAGVElEQVR4nMVYvXIbNxD+FvKMWInXmd2dK7MTO7sj9QKWS7qy/Ab2o/gNmCp0JyZ9dHaldJcqTHfnSSF1R7kwlYmwKRYA93BHmkrseMcjgzgA++HbH2BBxhhmBiB/RYgo+hkGSFv/ZOY3b94w89u3b6HEL8JEYCYATCAi2JYiQ8xMDADGWsvMbfVagm6ZLxKGPXr0qN/vJ0mSpqn0RzuU//Wu9MoyPqxmtqmXJYwxxpiAQzBF4x8/fiyN4XDYoZLA5LfEhtg0+glMIGZY6wABMMbs4CaiR8brkYIDwGg00uuEMUTQ1MYqPBRRYZjZ+q42nxEsaYiV5VOapkmSSLvX62VZprUyM0DiQACIGLCAESIAEINAAAEOcQdD4a+2FJqmhDd/YEVkMpmEtrU2igCocNHW13swRBQYcl0enxbHpzEhKo0xSZJEgBICiCGu49YnSUJOiLGJcG2ydmdwnRcvXuwwlpYkSabTaZS1vyimc7R2Se16z58/f/jw4Z5LA8iy7NmzZ8J76CQ25F2UGsEAJjxo5194q0fn9unp6fHx8f5oRCQ1nJ+fbxtA3HAjAmCMCaGuAQWgh4eH0+k0y7LGvPiU3CVXV1fz+by+WQkCJYaImKzL6SEN6uMpjBVMg8FgOp3GfnNPQADqup79MLv59AlWn75E/vAlf20ibmWg0Pn06dPJZNLr9e6nfLu8//Ahv/gFAEdcWEsgZnYpR3uM9KRpOplMGmb6SlLX9Ww2q29WyjH8+SI+pD0GQJIkJycn/8J/I4mWjaQoijzPb25uJJsjmAwqprIsG4/HbVZ2L/1fpCiKoijKqgTRBlCWZcPhcDQafUVfuZfUdb1cLpfL5cePf9Lr16/3zLz/g9T1quNy+F2FiYjSNB0Oh8Ph8HtRtV6vi6JYLpdVVbmb8t3dnSAbjUbRNfmbSlmWeZ6XHytEUQafEo0xR0dHUdjvG2X3Sd/Fb0We56t6BX8l2mTq6BCVnqOjo7Ozs29hRGGlqqrOr40CIKqeiGg8Hn/xcri/rG/XeZ7/evnrjjGbC3V05YC/BSRJ8urVq36/3zX7Hjaq63o+n19fX/upUqe5VxFok7UBtQ+T6XQ6GAz2Vd6Ssizn8/nt7a3ay1ZAYbMN520XkKenpx0B2E2SLOo+FEWxWPwMgMnC3/adejZMYLLS42r7oH4LGodpsVgURdHQuIcURbFYLDYlVKg9sCk5wpWNiHym9pUAEQGG6EAqSxhilRQWi0VZVmrz23yI5cPV1dX5TwsmWGYrb2TW36OJGjdXhryKxEeHvjR2Fgzz+bu6XnVgaHEmXhytEK0W1aUADJPjAL6CtPZv5rsGSvUKtv7r8/zdj+v1uoOUpsxms7qunT6+g1/TvTQCxE6XR2kBqxjyZo6K66gsAXB1fZ3neQdJSvI8X61WpNaMWCFuKNrkGuGGmMm95fhpvPkn/f6lAgAuLy/LstyGpq7r9+8d4rAr443qaln/ehHt1siv3dvt2B/RDpJms5lGE62gEy9az0XGcQCK3DL4DTPr0pPZEjPAZVlusoCSoihWqzpCHy7ODRXhbUTJly9oDr4fKDaV9NZJUrszPOjsI0a/FzfwNt4eHH+BSyICqK7rqqo0u0VRrFYridyN87L3pBYf7qvq3wqc3DMldJmiK06pgi8uLqQjAAorRG+p+zLUxks+z7rOkOzlIUy8yrAcQFVV3a4/ywBPmJsVMcTM3l/h9xDlLga4I1PDGaD7UNBPuCKBleUfy2gd+DOrPWubGHJJyD+L+LCTjEXEgH//2uSxhu1/Xzocy+VSL+2cUhrqLVZ/jTYL0IMtQEklT3/iWCutzUljDDNXVSVHRFWW7SOtccHag6V/AF1/slVRyOkZAAAAAElFTkSuQmCC";

const clamp = (v:number,min:number,max:number) => Math.max(min,Math.min(max,v));

function getWatermarkInfo(width:number,height:number):Size {
  const minDim=Math.min(width,height), ratio=minDim/1536;
  const size=Math.max(16,Math.round(96*ratio)), margin=Math.max(8,Math.round(64*ratio));
  return { size, x:Math.max(0,width-margin-size), y:Math.max(0,height-margin-size), width:size, height:size };
}

function getVeoWatermark(width:number,height:number):Size {
  const base=Math.min(width,height), size=Math.max(24,Math.min(Math.round(base/15),base)), margin=Math.round(base/10);
  return { size, x:Math.max(0,width-margin-size), y:Math.max(0,height-margin-size), width:size, height:size };
}

const imageCache=new Map<number,HTMLImageElement>();
async function getReference(size:number):Promise<HTMLImageElement>{
  const cached=imageCache.get(size); if(cached) return cached;
  const img=await new Promise<HTMLImageElement>((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('Gemini reference asset could not be loaded.'));i.src=BG_48;});
  imageCache.set(size,img); return img;
}

async function alphaMap(size:number):Promise<Float32Array>{
  const ref=await getReference(size), c=document.createElement('canvas'); c.width=size;c.height=size;
  const ctx=c.getContext('2d',{willReadFrequently:true}); if(!ctx) throw new Error('Canvas processing is unavailable.');
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(ref,0,0,size,size);
  const d=ctx.getImageData(0,0,size,size).data, a=new Float32Array(size*size);
  for(let i=0;i<a.length;i++){const o=i*4;a[i]=Math.max(d[o],d[o+1],d[o+2])/255;}
  return a;
}

function scoreCandidate(data:ImageData,width:number,height:number,ref:HTMLImageElement,box:{x:number,y:number,size:number}){
  const {x,y,size}=box;if(x<0||y<0||x+size>width||y+size>height)return -1;
  const c=document.createElement('canvas');c.width=size;c.height=size;const ctx=c.getContext('2d',{willReadFrequently:true});if(!ctx)return -1;
  ctx.drawImage(ref,0,0,size,size);const rd=ctx.getImageData(0,0,size,size).data;let sumL=0,sumA=0,sumL2=0,sumA2=0,sumLA=0,n=0;
  const step=size>80?2:1;
  for(let r=0;r<size;r+=step)for(let col=0;col<size;col+=step){const ii=((y+r)*width+x+col)*4,ri=(r*size+col)*4;const lum=.299*data.data[ii]+.587*data.data[ii+1]+.114*data.data[ii+2], a=Math.max(rd[ri],rd[ri+1],rd[ri+2])/255;sumL+=lum;sumA+=a;sumL2+=lum*lum;sumA2+=a*a;sumLA+=lum*a;n++;}
  if(!n)return -1;const ml=sumL/n,ma=sumA/n,vl=Math.max(0,sumL2/n-ml*ml),va=Math.max(0,sumA2/n-ma*ma);if(vl<.5||va<.0001)return 0;return Math.max(0,(sumLA/n-ml*ma)/Math.sqrt(vl*va));
}

export async function detectGeminiWatermark(imageData:ImageData, width:number, height:number, mode:'image'|'video'='image'):Promise<Detection>{
  const ref=await getReference(48), base=mode==='video'?getVeoWatermark(width,height):getWatermarkInfo(width,height), baseDim=Math.min(width,height);
  const layouts=mode==='video'?[{baseSize:base.size,m:Math.round(baseDim/10),prior:1.06},{baseSize:Math.max(24,Math.round(96*(baseDim/1536))),m:Math.max(16,Math.round(192*(baseDim/1536))),prior:1.01}]:[{baseSize:base.size,m:Math.max(8,Math.round(192*(baseDim/1536))),prior:1.08},{baseSize:base.size,m:Math.max(8,Math.round(64*(baseDim/1536))),prior:1.04},{baseSize:96,m:baseDim>=1400?192:Math.round(128*Math.max(.5,baseDim/1024)),prior:1.02}];
  const scales=mode==='video'?[.65,.85,1,1.2,1.45]:[.55,.7,.85,1,1.15,1.3,1.5,1.7]; let best={score:-1,x:base.x,y:base.y,size:base.size,prior:1};
  for(const l of layouts)for(const s0 of scales){const size=Math.max(16,Math.min(Math.round(l.baseSize*s0),Math.min(width,height)-8)),x=Math.max(0,width-l.m-size),y=Math.max(0,height-l.m-size),score=scoreCandidate(imageData,width,height,ref,{x,y,size})*l.prior;if(score>best.score)best={score,x,y,size,prior:l.prior};}
  if(best.score>.05){for(const ds of [.9,.95,1,1.05,1.1]){const size=Math.max(16,Math.min(Math.round(best.size*ds),Math.min(width,height)-8));for(let dy=-16;dy<=16;dy+=4)for(let dx=-16;dx<=16;dx+=4){const x=clamp(best.x+dx,0,width-size),y=clamp(best.y+dy,0,height-size),s=scoreCandidate(imageData,width,height,ref,{x,y,size})*best.prior;if(s>best.score)best={score:s,x,y,size,prior:best.prior};}}}
  const score=clamp(best.score,0,1), found=score>=(mode==='video'?.08:.10);
  return {matchFound:found,score,x:best.x,y:best.y,size:best.size,width:best.size,height:best.size,gain:.6};
}

export async function removeGeminiWatermark(imageData:ImageData, detection:Detection):Promise<ImageData>{
  if(!detection.matchFound)return imageData;
  const a=await alphaMap(detection.size), {x,y,size}=detection;
  for(let r=0;r<size;r++)for(let c=0;c<size;c++){const alpha=Math.min(a[r*size+c]*detection.gain,MAX_ALPHA);if(alpha<ALPHA_THRESHOLD)continue;const i=((y+r)*imageData.width+x+c)*4,inv=1-alpha;for(let ch=0;ch<3;ch++)imageData.data[i+ch]=clamp(Math.round((imageData.data[i+ch]-alpha*LOGO_VALUE)/inv),0,255);}
  return imageData;
}

export async function processGeminiImage(image:HTMLImageElement){
  const canvas=document.createElement('canvas');canvas.width=image.naturalWidth||image.width;canvas.height=image.naturalHeight||image.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('Canvas processing is unavailable.');ctx.drawImage(image,0,0,canvas.width,canvas.height);const data=ctx.getImageData(0,0,canvas.width,canvas.height);const detection=await detectGeminiWatermark(data,canvas.width,canvas.height,'image');if(!detection.matchFound)return {canvas,detection};await removeGeminiWatermark(data,detection);ctx.putImageData(data,0,0);return {canvas,detection};
}

export async function createWatermarkEngine():Promise<WatermarkEngine>{
  return {
    getWatermarkInfo(width,height){const info=getWatermarkInfo(width,height);return {size:info.size,position:{x:info.x,y:info.y,width:info.width,height:info.height}};},
    async getAlphaMap(size){return alphaMap(Math.max(1,Math.round(size)));},
    async removeWatermarkFromImage(canvas){const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)throw new Error('Canvas processing is unavailable.');const data=ctx.getImageData(0,0,canvas.width,canvas.height);const detection=await detectGeminiWatermark(data,canvas.width,canvas.height,'image');if(detection.matchFound){await removeGeminiWatermark(data,detection);ctx.putImageData(data,0,0);}return canvas;}
  };
}
