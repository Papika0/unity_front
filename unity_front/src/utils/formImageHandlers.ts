/**
 * Form Image Handlers
 * Utilities for handling file uploads and image previews in forms
 */

export interface FormWithImages {
  main_image: File | null
  render_image: File | null
  gallery_images: File[]
  existing_gallery_images?: string[]
}

export interface ImagePreviews {
  main_image: string
  render_image: string
  gallery_images: string[]
}

/**
 * Handle single file change for main or render image
 */
export function handleFileChange<T extends FormWithImages, P extends ImagePreviews>(
  form: T,
  previews: P,
  fieldName: 'main_image' | 'render_image',
  files: FileList | null,
) {
  if (files && files[0]) {
    const file = files[0]
    form[fieldName] = file
    previews[fieldName] = URL.createObjectURL(file)
  }
}

/**
 * Handle gallery image addition
 */
export function handleGalleryChange<T extends FormWithImages, P extends ImagePreviews>(
  form: T,
  previews: P,
  files: FileList | null,
  isEdit = false,
) {
  if (!files) return

  const fileArray = Array.from(files)
  form.gallery_images = [...form.gallery_images, ...fileArray]

  if (isEdit && form.existing_gallery_images) {
    const newFilePreviews = form.gallery_images.map((file) => URL.createObjectURL(file))
    previews.gallery_images = [...form.existing_gallery_images, ...newFilePreviews]
  } else {
    previews.gallery_images = form.gallery_images.map((file) => URL.createObjectURL(file))
  }
}

/**
 * Remove a gallery image by index
 */
export function removeGalleryImage<T extends FormWithImages, P extends ImagePreviews>(
  form: T,
  previews: P,
  index: number,
  isEdit = false,
) {
  if (isEdit && form.existing_gallery_images) {
    if (index < form.existing_gallery_images.length) {
      form.existing_gallery_images.splice(index, 1)
    } else {
      const newImageIndex = index - form.existing_gallery_images.length
      form.gallery_images.splice(newImageIndex, 1)
    }
    const newFilePreviews = form.gallery_images.map((file) => URL.createObjectURL(file))
    previews.gallery_images = [...form.existing_gallery_images, ...newFilePreviews]
  } else {
    form.gallery_images.splice(index, 1)
    previews.gallery_images = form.gallery_images.map((file) => URL.createObjectURL(file))
  }
}
