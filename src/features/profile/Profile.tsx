import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from 'react'
import Form from '../../shared/components/Form.tsx'
import Input from '../../shared/components/Input.tsx'
import { PostCard } from '../../shared/components/PostCard.tsx'
import type { Post } from '../feed/post.schema.ts'
import {
  fetchLikedPosts,
  fetchOwnPosts,
  fetchProfile,
  getProfileApiError,
  savePassword,
  saveProfile,
} from './profile.api.ts'
import type { Profile as ProfileData } from './profile.schema.ts'
import './Profile.css'

type IdentityFormData = {
  username: string
  email: string
}

type PasswordFormData = {
  currentPassword: string
  newPassword: string
}

const emptyIdentityForm: IdentityFormData = { username: '', email: '' }
const emptyPasswordForm: PasswordFormData = {
  currentPassword: '',
  newPassword: '',
}

function Profile(): ReactElement {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [ownPosts, setOwnPosts] = useState<Post[]>([])
  const [likedPosts, setLikedPosts] = useState<Post[]>([])
  const [identityForm, setIdentityForm] =
    useState<IdentityFormData>(emptyIdentityForm)
  const [passwordForm, setPasswordForm] =
    useState<PasswordFormData>(emptyPasswordForm)
  const [pageError, setPageError] = useState<string>('')
  const [identityMessage, setIdentityMessage] = useState<string>('')
  const [identityError, setIdentityError] = useState<string>('')
  const [passwordMessage, setPasswordMessage] = useState<string>('')
  const [passwordError, setPasswordError] = useState<string>('')
  const [isSavingIdentity, setIsSavingIdentity] = useState<boolean>(false)
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false)

  useEffect(() => {
    const controller = new AbortController()
    void Promise.all([
      fetchProfile(controller.signal),
      fetchOwnPosts(controller.signal),
      fetchLikedPosts(controller.signal),
    ])
      .then(([loadedProfile, loadedOwnPosts, loadedLikedPosts]) => {
        setProfile(loadedProfile)
        setOwnPosts(loadedOwnPosts)
        setLikedPosts(loadedLikedPosts)
        setIdentityForm({
          username: loadedProfile.username,
          email: loadedProfile.email,
        })
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setPageError(getProfileApiError(error).message)
        }
      })
    return () => controller.abort()
  }, [])

  function updateIdentity(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.currentTarget
    if (name !== 'username' && name !== 'email') {
      return
    }
    setIdentityForm((currentForm) => ({ ...currentForm, [name]: value }))
    setIdentityError('')
    setIdentityMessage('')
  }

  function updatePasswordField(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.currentTarget
    if (name !== 'currentPassword' && name !== 'newPassword') {
      return
    }
    setPasswordForm((currentForm) => ({ ...currentForm, [name]: value }))
    setPasswordError('')
    setPasswordMessage('')
  }

  async function submitIdentity(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setIsSavingIdentity(true)
    setIdentityError('')
    setIdentityMessage('')
    try {
      const updatedProfile = await saveProfile(
        identityForm.username,
        identityForm.email,
      )
      setProfile(updatedProfile)
      setIdentityForm({
        username: updatedProfile.username,
        email: updatedProfile.email,
      })
      localStorage.setItem('username', updatedProfile.username)
      window.dispatchEvent(new Event('profile-updated'))
      setIdentityMessage('Your profile has been updated.')
    } catch (error: unknown) {
      setIdentityError(getProfileApiError(error).message)
    } finally {
      setIsSavingIdentity(false)
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    setIsSavingPassword(true)
    setPasswordError('')
    setPasswordMessage('')
    try {
      await savePassword(passwordForm.currentPassword, passwordForm.newPassword)
      setPasswordForm(emptyPasswordForm)
      setPasswordMessage('Your password has been updated.')
    } catch (error: unknown) {
      setPasswordError(getProfileApiError(error).message)
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (pageError) {
    return <p className="profile-page-error" role="alert">{pageError}</p>
  }

  if (!profile) {
    return <p className="profile-page-loading">Loading profile...</p>
  }

  const memberSince = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'long',
  }).format(new Date(profile.createdAt))

  return (
    <div className="profile-page">
      <header className="profile-titlebar">
        <img src="/msn-boneco-vector-logo.png" alt="" />
        <span>My MiBLo profile</span>
      </header>

      <section className="profile-summary">
        <div className="profile-avatar" aria-hidden="true">
          {profile.username.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1>{profile.username}</h1>
          <p><span className="profile-online-dot" /> Online</p>
          <small>Member since {memberSince}</small>
        </div>
      </section>

      <div className="profile-forms">
        <Form className="profile-panel" onSubmit={submitIdentity} noValidate>
          <h2>Account information</h2>
          <Input
            label="Username"
            type="text"
            name="username"
            id="profile-username"
            className="profile-input"
            value={identityForm.username}
            onChange={updateIdentity}
            minLength={3}
            maxLength={30}
            autoComplete="username"
            required
          />
          <Input
            label="E-mail address"
            type="email"
            name="email"
            id="profile-email"
            className="profile-input"
            value={identityForm.email}
            onChange={updateIdentity}
            autoComplete="email"
            required
          />
          {identityError && <p className="profile-error" role="alert">{identityError}</p>}
          {identityMessage && <p className="profile-success" role="status">{identityMessage}</p>}
          <button type="submit" disabled={isSavingIdentity}>
            {isSavingIdentity ? 'Saving...' : 'Save information'}
          </button>
        </Form>

        <Form className="profile-panel" onSubmit={submitPassword} noValidate>
          <h2>Change password</h2>
          <Input
            label="Current password"
            type="password"
            name="currentPassword"
            id="current-password"
            className="profile-input"
            value={passwordForm.currentPassword}
            onChange={updatePasswordField}
            autoComplete="current-password"
            required
          />
          <Input
            label="New password"
            type="password"
            name="newPassword"
            id="new-password"
            className="profile-input"
            value={passwordForm.newPassword}
            onChange={updatePasswordField}
            minLength={8}
            autoComplete="new-password"
            required
          />
          {passwordError && <p className="profile-error" role="alert">{passwordError}</p>}
          {passwordMessage && <p className="profile-success" role="status">{passwordMessage}</p>}
          <button type="submit" disabled={isSavingPassword}>
            {isSavingPassword ? 'Saving...' : 'Change password'}
          </button>
        </Form>
      </div>

      <section className="profile-posts-panel">
        <header>
          <h2>My posts</h2>
          <span>{ownPosts.length}</span>
        </header>
        {ownPosts.length === 0 ? (
          <p className="profile-empty-posts">You have not created a post yet.</p>
        ) : (
          <ul className="profile-post-list">
            {ownPosts.map((post) => (
              <li key={post.id}><PostCard post={post} /></li>
            ))}
          </ul>
        )}
      </section>

      <section className="profile-posts-panel">
        <header>
          <h2>Liked posts</h2>
          <span>{likedPosts.length}</span>
        </header>
        {likedPosts.length === 0 ? (
          <p className="profile-empty-posts">You have not liked a post yet.</p>
        ) : (
          <ul className="profile-post-list">
            {likedPosts.map((post) => (
              <li key={post.id}>
                <PostCard
                  post={post}
                  onLikeChange={(isLiked) => {
                    if (!isLiked) {
                      setLikedPosts((posts) =>
                        posts.filter((likedPost) => likedPost.id !== post.id),
                      )
                    }
                  }}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default Profile
