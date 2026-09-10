import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from 'react'
import { api } from '../../api/axios.tsx'
import Form from '../../shared/components/Form.tsx'
import Input from '../../shared/components/Input.tsx'
import Modal from '../../shared/components/Modal.tsx'
import { getCreatePostErrorMessage, parseCreatedPost } from './createPost.parsers.ts'
import type { Post } from './post.schema.ts'
import './CreatePost.css'

const MAX_POST_LENGTH = 1_000
const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

type CreatePostProps = {
  onPostCreated: (post: Post) => void
}

function CreatePost({ onPostCreated }: CreatePostProps): ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewUrlRef = useRef<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
  }, [])

  function replacePreview(file: File | null): void {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    previewUrlRef.current = file ? URL.createObjectURL(file) : null
    setPreviewUrl(previewUrlRef.current)
  }

  function openModal(): void {
    setFormError(null)
    setSuccessMessage(null)
    setIsModalOpen(true)
  }

  function closeModal(): void {
    if (!isSubmitting) setIsModalOpen(false)
  }

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    setContent(event.currentTarget.value)
    setFormError(null)
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>): void {
    const selectedImage = event.currentTarget.files?.[0] ?? null
    if (selectedImage && !ALLOWED_IMAGE_TYPES.has(selectedImage.type)) {
      event.currentTarget.value = ''
      setImage(null)
      replacePreview(null)
      setFormError('Choose a JPEG, PNG, WebP or GIF image.')
      return
    }
    if (selectedImage && selectedImage.size > MAX_IMAGE_SIZE) {
      event.currentTarget.value = ''
      setImage(null)
      replacePreview(null)
      setFormError('The image must not exceed 5 MB.')
      return
    }
    setImage(selectedImage)
    replacePreview(selectedImage)
    setFormError(null)
  }

  function removeImage(): void {
    setImage(null)
    replacePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    const trimmedContent = content.trim()
    if (!trimmedContent) {
      setFormError('Write something before publishing.')
      return
    }
    if (trimmedContent.length > MAX_POST_LENGTH) {
      setFormError(`The post must not exceed ${MAX_POST_LENGTH} characters.`)
      return
    }

    const requestData = new FormData()
    requestData.append('content', trimmedContent)
    if (image) requestData.append('image', image)

    setFormError(null)
    setIsSubmitting(true)
    try {
      const { data }: { data: unknown } = await api.post<unknown>('/posts', requestData)
      const createdPost = parseCreatedPost(data)
      if (!createdPost) {
        setFormError('The server returned an invalid post.')
        return
      }
      setContent('')
      removeImage()
      setSuccessMessage('Post created successfully.')
      setIsModalOpen(false)
      onPostCreated(createdPost)
    } catch (error: unknown) {
      setFormError(getCreatePostErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="create-post">
      <button type="button" className="create-post-button" onClick={openModal}>
        <span className="create-post-button-icon" aria-hidden="true">+</span>
        <span>Create a post</span>
      </button>

      {successMessage && <p className="create-post-success" role="status">{successMessage}</p>}

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Create a post">
        <Form className="modal-form" onSubmit={handleSubmit} noValidate>
          <label className="modal-content-field" htmlFor="post-content">
            Content
            <textarea
              id="post-content"
              name="content"
              className="modal-textarea"
              placeholder="Your text..."
              value={content}
              onChange={handleContentChange}
              maxLength={MAX_POST_LENGTH}
              required
            />
          </label>
          <span className="create-post-counter">{content.length}/{MAX_POST_LENGTH}</span>

          <Input
            ref={fileInputRef}
            label="Image (optional)"
            type="file"
            name="image"
            className="modal-input"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
          />
          {previewUrl && (
            <div className="create-post-preview">
              <img src={previewUrl} alt="Preview of the selected upload" />
              <button type="button" onClick={removeImage}>Remove image</button>
            </div>
          )}

          {formError && <span className="modal-error-message" role="alert">{formError}</span>}
          <button className="modal-submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Publish'}
          </button>
        </Form>
      </Modal>
    </div>
  )
}

export default CreatePost
