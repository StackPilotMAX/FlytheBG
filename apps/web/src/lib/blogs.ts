export type BlogPost = {
  slug: string;
  index: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  intro: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "private-browser-image-tools",
    index: "01",
    title: "What browser-first image tools actually mean for your privacy",
    excerpt: "A practical look at local processing, browser boundaries, and what happens to working images in FlyThe BG.",
    category: "Privacy",
    date: "September 6, 2026",
    readTime: "4 min read",
    intro: "FlyThe BG is a free, no-install web app for background removal, passport and visa photo creation, and lightweight image utilities. For supported local workflows, image processing happens on your device and working images are not saved to a FlyThe BG server.",
    sections: [
      { heading: "The privacy boundary", paragraphs: ["FlyThe BG is browser-first and uses on-device processing where the selected tool supports it; external services may be used only where a feature explicitly requires them.", "That distinction matters. A browser tool can still download software assets, fonts, models, or application code while keeping the image pixels being processed inside the browser. The two things should not be confused."] },
      { heading: "What you should still check", paragraphs: ["Before using any online image service for sensitive material, read its current privacy notice and understand whether the specific feature is local or requires an external service. Also remember that browser history, downloads, screenshots, cloud backups, and other apps are outside a webpage's control."] },
      { heading: "Why no-install can be useful", paragraphs: ["A browser-first workflow removes the need to install a desktop editor for small jobs. It can also make temporary tasks easier: open the tool, process the image, download the result, and clear the page state when you are finished."] },
    ],
  },
  {
    slug: "clean-background-removal",
    index: "02",
    title: "How to get a cleaner background removal",
    excerpt: "Better source images produce better edges. Here are practical ways to improve hair, hands, product edges, and difficult backgrounds.",
    category: "Background Removal",
    date: "September 5, 2026",
    readTime: "5 min read",
    intro: "Automatic background removal works best when the subject is clearly separated from its surroundings. A few improvements to the source image can make a bigger difference than repeatedly running the same image through a tool.",
    sections: [
      { heading: "Start with separation", paragraphs: ["Use a well-lit photo where the subject has visible contrast against the background. Busy patterns, very similar colors, motion blur, and heavy shadows make segmentation harder.", "For people, keep hair and clothing visible rather than blending them into a similarly colored wall. For products, avoid backgrounds that share the same color as thin edges."] },
      { heading: "Watch the difficult edges", paragraphs: ["Hair, transparent objects, plant leaves, bicycle spokes, and fingers are common edge cases. Zoom in after processing and inspect the silhouette before using the result in a presentation, listing, or print."] },
      { heading: "Use the result for the right job", paragraphs: ["A clean cutout can be excellent for thumbnails, simple compositions, and product graphics without being perfect at every pixel. If an edge is important, review it at the final size where it will actually be displayed or printed."] },
    ],
  },
  {
    slug: "passport-photo-preparation",
    index: "03",
    title: "Passport and visa photos: size is only one part of the job",
    excerpt: "Understand dimensions, framing, background, printing, and why the receiving authority's rules always come first.",
    category: "Passport Photos",
    date: "September 4, 2026",
    readTime: "5 min read",
    intro: "A passport-photo maker can help prepare a correctly sized layout, but the receiving authority decides whether a photo is acceptable. Treat the tool as a preparation aid, not an approval guarantee.",
    sections: [
      { heading: "Check the current specification", paragraphs: ["Different countries and applications can require different dimensions, background rules, head positioning, expression, lighting, and file requirements. Always verify the current specification from the authority that will receive the photo."] },
      { heading: "Print at the intended size", paragraphs: ["When printing a prepared sheet, use the application's actual-size or 100% setting when appropriate. Printer scaling can change physical dimensions even when the image file itself is correct."] },
      { heading: "Keep the source clean", paragraphs: ["Use a sharp, evenly lit source image with a natural expression and enough space around the head and shoulders. Avoid filters or edits that change identity or create artificial facial details."] },
    ],
  },
  {
    slug: "compress-video-in-your-browser",
    index: "04",
    title: "How browser-based video compression works",
    excerpt: "A beginner-friendly guide to quality presets, resolution, target size, and why real compression takes time.",
    category: "Video",
    date: "September 3, 2026",
    readTime: "6 min read",
    intro: "Video files are much larger than most images because they contain a sequence of frames plus audio. FlyThe BG's video compressor is designed around local browser processing where supported, so the source video does not need to be uploaded to a FlyThe BG processing server.",
    sections: [
      { heading: "Quality and resolution are different", paragraphs: ["Resolution controls how many pixels each frame contains. Quality controls how aggressively the encoder compresses those pixels. Dropping from 1080p to 720p can save substantial space, while lowering quality can reduce size without changing the frame dimensions."] },
      { heading: "Target size is an estimate", paragraphs: ["A target-size workflow can calculate an initial bitrate from the requested size and video duration, then encode and measure the actual output. Because containers, audio, motion, and encoder behavior affect the final file, the requested number is a target rather than a promise."] },
      { heading: "Why progress is real", paragraphs: ["Encoding has to read, decode, process, encode, and mux video data. A real local compressor can therefore take noticeable time on a phone or laptop. Progress should reflect actual processing rather than an artificial timer."] },
    ],
  },
  {
    slug: "choose-the-right-image-format",
    index: "05",
    title: "PNG, JPEG, and WebP: which image format should you use?",
    excerpt: "A simple guide to choosing an output format based on transparency, photographs, editing, and file size.",
    category: "Image Basics",
    date: "September 2, 2026",
    readTime: "4 min read",
    intro: "There is no single best image format. The right choice depends on whether you need transparency, maximum photographic compatibility, or a smaller file for the web.",
    sections: [
      { heading: "Use PNG for transparency", paragraphs: ["PNG is a strong choice when you need a transparent background or want lossless image data. Background-removed graphics are a common example because the transparent pixels are part of the result."] },
      { heading: "Use JPEG for photographs", paragraphs: ["JPEG is widely supported and efficient for photographic images. It uses lossy compression, so repeatedly editing and re-saving JPEGs can gradually reduce quality."] },
      { heading: "Consider WebP for the web", paragraphs: ["WebP can provide smaller files while supporting transparency and modern web delivery. For a website, smaller images can improve page weight, but you should still consider the browsers and systems that need to open the files."] },
    ],
  },
  {
    slug: "remove-watermarks-from-your-own-images",
    index: "06",
    title: "Cleaning up watermarks from images you have the right to edit",
    excerpt: "When removing a watermark is appropriate, what to expect from AI-assisted cleanup, and why the original is still best.",
    category: "Image Cleanup",
    date: "September 1, 2026",
    readTime: "4 min read",
    intro: "Watermark removal can be useful when you are cleaning up your own graphics, drafts, screenshots, or assets where you have permission to make the edit. It should not be used to bypass ownership, licensing, or attribution requirements.",
    sections: [
      { heading: "Start with the original", paragraphs: ["If you own or can access the original unwatermarked asset, use it. Removing a watermark from a compressed copy cannot recreate details that were never present in the copy."] },
      { heading: "AI cleanup has limits", paragraphs: ["A cleanup model may infer what belongs behind an obstruction, but the inferred pixels are not historical recovery. Complex textures, text, faces, and repeated patterns can produce visible artifacts."] },
      { heading: "Review before publishing", paragraphs: ["Zoom in on the cleaned area and compare it with nearby texture. For professional work, keep the original file and a separate edited copy so the change remains reversible."] },
    ],
  },
  {
    slug: "safe-image-workflow",
    index: "07",
    title: "A safer everyday workflow for temporary image editing",
    excerpt: "Small habits that reduce accidental sharing when you are working with personal or sensitive images.",
    category: "Privacy",
    date: "August 30, 2026",
    readTime: "4 min read",
    intro: "Privacy is not just a feature switch. Your workflow matters too. A few simple habits can reduce accidental copies and make temporary image work easier to control.",
    sections: [
      { heading: "Use the smallest necessary source", paragraphs: ["If you only need to remove a background from one image, do not collect an entire folder of unrelated personal images. Minimize the data involved in the task."] },
      { heading: "Know where the result goes", paragraphs: ["After downloading an output, check the browser's download location and any automatic cloud backup or photo-sync behavior on your device. A local webpage cannot control those external copies."] },
      { heading: "Clean up temporary files", paragraphs: ["When the task is finished, remove outputs you no longer need and close temporary tabs. This is especially useful on shared computers and devices with automatic backup enabled."] },
    ],
  },
];

export const getBlogPost = (slug: string) => blogPosts.find((post) => post.slug === slug);
