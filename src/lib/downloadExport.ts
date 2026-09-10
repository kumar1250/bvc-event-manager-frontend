import { apiClient } from "@/lib/apiClient"

export async function downloadExport(url: string, filename: string) {
  const res = await apiClient.get(url, { responseType: "blob" })
  const blobUrl = window.URL.createObjectURL(res.data)
  const a = document.createElement("a")
  a.href = blobUrl
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(blobUrl)
}
