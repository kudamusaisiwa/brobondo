export const uploadToCloudinary = async (file: Blob, folder = 'invoices') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);
  formData.append('resource_type', 'auto'); // Auto-detect file type

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
      { method: 'POST', body: formData }
    );
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Cloudinary upload failed:', error);
      throw new Error(error.message || 'Failed to upload document');
    }

    const data = await response.json();
    console.log('Cloudinary upload successful:', {
      url: data.secure_url,
      fileType: data.resource_type,
      format: data.format,
      size: data.bytes
    });
    
    return data.secure_url;
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw error instanceof Error ? error : new Error('Failed to upload document');
  }
};
