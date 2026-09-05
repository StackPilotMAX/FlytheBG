# PDR — FlyThe BG Video Compressor

**Status:** Ready for implementation  
**Product:** FlyThe BG  
**Repository:** StackPilotMAX/FlytheBG  
**Proposed route:** `/tools/video-compressor`  
**Primary objective:** Ship a fully working, browser-first video compressor before adding secondary enhancements.

## 1. Executive summary

Build a privacy-first video compressor for FlyThe BG inspired by the user experience and browser-processing approach of Kommodo's online compressor, but implemented independently and integrated with FlyThe BG's existing Next.js/React architecture.

The feature must process supported videos locally in the browser. The original video must not be uploaded to a FlyThe BG server for compression. The first release must be production-usable: select/drag a video, inspect it, choose compression settings, compress it, show reliable before/after information, and download the result.

Do not copy Kommodo's source code, proprietary implementation, branding, text, or visual design. Reproduce only general product capabilities and use standards-based/browser APIs and appropriately licensed dependencies.

## 2. Repository findings

The repository is `StackPilotMAX/FlytheBG`, a public TypeScript project whose default branch is `main`. The web application is under `apps/web`. The application already uses Next.js, React, TypeScript, Tailwind-related tooling, Motion, Lucide icons, ONNX Runtime Web, and other browser-oriented processing dependencies.

Relevant existing conventions include `apps/web/src/app` for routes and `apps/web/src/components` and `apps/web/src/lib` for reusable implementation. Existing feature routes include a general `/features` area and a passport-photo feature. No existing video-compressor implementation was found during the repository review.

The implementation must follow existing project conventions rather than introducing a separate application or server-side processing service.

## 3. Reference-product analysis

Kommodo's public compressor presents a browser-based video-compression workflow with drag/drop or file selection, quality presets, resolution choices, progress, and downloadable output. Its public page states that processing uses WebCodecs and hardware acceleration where supported, with local processing and practical device-memory limits. It accepts common video formats and produces MP4/H.264 output.

For FlyThe BG, use the following as product inspiration only:

- Local/browser-first processing.
- WebCodecs where the browser supports the required APIs.
- Hardware acceleration when the browser/codec implementation provides it.
- Simple quality presets.
- Resolution controls.
- Clear progress feedback.
- Before/after file statistics.
- Direct download without an account or watermark.

Do not promise a fixed compression percentage because compression depends on source codec, resolution, frame rate, motion, duration, audio, browser implementation, and selected settings.

## 4. Product goals

### Must have

1. Upload a supported video using file picker or drag/drop.
2. Keep the source video local to the browser during compression.
3. Detect and display source filename, size, MIME type, duration, resolution, and FPS when available.
4. Provide quality presets: High, Medium, Low.
5. Provide output resolution options: Original, 1080p, 720p, 480p, 360p, while never upscaling the source.
6. Provide a target-size mode with presets such as 10 MB, 25 MB, 50 MB, 100 MB and Custom.
7. Compress using a standards-based browser pipeline.
8. Show an accurate progress indicator and current stage.
9. Allow cancellation before completion.
10. Produce a downloadable result.
11. Display original size, output size, bytes saved, percentage saved, output resolution and output format.
12. Revoke temporary object URLs when they are no longer needed.
13. Handle unsupported browsers and codecs gracefully.
14. Work without requiring user authentication.

### Nice to have after MVP

- Audio bitrate control.
- FPS control.
- Estimated output size before processing.
- Preview playback of the result.
- Multiple-file batch compression.
- Remember last-used settings locally.
- Advanced codec/container options.

These must not delay the first fully working release.

## 5. User experience

### Initial state

Show a clean FlyThe BG upload card:

- Video icon.
- "Compress Video" heading.
- Short privacy statement: "Your video is processed in your browser. It is not uploaded to FlyThe BG for compression."
- Drag-and-drop zone.
- Browse button.
- Supported-format hint.

### After selection

Show:

- Video preview/thumbnail where feasible.
- Filename.
- File size.
- Duration.
- Resolution.
- FPS if available.
- Remove/replace action.

Then show compression settings.

### Settings

**Quality**

- High — prioritize visual quality.
- Medium — balanced default.
- Low — prioritize smaller files.

The implementation must map presets to documented encoder parameters. Do not hard-code marketing claims such as "70% smaller" as guaranteed results.

**Resolution**

- Original
- 1080p
- 720p
- 480p
- 360p

Never upscale. Preserve aspect ratio. Calculate dimensions using even-numbered encoder dimensions when required.

