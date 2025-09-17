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
        applyExifData: ({ camera, shutterSpeed, iso, lens, focalLength, textSize }) => {
            const insertionParent = editor.context.insertionParent;
            const fields = [
                { label: "Camera", value: camera },
                { label: "Shutter Speed", value: shutterSpeed },
                { label: "ISO", value: iso },
                { label: "Lens", value: lens },
                { label: "Focal Length", value: focalLength }
            ];

            // Check to see if exifGroup already exists
            let i = 0;
            for (const child of editor.context.insertionParent.children) {
                if (child.addOnData.getItem("name") === "EXIF Data") {
                    for (const field of child.children) {
                        console.log("field: " + field.text);
                        const name = field.addOnData.getItem("name");
                        switch (name) {
                            case "Camera":
                                if (camera) field.fullContent.replaceText(camera, { start: 0, length: field.text.length });
                                break;
                            case "Shutter Speed":
                                if (shutterSpeed) field.fullContent.replaceText(shutterSpeed, { start: 0, length: field.text.length });
                                break;
                            case "ISO":
                                if (iso) field.fullContent.replaceText(iso, { start: 0, length: field.text.length });
                                break;
                            case "Lens":
                                if (lens) field.fullContent.replaceText(lens, { start: 0, length: field.text.length });
                                break;
                            case "Focal Length":
                                if (focalLength) field.fullContent.replaceText(focalLength, { start: 0, length: field.text.length });
                                break;
                        }
                    }
                    return;
                }
            }

            // Create a new group for EXIF data
            const exifGroup = editor.createGroup();
            exifGroup.addOnData.setItem("name", "EXIF Data");
            fields.forEach(({ label, value }, idx) => {
                const textField = editor.createText(`${label}: ${value}`);
                textField.addOnData.setItem("name", label);
                const contentModel = textField.fullContent;
                contentModel.applyCharacterStyles({
                    fontFamily: "Myriad Pro",
                    fontSize: textSize,
                    fill: { red: 1, green: 0, blue: 0, alpha: 1 }
                });
                textField.translation = { x: 100, y: 100 + idx * (textSize + 5) };
                exifGroup.children.append(textField);
            });
            editor.context.insertionParent.children.append(exifGroup);
        }
    };
    runtime.exposeApi(sandboxApi);
}

start();
