const API_BASE_URL = 'http://localhost:3001';

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
    if (url && url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  },

  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  },

  async uploadBrotherPhoto(brotherId: string, file: File): Promise<string> {
    const base64 = await this.fileToBase64(file);
    try {
      const response = await fetch(`${API_BASE_URL}/api/hermanos/${encodeURIComponent(brotherId)}/foto`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ photoBase64: base64 }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const json = await response.json();
      if (json.ok && json.data?.photoUrl) {
        return json.data.photoUrl;
      }
      return base64;
    } catch (err) {
      console.warn('Backend API no disponible para foto, usando base64 local:', err);
      return base64;
    }
  },
};
