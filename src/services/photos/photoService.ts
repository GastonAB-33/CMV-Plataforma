export const photoService = {
  isCameraCaptureSupported(): boolean {
    return typeof window !== 'undefined' && !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },

  getInputCaptureAttributes(): { accept: string; capture?: 'environment' } {
    return {
      accept: 'image/*',
      capture: 'environment',
    };
  },

  createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  },

  revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  },
};