**Target file size**

- No target / quality mode
- 10 MB
- 25 MB
- 50 MB
- 100 MB
- Custom

Target size is best-effort. The UI must clearly state that exact size cannot always be guaranteed because container overhead, keyframes, codec behavior, and audio affect final size.

### Compression state

Show:

- Current stage: Preparing / Decoding / Encoding / Finalizing.
- Progress percentage when reliable.
- Elapsed time.
- Cancel button.
- Do not allow a second compression job to mutate the active job state.

### Result state

Show:

- Output preview where supported.
- Original size.
- Compressed size.
- Saved bytes.
- Saved percentage.
- Output dimensions.
- Output format.
- Download button.
- Compress another video button.

If compression makes the file larger, do not report negative savings as an error. Explain that the selected settings did not reduce the file and still provide the result or offer a higher-compression setting.

## 6. Technical architecture

Use a client-only implementation for the compression engine. Do not pass the source video through a Next.js API route or server action.

Recommended separation:

```text
UI route
  -> compressor controller/hook
      -> media metadata reader
      -> capability detector
      -> decode pipeline
      -> resize pipeline
      -> VideoEncoder
      -> muxer/container writer
      -> Blob/download manager
```

Keep browser-only APIs out of server-rendered modules. Components that touch `window`, `document`, `VideoDecoder`, `VideoEncoder`, `VideoFrame`, `OffscreenCanvas`, `MediaSource`, or object URLs must run on the client.

Prefer Web Workers for CPU-heavy orchestration where practical so the React UI remains responsive. Transfer `ArrayBuffer`/video data rather than cloning large buffers where supported.

## 7. Encoding pipeline

The preferred MVP pipeline is:

1. Obtain the local `File`.
2. Read only the metadata needed for UI and capability checks.
3. Decode supported input frames using browser media APIs/WebCodecs where feasible.
4. Resize frames while preserving aspect ratio.
5. Feed frames into `VideoEncoder` using an H.264 configuration supported by the browser.
6. Collect encoded chunks.
7. Mux encoded video into a valid MP4 container.
8. Include audio only if a reliable, browser-compatible path is implemented. If audio is not supported in the first release, explicitly communicate that the MVP is video-only rather than silently producing a broken or misleading file.
9. Build a Blob and expose it through a temporary object URL.
10. Provide download.

Important: WebCodecs produces encoded chunks; it does not by itself create a complete MP4 container. A tested, appropriately licensed MP4 muxer is therefore required if MP4 is the output.

Do not add FFmpeg/WASM merely because it is familiar. First evaluate whether the required input/output combinations can be implemented reliably with WebCodecs plus a muxer. If a required codec/container cannot be supported reliably with native browser APIs, document the limitation and use a carefully justified fallback rather than silently uploading files to a server.

## 8. Target-size algorithm

Target-size mode must calculate a starting bitrate rather than repeatedly encoding arbitrary settings.

Approximate total bitrate:

`targetBits / durationSeconds`

Then reserve a documented portion for audio/container overhead when audio is included.

Use iterative adjustment only where necessary. A safe strategy is:

1. Calculate initial video bitrate from target size and duration.
2. Clamp bitrate to safe minimum/maximum values for the selected resolution.
3. Encode once.
4. Compare final Blob size with target.
5. If outside an acceptable tolerance and resources permit, adjust bitrate and encode again.
6. Stop after a small fixed number of iterations to prevent runaway CPU/memory usage.

Never claim exact target-size guarantees. The UI should show "Target" and "Actual" separately.

## 9. Capability detection

Before starting compression, check for the required APIs and codec configuration.

At minimum detect:

- `VideoEncoder`.
- `VideoDecoder` if required by the chosen input path.
- `VideoFrame`.
- Required canvas/offscreen canvas capability.
- H.264 encoder configuration support using `VideoEncoder.isConfigSupported()` where available.
- Required MP4 muxer availability.

If unsupported, show a useful message explaining that the browser cannot perform this local compression mode and recommend a supported modern browser. Do not upload the file as an undisclosed fallback.

## 10. Browser and mobile behavior

Primary target: modern Chromium-based browsers with WebCodecs support.

Safari/iOS and Firefox support must be feature-detected rather than assumed. The page must not render a compression button that is guaranteed to fail later.

Mobile devices may have significantly lower memory and CPU resources. Add safeguards for very large files/resolutions and provide a clear error if the browser cannot allocate the required resources.

## 11. Privacy requirements

