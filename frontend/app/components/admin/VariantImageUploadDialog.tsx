"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon, Loader2, Star, Trash2, UploadCloud, X } from "lucide-react";
import axiosClient, { API_BASE_URL } from "@/lib/axios";

interface ProductImageUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  productName: string;
  onSuccess?: () => void;
}

interface ProductImageManagerProps {
  productId: number;
  productName: string;
  onSuccess?: () => void;
}

interface ExistingImage {
  id: number;
  imageUrl: string;
  isMain: boolean;
}

interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

const MAX_IMAGES_PER_PRODUCT = 4;

export function ProductImageManager({
  productId,
  productName,
  onSuccess,
}: ProductImageManagerProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const remainingSlots = MAX_IMAGES_PER_PRODUCT - existingImages.length;

  const previewItems = useMemo(
    () =>
      selectedFiles.map((file) => ({
        name: file.name,
        previewUrl: URL.createObjectURL(file),
      })),
    [selectedFiles]
  );

  useEffect(() => {
    return () => {
      previewItems.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, [previewItems]);

  const fetchExistingImages = useCallback(async () => {
    if (!productId) return;

    setIsLoadingImages(true);
    try {
      const response = await axiosClient.get<ApiSuccessResponse<ExistingImage[]>>(
        `/ProductImages/product/${productId}`
      );

      setExistingImages(
  Array.isArray(response.data) ? response.data : []
);
    } catch (error) {
      console.error("Loi lay danh sach anh:", error);
      setExistingImages([]);
    } finally {
      setIsLoadingImages(false);
    }
  }, [productId]);

  useEffect(() => {
    void fetchExistingImages();
  }, [fetchExistingImages]);

  const appendFiles = useCallback(
    (files: File[]) => {
      if (remainingSlots <= 0) {
        alert(`Moi san pham chi duoc toi da ${MAX_IMAGES_PER_PRODUCT} anh.`);
        return;
      }

      const acceptedFiles = files
        .filter((file) => file.type.startsWith("image/"))
        .slice(0, remainingSlots);

      if (acceptedFiles.length < files.length) {
        alert(`Chi co the them toi da ${remainingSlots} anh nua cho san pham nay.`);
      }

      setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
    },
    [remainingSlots]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      if (event.dataTransfer.files?.length) {
        appendFiles(Array.from(event.dataTransfer.files));
      }
    },
    [appendFiles]
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) {
      appendFiles(Array.from(event.target.files));
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, fileIndex) => fileIndex !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !productId) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("ProductId", productId.toString());
      selectedFiles.forEach((file) => formData.append("Files", file));

      await axiosClient.post("/ProductImages/upload", formData);

      setSelectedFiles([]);
      await fetchExistingImages();
      onSuccess?.();
      alert("Tai anh len thanh cong.");
    } catch (error) {
      console.error("Loi upload anh:", error);
      alert("Co loi xay ra khi tai anh len.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteExistingImage = async (imageId: number) => {
    if (!window.confirm("Ban co chac muon xoa anh nay?")) return;

    try {
      await axiosClient.delete(`/ProductImages/${imageId}`);
      await fetchExistingImages();
      onSuccess?.();
    } catch (error) {
      console.error("Loi xoa anh:", error);
      alert("Loi khi xoa anh.");
    }
  };

  const handleSetMainImage = async (imageId: number) => {
    try {
      await axiosClient.put(`/ProductImages/${imageId}/set-main`);
      await fetchExistingImages();
      onSuccess?.();
    } catch (error) {
      console.error("Loi dat anh chinh:", error);
      alert("Khong the dat anh chinh luc nay.");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="space-y-4 border-r border-zinc-100 pr-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-800">Tai anh san pham</h3>
            <p className="text-xs text-zinc-500">{productName || `San pham #${productId}`}</p>
          </div>
          <span className="text-xs text-zinc-500">
            {existingImages.length + selectedFiles.length}/{MAX_IMAGES_PER_PRODUCT} anh
          </span>
        </div>

        <div
          className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-zinc-300 hover:bg-zinc-50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <UploadCloud
            className={`mx-auto mb-2 h-8 w-8 ${
              isDragging ? "text-blue-500" : "text-zinc-400"
            }`}
          />
          <p className="text-sm font-medium text-zinc-700">
            Keo tha hoac <span className="text-blue-600">bam chon</span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Toi da {MAX_IMAGES_PER_PRODUCT} anh. Anh dau tien se la anh chinh.
          </p>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Dang cho tai len ({selectedFiles.length})
            </p>
            <div className="grid max-h-40 grid-cols-3 gap-2 overflow-y-auto">
              {previewItems.map((item, index) => (
                <div
                  key={`${item.name}-${index}`}
                  className="group relative aspect-square overflow-hidden rounded-md border bg-zinc-50"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.previewUrl} alt={item.name} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(index)}
                    className="absolute right-1 top-1 rounded-full bg-red-500/80 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {existingImages.length === 0 && index === 0 && (
                    <span className="absolute left-0 top-0 rounded-br-md bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      Anh chinh
                    </span>
                  )}
                </div>
              ))}
            </div>
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isUploading}
              onClick={handleUpload}
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Dang xu ly...
                </>
              ) : (
                "Xac nhan tai len"
              )}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-zinc-800">Anh da luu</h3>

        <div className="min-h-64 rounded-lg border border-zinc-100 bg-zinc-50 p-4">
          {isLoadingImages ? (
            <div className="flex h-full items-center justify-center text-zinc-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : existingImages.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {existingImages.map((img) => (
                <div
                  key={img.id}
                  className="group relative aspect-square overflow-hidden rounded-md border bg-white shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${API_BASE_URL}${img.imageUrl}`}
                    alt="product"
                    className="h-full w-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = "/placeholder-image.png";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleSetMainImage(img.id)}
                    title="Dat lam anh chinh"
                    className={`absolute bottom-1 left-1 rounded-md border p-1.5 transition-opacity ${
                      img.isMain
                        ? "border-amber-200 bg-amber-50 text-amber-600"
                        : "border-zinc-200 bg-white/90 text-zinc-500 opacity-0 group-hover:opacity-100 hover:bg-amber-50 hover:text-amber-600"
                    }`}
                  >
                    <Star className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteExistingImage(img.id)}
                    title="Xoa anh"
                    className="absolute bottom-1 right-1 rounded-md border border-red-100 bg-white/90 p-1.5 text-red-500 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {img.isMain && (
                    <span className="absolute left-0 top-0 rounded-br-md bg-blue-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      Anh chinh
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center space-y-2 pt-10 text-center text-zinc-400">
              <ImageIcon className="h-8 w-8 opacity-20" />
              <p className="text-sm">Chua co anh nao.</p>
              <p className="text-xs">Anh dau tien ban tai len se duoc dat lam anh chinh.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function VariantImageUploadDialog({
  open,
  onOpenChange,
  productId,
  productName,
  onSuccess,
}: ProductImageUploadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Quan ly hinh anh san pham</DialogTitle>
          <DialogDescription>
            Them, xoa va chon anh chinh cho san pham.
          </DialogDescription>
        </DialogHeader>
        <ProductImageManager
          productId={productId}
          productName={productName}
          onSuccess={onSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
