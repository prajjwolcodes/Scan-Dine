import React from "react";

const ImageUploader = () => {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await res.json();
      if (data.secure_url) {
        setMenuForm({ ...menuForm, image: data.secure_url });
        toast.success("Image uploaded!");
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      toast.error("Image upload failed");
    } finally {
      setUploading(false);
    }
  };
  return (
    <div>
      <div className="space-y-2">
        <Label>Upload Image</Label>
        <Input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={uploading}
        />
        {uploading && <p className="text-sm text-gray-500">Uploading...</p>}
        {menuForm.image && (
          <img
            src={menuForm.image}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-md mt-2"
          />
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