This is a core product requirement.

- Compression source data must remain client-side.
- No upload endpoint may be used for the compressor MVP.
- Do not log video contents, Blob URLs, filenames, or media metadata to analytics systems unless explicitly approved and privacy-safe.
- Do not persist source videos in localStorage, IndexedDB, caches, or service-worker caches unless a future feature explicitly requires it and has a documented retention policy.
- Revoke object URLs after use.
- Release VideoFrame resources with `close()` when applicable.
- Release encoder/decoder resources after completion, cancellation, and errors.
- Clear references to large ArrayBuffers/Blobs after the job ends.

Landing-page/privacy language should distinguish browser-local processing from any FlyThe BG feature that intentionally uses an external service.

## 12. Error handling

Handle at least:

- No file selected.
- Unsupported extension/MIME type.
- Corrupt video.
- Browser lacks required APIs.
- Codec unsupported.
- Decode failure.
- Encode failure.
- Muxing failure.
- Out-of-memory/resource exhaustion.
- User cancellation.
- Output unexpectedly larger than input.
- Very long duration.
- Extremely high resolution.
- Zero/unknown duration.
- Object URL/download failure.

Errors must be human-readable and actionable. Do not expose raw stack traces in the main UI.

## 13. Performance requirements

- UI must remain responsive during processing.
- Prefer worker-based processing for heavy work.
- Avoid unnecessary full-file copies.
- Use transferable buffers where possible.
- Release frames promptly.
- Do not keep every decoded frame in memory.
- Process frames as a stream/sequence rather than accumulating the complete decoded video.
- Cancellation must terminate/flush processing and release resources.
- Progress must be derived from actual known work; never fake a 0–100 animation unrelated to processing.

## 14. File naming

Default output filename:

`<original-name>-compressed.mp4`

If the output format differs in a future version, use the appropriate extension automatically.

Sanitize filenames for browser download compatibility without altering the visible original filename in the UI.

## 15. Accessibility

- Keyboard-accessible upload control.
- Drag/drop must not be the only upload mechanism.
- Visible focus states.
- Proper labels for sliders/selects/buttons.
- Progress announced appropriately to assistive technology.
- Do not rely on color alone for errors or status.
- Buttons must have disabled/loading states.
- Maintain usable contrast within FlyThe BG's visual system.

## 16. SEO and route

Create a dedicated page at `/tools/video-compressor` unless existing route conventions require a different canonical location.

Suggested metadata:

**Title:** Free Video Compressor — Compress Videos in Your Browser | FlyThe BG

**Description:** Compress videos directly in your browser with FlyThe BG. Choose quality and resolution, reduce file size, and download your result without uploading your video for compression.

The page should include concise explanatory content below the tool covering:

- What the video compressor does.
- How browser-local processing works.
- Supported browsers/formats.
- Why target file size is best-effort.
- Privacy boundary.
- Device limitations.

Do not claim "unlimited" or guaranteed compression ratios.

## 17. Proposed implementation structure

Use existing repository conventions and avoid unnecessary abstraction. A reasonable starting structure is:

```text
apps/web/src/app/tools/video-compressor/page.tsx
apps/web/src/components/video-compressor/
  VideoCompressor.tsx
  UploadZone.tsx
  VideoMetadata.tsx
  CompressionSettings.tsx
  CompressionProgress.tsx
  CompressionResult.tsx
apps/web/src/lib/video-compressor/
  capabilities.ts
  metadata.ts
  encoder.ts
  muxer.ts
  target-size.ts
  types.ts
  worker.ts
```

Exact filenames may be adjusted to match existing code conventions after inspecting neighboring feature implementations. Do not duplicate existing shared upload, button, card, modal, or analytics components when suitable components already exist.

## 18. Dependencies

Before adding dependencies:

1. Search the repository for an existing media/video utility.
2. Check the current package lock/package manager.
3. Prefer a small, well-maintained, appropriately licensed MP4 muxing dependency compatible with browser bundling.
4. Avoid bringing a full FFmpeg WASM stack unless native WebCodecs cannot satisfy a clearly documented requirement.
5. Verify bundle-size impact.
6. Verify the dependency works with the project's Next.js version and client bundling.

Any new dependency must be justified in the PR description.

## 19. Testing requirements

### Unit tests

Test:

- resolution calculation and no-upscale behavior;
- aspect-ratio preservation;
- even encoder dimensions;
- quality-to-encoder mapping;
- target bitrate calculation;
- target-size iteration/clamping;
- filename generation;
- byte/percentage formatting;
- capability detection logic with mocked APIs;
- cancellation state transitions.

