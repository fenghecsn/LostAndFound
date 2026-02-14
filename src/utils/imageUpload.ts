import { uploadImageApi } from '@/api/Img'

export const extractUploadedUrl = (response: any): string => {
  const data = response?.data
  if (!data) return ''
  const payload = data?.data ?? data
  if (typeof payload === 'string') return payload

  return (
    payload?.url ||
    payload?.image_url ||
    payload?.img ||
    payload?.path ||
    payload?.file_url ||
    data?.url ||
    ''
  )
}

export const uploadImagesAndGetUrls = async (files: File[]) => {
  if (files.length === 0) return []

  const uploadedUrls: string[] = []
  for (const file of files) {
    const formData = new FormData()
    formData.append('file', file)

    const response = await uploadImageApi(formData)
    const url = extractUploadedUrl(response)
    if (!url) {
      throw new Error('上传图片成功但未返回可用URL')
    }

    uploadedUrls.push(url)
  }

  return uploadedUrls
}
