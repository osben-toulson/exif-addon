// To support: system="express" scale="medium" color="light"
// import these spectrum web components modules:
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";
import "@spectrum-web-components/theme/scale-medium.js";
import "@spectrum-web-components/theme/theme-light.js";

// To learn more about using "spectrum web components" visit:
// https://opensource.adobe.com/spectrum-web-components/
import "@spectrum-web-components/button/sp-button.js";
import "@spectrum-web-components/theme/sp-theme.js";


import exifr from "exifr";
import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { style } from "./App.css";

import { RuntimeType } from "https://new.express.adobe.com/static/add-on-sdk/sdk.js";

@customElement("add-on-app")
export class App extends LitElement {
    @property({ type: Object })
    addOnUISdk;


    @state()
    _sandboxProxy;

    @state()
    exifData = {
        camera: "",
        shutterSpeed: "",
        iso: "",
        lens: "",
        focalLength: ""
    };

    @state()
    fileError = "";

    static get styles() {
        return style;
    }

    async _onFileChange(e) {
        this.fileError = "";
        const file = e.target.files[0];
        if (!file) return;

        // Add image to document immediately using Adobe Express Add-on SDK
        try {
            await this.addOnUISdk.app.document.addImage(file, {
                title: file.name,
                author: "Uploaded by user"
            });
        } catch (err) {
            this.fileError = "Could not add image to document.";
        }

        // Extract EXIF as before
        try {
            const exif = await exifr.parse(file, [
                "Make",
                "Model",
                "ExposureTime",
                "ISOSpeedRatings",
                "LensModel",
                "FocalLength"
            ]);
            this.exifData = {
                camera: [exif.Make, exif.Model].filter(Boolean).join(" ") || "",
                shutterSpeed: exif.ExposureTime ? `1/${Math.round(1/exif.ExposureTime)}` : "",
                iso: exif.ISOSpeedRatings ? String(exif.ISOSpeedRatings) : "",
                lens: exif.LensModel || "",
                focalLength: exif.FocalLength ? `${exif.FocalLength}mm` : ""
            };
        } catch (err) {
            this.fileError = "Could not read EXIF data.";
            this.exifData = {
                camera: "",
                shutterSpeed: "",
                iso: "",
                lens: "",
                focalLength: ""
            };
        }
        this.requestUpdate();
    }

    _onInputChange(e, field) {
        this.exifData = { ...this.exifData, [field]: e.target.value };
    }

    async _applyExifToDoc() {
        if (this._sandboxProxy && Object.values(this.exifData).some(v => v)) {
            await this._sandboxProxy.applyExifData(this.exifData);
        }
    }

    render() {
        return html` <sp-theme system="express" color="light" scale="medium">
            <div class="container">
                <label>
                    Upload Image or Video:
                    <input type="file" accept="image/*,video/*" @change=${this._onFileChange.bind(this)} />
                </label>
                ${this.fileError ? html`<div style="color:red;">${this.fileError}</div>` : ""}
                <label>
                    Camera:
                    <input type="text" .value=${this.exifData.camera} @input=${e => this._onInputChange(e, "camera")} />
                </label>
                <label>
                    Shutter Speed:
                    <input type="text" .value=${this.exifData.shutterSpeed} @input=${e => this._onInputChange(e, "shutterSpeed")} />
                </label>
                <label>
                    ISO:
                    <input type="text" .value=${this.exifData.iso} @input=${e => this._onInputChange(e, "iso")} />
                </label>
                <label>
                    Lens:
                    <input type="text" .value=${this.exifData.lens} @input=${e => this._onInputChange(e, "lens")} />
                </label>
                <label>
                    Focal Length:
                    <input type="text" .value=${this.exifData.focalLength} @input=${e => this._onInputChange(e, "focalLength")} />
                </label>
                <sp-button size="m" @click=${this._applyExifToDoc.bind(this)}>Apply to Document</sp-button>
            </div>
        </sp-theme>`;
    }
}
