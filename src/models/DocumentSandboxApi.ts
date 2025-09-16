// This interface declares all the APIs that the document sandbox runtime ( i.e. code.ts ) exposes to the UI/iframe runtime
export interface DocumentSandboxApi {
    /**
     * Apply EXIF data as text fields in the document.
     * @param exifData Object containing Camera, Shutter Speed, ISO, Lens, and Focal Length
     */
    applyExifData(exifData: {
        camera: string;
        shutterSpeed: string;
        iso: string;
        lens: string;
        focalLength: string;
    }): void;
}
