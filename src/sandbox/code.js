import addOnSandboxSdk from "add-on-sdk-document-sandbox";
import { editor, fonts, colorUtils } from "express-document-sdk";

const { runtime } = addOnSandboxSdk.instance;
const font = await fonts.fromPostscriptName("MyriadPro-Regular");
const docWidth = editor.context.insertionParent.width || 800;

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
        applyExifData: ({ camera, shutterSpeed, iso, lens, focalLength, textSize, textColor }) => {
            const insertionParent = editor.context.insertionParent;
            const fields = [
                { label: "Camera", value: camera },
                { label: "Shutter Speed", value: shutterSpeed },
                { label: "ISO", value: iso },
                { label: "Lens", value: lens },
                { label: "Focal Length", value: focalLength }
            ];

            // Uncomment when replacetext is supported
            // This will allow the user to update the exif data in the current fields
            // instead of creating a new group each time.
            // // Check to see if exifGroup already exists
            // let i = 0;
            // for (const child of editor.context.insertionParent.children) {
            //     if (child.addOnData.getItem("name") === "EXIF Data") {
            //         for (const field of child.children) {
            //             console.log("field: " + field.text);
            //             const name = field.addOnData.getItem("name");
            //             switch (name) {
            //                 case "Camera":
            //                     if (camera) field.fullContent.replaceText(camera, { start: 0, length: field.text.length });
            //                     break;
            //                 case "Shutter Speed":
            //                     if (shutterSpeed) field.fullContent.replaceText(shutterSpeed, { start: 0, length: field.text.length });
            //                     break;
            //                 case "ISO":
            //                     if (iso) field.fullContent.replaceText(iso, { start: 0, length: field.text.length });
            //                     break;
            //                 case "Lens":
            //                     if (lens) field.fullContent.replaceText(lens, { start: 0, length: field.text.length });
            //                     break;
            //                 case "Focal Length":
            //                     if (focalLength) field.fullContent.replaceText(focalLength, { start: 0, length: field.text.length });
            //                     break;
            //             }
            //         }
            //         return;
            //     }
            // }

            // Create a new group for EXIF data
            const exifGroup = editor.createGroup();
            exifGroup.addOnData.setItem("name", "EXIF Data");
            fields.forEach(({ label, value }, idx) => {
                if (!value || !value.trim()) return; // Skip empty values

                const textField = editor.createText(`${value}`);
                textField.addOnData.setItem("name", label);
                const contentModel = textField.fullContent;
                let color = { red: 1, green: 1, blue: 1, alpha: 1 };
                if (textColor) {
                    try {
                        color = colorUtils.fromHex(textColor);
                    } catch (e) {
                        // fallback to default white
                    }
                }

                contentModel.applyCharacterStyles({
                    font: font,
                    fontSize: textSize,
                    color: color,
                });
                textField.translation = { x: 0, y: 0 + idx * (textSize + 15) };
                exifGroup.translation = {
                    x: docWidth / 2,
                    y: docWidth / 2
                };
                exifGroup.children.append(textField);
            });
            editor.context.insertionParent.children.append(exifGroup);
        },

        validateExifField: (field, value) => {
            if (field === "shutterSpeed") {
                // Accept numbers or fractions like '1/125'
                const isNumber = !isNaN(Number(value));
                const isFraction = /^\d+\s*\/\s*\d+$/.test(value);
                if (!isNumber && !isFraction) {
                    return "Shutter Speed should be a number or a fraction (e.g., 1/125).";
                }
            }

            if (field === "iso" && isNaN(Number(value))) {
                return "ISO should be a number.";
            }

            if (field === "focalLength" && value.trim() !== "") {
                // Require format: number followed by 'mm', e.g., '50mm'
                const focalLengthPattern = /^\d+(\.\d+)?\s*mm$/i;
                if (!focalLengthPattern.test(value.trim())) {
                    return "Focal Length should be a number followed by 'mm' (e.g., 50mm).";
                }
            }

            return true;
        }
    };

    runtime.exposeApi(sandboxApi);
}

start();
