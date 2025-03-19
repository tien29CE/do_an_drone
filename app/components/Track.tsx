"use client";

import React, { useState } from "react";
import Image from "next/image";
const Track: React.FC = () => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Function to handle image selection (optional)
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImageSrc(URL.createObjectURL(event.target.files[0]));
    }
  };

  return (
      /* Image Display Section */
      <div className="  rounded-lg">
        <h2 className="text-lg font-semibold mb-2"> Picture Display</h2>

        {/* Image Preview */}
        {imageSrc ? (
          <Image src={imageSrc} alt="Uploaded Preview" width={0} height={0} sizes="100vw" className="w-full h-auto rounded-lg" />
        ) : (
          <p className="text-gray-500">No image uploaded</p>
        )}

        {/* Upload Button */}
        <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-4" />
      </div>
  );
};

export default Track;
