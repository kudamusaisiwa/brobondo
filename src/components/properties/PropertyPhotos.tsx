import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { usePropertyStore } from '../../store/propertyStore';
import { uploadToCloudinary, deleteFromCloudinary } from '../../lib/cloudinary';
import toast from 'react-hot-toast';

interface PropertyPhotosProps {
  propertyId: string;
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
}

export default function PropertyPhotos({ propertyId, photos, onPhotosChange }: PropertyPhotosProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateProperty } = usePropertyStore();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Starting photo upload process...');
    const files = event.target.files;
    if (!files) return;

    const remainingSlots = 10 - photos.length;
    if (remainingSlots <= 0) {
      toast.error('Maximum 10 photos allowed');
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    setUploading(true);

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        return uploadToCloudinary(file, `properties/${propertyId}/photos`);
      });

      const newPhotoUrls = await Promise.all(uploadPromises);
      console.log('Uploaded photos:', newPhotoUrls);
      
      const updatedPhotos = [...photos, ...newPhotoUrls];
      console.log('Updated photos array:', updatedPhotos);
      
      await updateProperty(propertyId, { photos: updatedPhotos });
      onPhotosChange(updatedPhotos);
      toast.success('Photos uploaded successfully');
    } catch (error) {
      console.error('Error uploading photos:', error);
      toast.error('Failed to upload photos');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeletePhoto = async (photoUrl: string, index: number) => {
    try {
      // Only update the database by removing the photo URL
      const updatedPhotos = photos.filter((_, i) => i !== index);
      await updateProperty(propertyId, { photos: updatedPhotos });
      onPhotosChange(updatedPhotos);
      toast.success('Photo removed successfully');
    } catch (error) {
      console.error('Error removing photo:', error);
      toast.error('Failed to remove photo');
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Property Photos ({photos.length}/10)
        </h3>
        <label className={`
          inline-flex items-center px-4 py-2 rounded-md
          ${photos.length >= 10 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-primary-600 hover:bg-primary-700 cursor-pointer'}
          text-white text-sm font-medium transition-colors
        `}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Photos
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading || photos.length >= 10}
          />
        </label>
      </div>

      {uploading && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Uploading photos...
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative group">
            <img
              src={photo}
              alt={`Property photo ${index + 1}`}
              className="w-full h-32 object-cover rounded-lg"
            />
            <button
              onClick={() => handleDeletePhoto(photo, index)}
              className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {photos.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No photos uploaded yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
