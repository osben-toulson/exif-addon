## About

This project is an Adobe Express add-on that lets users upload images and extract EXIF metadata (camera, shutter speed, ISO, lens, focal length, aperture) when available. Extracted EXIF values are shown in editable fields and can be applied to the document as text elements. The add-on is built with Spectrum Web Components, `lit`, and the Adobe Express Add-on SDK.

## Quick Start

Prerequisites: Node.js and npm installed.

```powershell
npm install
npm run start   # runs the dev server
npm run build   # build production assets
npm run package # package the add-on
```

## Usage

- Open the add-on UI in Adobe Express (development flow uses `npm run start`).
- Click **Choose File** to upload an image; EXIF fields auto-populate when the image contains metadata.
- Edit fields as needed and click **Apply to Document** to add text fields to the document.

## Project Layout

- `src/ui/components/App.js` — main UI component and EXIF form.
- `src/sandbox/code.js` — document sandbox runtime APIs (validation and apply logic).
- `src/index.html` — add-on entry HTML.
- `src/manifest.json` — add-on manifest and permissions.

## Development

- Use `npm run start` to launch the local dev server and test the add-on in the Express environment.
- Use `npm run build` to produce production-ready bundles.
- Use `npm run package` to create a distributable package for submission.

## Troubleshooting

- If EXIF fields don't populate, try different images (some formats strip EXIF) or verify the browser has file access.
- Color-picker or SDK calls failing — verify the add-on manifest permissions and that the Express runtime is available.
- If dependencies fail to install, check Node/npm versions and network/proxy settings.

## Contributing

- Open issues or pull requests. Keep changes small and focused.
- Follow the existing code style in `src/` (ES modules + `lit` patterns).

## License & Policies

- See [EULA.md](EULA.md) and [Privacy Policy.md](Privacy%20Policy.md).