### Integration/browser tests

Use small fixture videos to verify:

1. Upload works.
2. Metadata appears.
3. Compression starts.
4. Progress changes based on real processing.
5. Compression completes.
6. Output Blob is non-empty.
7. Output has the expected MIME/container.
8. Download is possible.
9. Original and output statistics are correct.
10. Cancellation releases the job.
11. Unsupported capability displays a useful error.
12. A failed encode does not leave the UI stuck in loading state.

### Manual matrix

Test at minimum on:

- Chrome desktop.
- Edge desktop.
- Chrome Android where WebCodecs is available.
- Safari/macOS and Safari/iOS for graceful unsupported/limited behavior.
- A low-memory mobile device or throttled environment.

Test source videos with:

- 480p, 720p, 1080p.
- Short and long duration.
- Small and large files.
- Different common source containers/codecs available for testing.
- Portrait and landscape aspect ratios.

## 20. Acceptance criteria

The feature is accepted only when all of the following are true:

- A user can open `/tools/video-compressor` and understand the tool without instructions.
- A user can select or drag a supported video into the tool.
- The source video is not uploaded to a FlyThe BG compression endpoint.
- The UI displays source metadata.
- High/Medium/Low settings produce different documented encoder configurations.
- Resolution selection works and never upscales.
- Target-size mode calculates a sensible bitrate and reports actual output size.
- Compression uses the implemented local browser pipeline.
- The UI remains responsive during processing.
- Progress reflects actual processing.
- Cancellation works and cleans up resources.
- Successful output can be downloaded.
- Output statistics are accurate.
- Errors are recoverable and understandable.
- Object URLs and media resources are cleaned up.
- TypeScript passes.
- Existing tests pass.
- New tests pass.
- Production build passes.
- No unrelated existing feature is regressed.
- Mobile layout is usable.
- Accessibility checks pass for the main flow.

## 21. Definition of Done

Before merging:

- `typecheck` passes.
- Existing test suite passes.
- New compressor tests pass.
- Production build passes.
- No console errors in the normal successful flow.
- No server request contains the source video during compression.
- Memory/resource cleanup is verified after success, error, and cancellation.
- At least three real fixture videos have been compressed successfully.
- At least one large-file/resource-limit scenario has been tested.
- Privacy copy has been reviewed for accuracy.
- SEO metadata is present.
- The feature is linked from the appropriate FlyThe BG tools/features navigation.
- The implementation does not claim capabilities that are not actually supported by the browser.

## 22. Implementation constraints for the coding agent

The coding agent must:

1. Read the current repository implementation before changing files.
2. Reuse existing components and styling patterns where possible.
3. Do not rewrite unrelated features.
4. Do not introduce a backend upload endpoint for compression.
5. Do not use fake compression or merely rename/repackage the source file.
6. Do not simulate progress with timers.
7. Do not report a target size as achieved unless the actual output has been measured.
8. Do not silently fall back to a server or external API.
9. Do not copy Kommodo code or proprietary assets.
10. Keep all browser-only code isolated from server components.
11. Add tests for important calculations and state transitions.
12. Run typecheck, tests, and production build before declaring the feature complete.
13. If a technical requirement cannot be supported reliably in a target browser, implement capability detection and a clear limitation rather than a broken experience.

## 23. Suggested implementation order

### Phase 1 — Foundation

- Inspect existing shared UI/upload components.
- Add route.
- Add types and capability detection.
- Add upload/metadata UI.

### Phase 2 — Real compression

- Implement browser decoding/encoding pipeline.
- Add MP4 muxing.
- Produce valid downloadable output.
- Add cleanup/cancellation.

### Phase 3 — Controls

- Add quality presets.
- Add resolution control.
- Add target-size calculation and bounded iteration.

### Phase 4 — UX hardening

- Progress stages.
- Before/after statistics.
- Error states.
- Mobile/accessibility.
- SEO content.

### Phase 5 — Validation

- Unit tests.
- Browser tests.
- Real fixture videos.
- Typecheck.
- Production build.
- Performance/resource testing.

## 24. Final product principle

The feature should feel like a simple consumer tool while having a technically honest privacy boundary:

**Select video → choose how small/clear you want it → compress locally → see exactly what changed → download.**

The MVP is not complete until the actual video bytes have been decoded, encoded, correctly muxed into the advertised output format, measured, and downloaded successfully in a supported browser.
