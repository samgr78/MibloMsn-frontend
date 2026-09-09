import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from 'react'
import { api } from '../../api/axios.tsx'
import Form from '../../shared/components/Form.tsx'
import Input from '../../shared/components/Input.tsx'
import Modal from '../../shared/components/Modal.tsx'
import {
  getCreatePostErrorMessage,
  parseImageUrl,
} from './createPost.parsers.ts'
import './CreatePost.css'

type CreatePostProps = {
  onPostCreated: () => void
}

function CreatePost({ onPostCreated }: CreatePostProps): ReactElement {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [content, setContent] = useState<string>('')
  const [image, setImage] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  function openModal(): void {
    setFormError(null)
    setSuccessMessage(null)
    setIsModalOpen(true)
  }

  function closeModal(): void {
    setIsModalOpen(false)
  }

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>): void {
    setContent(event.currentTarget.value)
    setFormError(null)
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>): void {
    const selectedImage = event.currentTarget.files?.[0] ?? null

    if (selectedImage && !selectedImage.type.startsWith('image/')) {
      setImage(null)
      setFormError('Please select a valid image file.')
      return
    }

    setImage(selectedImage)
    setFormError(null)
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault()

    const token = localStorage.getItem('token')
    if (!token) {
      setFormError('You must be logged in to create a post.')
      return
    }

    if (!image) {
      setFormError('Please select an image.')
      return
    }

    const requestData = new FormData()
    requestData.append('content', content)
    requestData.append('image', image)

    setFormError(null)
    setIsSubmitting(true)

    try {
      const { data }: { data: unknown } = await api.post<unknown>(
        '/posts',
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        },
      )

      if (!parseImageUrl(data)) {
        setFormError('The server did not return a valid image URL.')
        return
      }

      setContent('')
      setImage(null)
      setSuccessMessage('Post created successfully.')
      closeModal()
      onPostCreated()
    } catch (error: unknown) {
      setFormError(getCreatePostErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="create-post">
      <button
        type="button"
        className="create-post-button"
        onClick={openModal}
      >
        Create a post
      </button>

      {successMessage && (
        <p className="create-post-success" role="status">
          {successMessage}
        </p>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title="Create a post"
      >
        <Form className="modal-form" onSubmit={handleSubmit}>
          <Input
            label="Image"
            type="file"
            name="image"
            className="modal-input"
            accept="image/*"
            onChange={handleImageChange}
            required
          />

          <label className="modal-content-field" htmlFor="post-content">
            Content
            <textarea
              id="post-content"
              name="content"
              className="modal-textarea"
              placeholder="Your text..."
              value={content}
              onChange={handleContentChange}
              required
            />
          </label>

          {formError && (
            <span className="modal-error-message" role="alert">
              {formError}
            </span>
          )}

          <button
            className="modal-submit-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Sending...' : 'Send'}
          </button>
        </Form>
      </Modal>
    </div>
  )
}

export default CreatePost
