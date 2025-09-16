import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor } from "express-document-sdk";

// Get the document sandbox runtime.
const { runtime } = addOnSandboxSdk.instance;


function start() {
    // APIs to be exposed to the UI runtime
    // i.e., to the `App.js` file of this add-on.
    const sandboxApi = {
        /**
         * Receives EXIF data and inserts text fields into the document.
         * @param {Object} exifData
         * @param {string} exifData.camera
         * @param {string} exifData.shutterSpeed
         * @param {string} exifData.iso
         * @param {string} exifData.lens
         * @param {string} exifData.focalLength
         */
        applyExifData: ({ camera, shutterSpeed, iso, lens, focalLength }) => {
            const insertionParent = editor.context.insertionParent;
            const fields = [
                { label: "Camera", value: camera },
                { label: "Shutter Speed", value: shutterSpeed },
                { label: "ISO", value: iso },
                { label: "Lens", value: lens },
                { label: "Focal Length", value: focalLength }
            ];
            fields.forEach(({ label, value }, idx) => {
                if (value) {
                    const textField = editor.createText();
                    textField.text = `${label}: ${value}`;
                    textField.translation = { x: 10, y: 30 + idx * 30 };
                    insertionParent.children.append(textField);
                }
            });
        }
    };
    runtime.exposeApi(sandboxApi);
}

start();
