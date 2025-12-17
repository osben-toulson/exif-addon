import "@spectrum-web-components/number-field/sp-number-field.js";
import "@spectrum-web-components/theme/express/scale-medium.js";
import "@spectrum-web-components/theme/express/theme-light.js";
import "@spectrum-web-components/theme/scale-medium.js";
import "@spectrum-web-components/theme/theme-light.js";
import "@spectrum-web-components/field-label/sp-field-label.js";
import '@spectrum-web-components/textfield/sp-textfield.js';
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
        fNumber: "",
        shutterSpeed: "",
        iso: "",
        lens: "",
        focalLength: "",
    };

    @state()
    fileError = "";

    @state()
    shutterSpeedError = "";

    @state()
    isoError = "";

    @state()
    focalLengthError = "";

    @state()
    textSize = 20;

    @state()
    textColor = "#000000FF";

    static get styles() {
        return style;
    }

    async firstUpdated() {
        // Get the UI runtime.
        const { runtime } = this.addOnUISdk.instance;

        // Get the proxy object, which is required
        // to call the APIs defined in the Document Sandbox runtime
        // i.e., in the `code.ts` file of this add-on.
        this._sandboxProxy = await runtime.apiProxy(RuntimeType.documentSandbox);

        // Set up color picker event listeners
        // In firstUpdated():
        const colorPickerBtn = this.renderRoot.getElementById("colorPickerBtn");
        if (colorPickerBtn) {
            colorPickerBtn.addEventListener("click", () => {
                this.addOnUISdk.app.showColorPicker(colorPickerBtn, {
                    title: "Pick Text Color",
                    initialColor: this.textColor,
                    disableAlphaChannel: false
                });
            });
            colorPickerBtn.addEventListener("colorpicker-color-change", (event) => {
                this.textColor = event.detail.color;
                this.requestUpdate();
            });
        }
    }

    async _onFileChange(e) {
        this.fileError = "";
        const file = e.target.files[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();
        let fileType = "other";
        if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") || fileName.endsWith(".png") || fileName.endsWith(".gif") || fileName.endsWith(".bmp")) {
            fileType = "image";
        } else if (fileName.endsWith(".mp4") || fileName.endsWith(".mov") || fileName.endsWith(".avi") || fileName.endsWith(".webm")) {
            fileType = "video";
        }

        switch (fileType) {
            case "image":
                // Add image to document
                try {
                    await this.addOnUISdk.app.document.addImage(file, {
                        title: file.name,
                        author: "Uploaded by user"
                    });
                } catch (err) {
                    this.fileError = "Could not add image to document.";
                }
                // Extract EXIF
                try {
                    const exif = await exifr.parse(file, [
                        "Make",
                        "Model",
                        "ExposureTime",
                        "ISO",
                        "LensModel",
                        "FocalLength",
                        "FNumber"
                    ]);

                    this.exifData = {
                        camera: exif.Model || "",
                        shutterSpeed: exif.ExposureTime ? `1/${Math.round(1 / exif.ExposureTime)}` : "",
                        iso: exif.ISO ? String(exif.ISO) : "",
                        lens: exif.LensModel || "",
                        focalLength: exif.FocalLength ? `${exif.FocalLength}mm` : "",
                        fNumber: exif.FNumber ? `f/${exif.FNumber}` : ""
                    };
                } catch (err) {
                    this.exifData = {
                        camera: "",
                        shutterSpeed: "",
                        iso: "",
                        lens: "",
                        focalLength: "",
                        fNumber: ""
                    };
                }
                break;
            case "video":
                // Add video to document
                try {
                    await this.addOnUISdk.app.document.addVideo(file, {
                        title: file.name,
                        author: "Uploaded by user"
                    });
                } catch (err) {
                    this.fileError = "Could not add video to document.";
                }
                // No EXIF extraction for video
                this.exifData = {
                    camera: "",
                    shutterSpeed: "",
                    iso: "",
                    lens: "",
                    focalLength: ""
                };
                break;
            default:
                this.fileError = "Unsupported file type.";
                this.exifData = {
                    camera: "",
                    shutterSpeed: "",
                    iso: "",
                    lens: "",
                    focalLength: "",
                    fNumber: ""
                };
        }
        this.requestUpdate();

    }

    async _onInputChange(e, field) {       
        this.exifData = { ...this.exifData, [field]: e.target.value };
        if (field === "shutterSpeed") {
            const result = await this._sandboxProxy.validateExifField(field, e.target.value);
            if (result) {
                this.shutterSpeedError = result;
            } else {
                this.shutterSpeedError = "";
            }
        }

        if (field === "iso") {
            const result = await this._sandboxProxy.validateExifField(field, e.target.value);
            if (result) {
                this.isoError = result;
            } else {
                this.isoError = "";
            }
        }

        if (field === "focalLength") {
            const result = await this._sandboxProxy.validateExifField(field, e.target.value);
            if (result) {
                this.focalLengthError = result;
            } else {
                this.focalLengthError = "";
            }
        }

        if (field === "fNumber") {
            const result = await this._sandboxProxy.validateExifField(field, e.target.value);
            if (result) {
                this.fNumberError = result;
            } else {
                this.fNumberError = "";
            }
        }
    }

    _onTextSizeChange(e) {
        this.textSize = Number(e.target.value);
    }

    async _applyExifToDoc() {
        if (this._sandboxProxy && Object.values(this.exifData).some(v => v)) {
            await this._sandboxProxy.applyExifData({ ...this.exifData, textSize: this.textSize, textColor: this.textColor });
        }
    }

    _clearExifData() {
        this.exifData = {
            camera: "",
            fNumber: "",
            shutterSpeed: "",
            iso: "",
            lens: "",
            focalLength: "",
        };

        this.shutterSpeedError = "";
        this.isoError = "";
        this.focalLengthError = "";
        this.fNumberError = "";
    }

    render() {
        return html`
        <sp-theme system="express" color="light" scale="medium">
            <div class="container">
                <sp-field-label size="xl" for="fileInput">Upload Image:</sp-field-label>
                <input id="fileInput" type="file" accept="image/*" style="display:none" @change=${this._onFileChange.bind(this)} />
                <sp-button size="s" @click=${() => this.renderRoot.getElementById('fileInput').click()}>Choose File</sp-button>
                ${this.fileError ? html`<div style="color:red;">${this.fileError}</div>` : ""}
                <sp-field-label size="xl" for="cameraInput">Camera:</sp-field-label>
                <sp-textfield id="cameraInput" size="l" .value=${this.exifData.camera} @input=${e => this._onInputChange(e, "camera")} ></sp-textfield>
                <sp-field-label size="xl" for="fNumberInput">Aperture:</sp-field-label>
                <sp-textfield id="fNumberInput" size="l" .value=${this.exifData.fNumber} @input=${e => this._onInputChange(e, "fNumber")} ></sp-textfield>
                ${this.fNumberError ? html`<div style="color:red;">${this.fNumberError}</div>` : ""}
                <sp-field-label size="xl" for="shutterSpeedInput">Shutter Speed:</sp-field-label>
                <sp-textfield id="shutterSpeedInput" size="l" .value=${this.exifData.shutterSpeed} @input=${e => this._onInputChange(e, "shutterSpeed")} ></sp-textfield>
                ${this.shutterSpeedError ? html`<div style="color:red;">${this.shutterSpeedError}</div>` : ""}
                <sp-field-label size="xl" for="isoInput">ISO:</sp-field-label>
                <sp-textfield id="isoInput" size="l" .value=${this.exifData.iso} @input=${e => this._onInputChange(e, "iso")} ></sp-textfield>
                ${this.isoError ? html`<div style="color:red;">${this.isoError}</div>` : ""}
                <sp-field-label size="xl" for="lensInput">Lens:</sp-field-label>
                <sp-textfield id="lensInput" size="l" .value=${this.exifData.lens} @input=${e => this._onInputChange(e, "lens")} ></sp-textfield>
                <sp-field-label size="xl" for="focalLengthInput">Focal Length:</sp-field-label>
                <sp-textfield id="focalLengthInput" size="l" .value=${this.exifData.focalLength} @input=${e => this._onInputChange(e, "focalLength")} ></sp-textfield>
                ${this.focalLengthError ? html`<div style="color:red;">${this.focalLengthError}</div>` : ""}
                <sp-field-label size="xl">Customize Text</sp-field-label>
                <table>
                    <tr>
                        <td>Text Size</td>
                        <td>Color</td>
                    </tr>
                    <tr>
                        <td>
                            <sp-number-field
                                min="1"
                                max="1000"
                                step="1"
                    .value=${this.textSize}
                    label="Text Size"
                    @input=${this._onTextSizeChange.bind(this)}
                ></sp-number-field>
                <td>
                <div id="colorPickerBtn" style="width:30px;height:30px;border:1px solid #ccc;border-radius:4px;display:inline-block;vertical-align:middle;background:${this.textColor}" tabindex="0" role="button" aria-label="Pick Text Color" title="Pick Text Color"></div>
                </tr>
                </table>
                <div style="margin-top:20px"></div>
                <sp-button size="l" @click=${this._clearExifData.bind(this)}>Reset</sp-button>
                <sp-button style="margin-top:10px" size="l" ?disabled=${!Object.values(this.exifData).some(v => v && v.trim())} @click=${this._applyExifToDoc.bind(this)}>Apply to Document</sp-button>
            </div>
        </sp-theme>`;
    }
}
