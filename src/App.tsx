import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { SWClient } from "./SwClient";

const queryClient = new QueryClient();

function ImageGallery() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Fetch images using TanStack Query
  const {
    data: images = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["images"],
    queryFn: async () => {
      return SWClient.sw.images.$get().then((r) => r.json());
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    await uploadFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await uploadFiles(files);
  };

  const uploadFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setUploadStatus("Uploading...");

    try {
      await Promise.all(
        files.map((file) =>
          SWClient.sw.upload.$post({
            form: { file },
          }),
        ),
      );

      setUploadStatus(`Successfully uploaded ${files.length} image(s)!`);
      setTimeout(() => setUploadStatus(""), 3000);

      // Refetch images after upload
      refetch();
    } catch (error) {
      setUploadStatus("Upload failed. Please try again.");
      setTimeout(() => setUploadStatus(""), 3000);
    }
  };

  const openModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
    dialogRef.current?.showModal();
  };

  const closeModal = () => {
    dialogRef.current?.close();
    setSelectedImage(null);
  };

  const deleteImage = async (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening modal when clicking delete

    // Extract the image ID from the URL (e.g., "/sw/image/1234567890-photo.webp" -> "1234567890-photo.webp")
    const id = imageUrl.split("/").pop();

    if (!id) return;

    try {
      const response = await SWClient.sw.image[":id"].$delete({ param: { id } });

      if (response.ok) {
        // Refetch images after successful delete
        refetch();
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-3 tracking-tight">Image Gallery</h1>
          <p className="text-slate-400 text-lg">Upload and manage your images</p>
        </div>

        {/* Upload Area */}
        <div
          className={`
            relative mb-12 rounded-2xl border-2 border-dashed transition-all duration-200
            ${
              isDragging
                ? "border-blue-400 bg-blue-950/50 scale-[1.02]"
                : "border-slate-600 bg-slate-800/50 hover:border-slate-500"
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="p-12 text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-16 w-16 text-slate-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="mb-4">
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-lg shadow-blue-900/50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                  />
                </svg>
                Choose Files
              </label>
              <input
                id="file-upload"
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>

            <p className="text-slate-300 text-lg font-medium mb-2">or drag and drop images here</p>
            <p className="text-slate-500 text-sm">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>

        {/* Upload Status */}
        {uploadStatus && (
          <div className="mb-8 p-4 bg-slate-800/80 border border-slate-700 rounded-xl text-center">
            <p className="text-slate-200">{uploadStatus}</p>
          </div>
        )}

        {/* Gallery Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Your Images
            <span className="ml-3 text-sm font-normal text-slate-400">
              ({images.length} {images.length === 1 ? "image" : "images"})
            </span>
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-4/3 bg-slate-800/50 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-16 px-4 bg-slate-800/30 rounded-2xl border border-slate-700/50">
              <svg
                className="mx-auto h-12 w-12 text-slate-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-slate-400 text-lg">No images yet</p>
              <p className="text-slate-500 text-sm mt-2">Upload some images to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {images.map((imageUrl, index) => (
                <div
                  key={index}
                  className="group relative aspect-4/3 bg-slate-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                  onClick={() => openModal(imageUrl)}
                >
                  <img src={imageUrl} alt={`Gallery image ${index + 1}`} className="w-full h-full object-cover" />

                  {/* Delete Button */}
                  <button
                    onClick={(e) => deleteImage(imageUrl, e)}
                    className="absolute top-2 right-2 p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg cursor-pointer opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-lg hover:scale-110 z-10"
                    aria-label="Delete image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white text-sm font-medium">Image {index + 1}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image Modal */}
        <dialog
          ref={dialogRef}
          className="w-full h-full max-w-full max-h-full sm:w-[95vw] sm:h-[95vh] sm:max-w-[95vw] sm:max-h-[95vh] bg-transparent backdrop:bg-black/90 p-0 m-auto"
          onClick={(e) => {
            // Close when clicking on the backdrop (the dialog itself, not its contents)
            if (e.target === dialogRef.current) {
              closeModal();
            }
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center p-2 sm:p-4">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 p-3 bg-black/70 hover:bg-black/90 text-white rounded-full transition-colors backdrop-blur-sm shadow-xl"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Container */}
            {selectedImage && <img src={selectedImage} alt="Full size view" className="w-full h-full object-contain" />}
          </div>
        </dialog>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ImageGallery />
    </QueryClientProvider>
  );
}
