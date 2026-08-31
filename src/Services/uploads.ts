import axios from 'axios'
import { BASE_URL } from 'Constants'
import { UPLOADS_PRESIGN, UPLOAD_VIEW } from 'Constants/endpoints'
import { store } from 'Features/Store/store'
import type { ApiEnvelope } from 'Features/Schema/types'

/**
 * Services/uploads.ts — implements CONTRACT.md's "File uploads" flow.
 *
 * The bucket is private, so this is a two-way trip for every image:
 *  - presignUpload + putToPresignedUrl to write a file
 *  - getViewUrl (via useAssetUrl) to read one back for display
 *
 * `receiptUrl`/`photoUrl` on expenses/profiles store the `key` from the
 * presign response (not `fileUrl`) — the raw stored URL isn't fetchable
 * directly against a private bucket, so the key is what every consumer
 * needs anyway to ask for a view URL.
 */

export type UploadKind = 'receipt' | 'avatar'

export interface PresignResult {
  uploadUrl: string
  fileUrl: string
  key: string
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function authHeaders(): Record<string, string> {
  const token = store.getState().auth.accessToken
  return token ? { Authorization: `Bearer ${token}` } : {}
}

/** POST /uploads/presign — validates client-side too so bad files fail fast. */
export async function presignUpload(file: File, kind: UploadKind): Promise<PresignResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('That file is too large — 5MB max.')
  }
  if (!ALLOWED_CONTENT_TYPES.includes(file.type)) {
    throw new Error('Only JPEG, PNG, or WEBP images are allowed.')
  }

  const { data } = await axios.post<ApiEnvelope<PresignResult>>(
    `${BASE_URL}${UPLOADS_PRESIGN}`,
    { filename: file.name, contentType: file.type, kind },
    { headers: authHeaders() },
  )
  if (!data?.success || !data.data) {
    throw new Error(data?.error?.message ?? 'Could not start the upload.')
  }
  return data.data
}

/** PUT straight to the presigned URL — this leg is unauthenticated (the URL itself carries the auth). */
export async function putToPresignedUrl(uploadUrl: string, file: File): Promise<void> {
  await axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } })
}

/**
 * Convenience wrapper: presign + PUT in one call, returning the object key
 * to store as `receiptUrl`/`photoUrl`.
 */
export async function uploadImage(file: File, kind: UploadKind): Promise<string> {
  const presigned = await presignUpload(file, kind)
  await putToPresignedUrl(presigned.uploadUrl, file)
  return presigned.key
}

/**
 * GET /uploads/{key}/view — resolves a stored object key to a short-lived
 * viewable URL. CONTRACT.md leaves the exact response shape to whichever is
 * simpler for the backend to implement: a JSON envelope `{viewUrl}`, or a
 * 302 redirect straight to a presigned GET URL. This handles both: it first
 * tries to read `data.viewUrl` from the JSON response, and falls back to
 * fetching the resource as a blob (covers a transparent redirect landing on
 * the asset bytes) and handing back an object URL.
 */
export async function getViewUrl(key: string): Promise<string> {
  const headers = authHeaders()
  try {
    const { data } = await axios.get(`${BASE_URL}${UPLOAD_VIEW(key)}`, { headers })
    const envelope = data as ApiEnvelope<{ viewUrl: string }> | undefined
    if (envelope?.data?.viewUrl) return envelope.data.viewUrl
    if (typeof data === 'string' && /^https?:\/\//.test(data)) return data
  } catch {
    // fall through to the blob fetch below
  }
  const blobResponse = await axios.get(`${BASE_URL}${UPLOAD_VIEW(key)}`, { headers, responseType: 'blob' })
  return URL.createObjectURL(blobResponse.data as Blob)
}
