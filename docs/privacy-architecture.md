# Privacy architecture

The initial application uses a synchronous, in-memory processing flow. The application itself does not intentionally persist uploads or outputs. No database is used for image content, and no object-storage bucket is required for the initial release.

Uploaded images are not used for model training. The inference service re-encodes the returned image as PNG and does not intentionally copy source EXIF metadata.

If persistent storage, processing history, accounts, analytics, or advertising are introduced later, both the implementation and public privacy/cookie text must be updated together before release.
