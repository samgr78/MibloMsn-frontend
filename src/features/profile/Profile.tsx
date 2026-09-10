import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactElement,
} from 'react'
import { Link, useParams } from 'react-router-dom'
import Form from '../../shared/components/Form.tsx'
import Input from '../../shared/components/Input.tsx'
import { PostCard } from '../../shared/components/PostCard.tsx'
import { getCurrentUserId } from '../auth/session.ts'
import { DeleteCommentButton } from '../comments/DeleteCommentButton.tsx'
import type { Post } from '../feed/post.schema.ts'
import {
  fetchLikedPosts,
  fetchOwnComments,
  fetchOwnPosts,
  fetchProfile,
  fetchPublicProfile,
  fetchUserPosts,
  getProfileApiError,
  savePassword,
  saveProfile,
} from './profile.api.ts'
import type { Profile as ProfileData, ProfileComment } from './profile.schema.ts'
import './Profile.css'

type PostSection = 'own' | 'liked' | 'comments'
type LoadedProfile = {
  profile: ProfileData
  posts: Post[]
  likedPosts: Post[]
  comments: ProfileComment[]
}
type ProfileState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error'; message: string }
  | ({ status: 'success' } & LoadedProfile)

function ProfilePostList({
  posts,
  emptyMessage,
  canDelete,
  onDelete,
  onUnlike,
}: {
  posts: Post[]
  emptyMessage: string
  canDelete: boolean
  onDelete: (postId: string) => void
  onUnlike?: (postId: string) => void
}): ReactElement {
  if (posts.length === 0) return <p className="profile-empty-posts">{emptyMessage}</p>
  return (
    <ul className="profile-post-list">
      {posts.map((post) => (
        <li key={post.id}>
          <PostCard
            post={post}
            onDelete={canDelete ? () => onDelete(post.id) : undefined}
            onLikeChange={onUnlike ? (liked) => { if (!liked) onUnlike(post.id) } : undefined}
          />
        </li>
      ))}
    </ul>
  )
}

function ProfileCommentList({
  comments,
  onDelete,
}: {
  comments: ProfileComment[]
  onDelete: (commentId: string) => void
}): ReactElement {
  if (comments.length === 0) {
    return <p className="profile-empty-posts">You have not written a comment yet.</p>
  }
  return (
    <ul className="profile-comment-list">
      {comments.map((comment) => (
        <li key={comment.id}>
          <header>
            <strong>Comment on:</strong>
            <Link to={`/posts/${comment.post.id}`}>{comment.post.content}</Link>
            <time dateTime={comment.createdAt}>
              {new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium' }).format(new Date(comment.createdAt))}
            </time>
          </header>
          <p>{comment.content}</p>
          <DeleteCommentButton commentId={comment.id} onDeleted={() => onDelete(comment.id)} />
        </li>
      ))}
    </ul>
  )
}

function ProfileContent({ userId }: { userId?: string }): ReactElement {
  const isOwner = !userId || userId === getCurrentUserId()
  const [state, setState] = useState<ProfileState>({ status: 'loading' })
  const [activeSection, setActiveSection] = useState<PostSection>('own')
  const [identityForm, setIdentityForm] = useState({ username: '', email: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' })
  const [identityFeedback, setIdentityFeedback] = useState({ error: '', success: '' })
  const [passwordFeedback, setPasswordFeedback] = useState({ error: '', success: '' })
  const [isSavingIdentity, setIsSavingIdentity] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function load(): Promise<LoadedProfile> {
      if (isOwner) {
        const [profile, posts, likedPosts, comments] = await Promise.all([
          fetchProfile(controller.signal),
          fetchOwnPosts(controller.signal),
          fetchLikedPosts(controller.signal),
          fetchOwnComments(controller.signal),
        ])
        return { profile, posts, likedPosts, comments }
      }
      const [profile, posts] = await Promise.all([
        fetchPublicProfile(userId!, controller.signal),
        fetchUserPosts(userId!, controller.signal),
      ])
      return { profile, posts, likedPosts: [], comments: [] }
    }

    void load()
      .then((loaded) => {
        localStorage.setItem(isOwner ? 'userId' : 'lastViewedUserId', loaded.profile.id)
        if (isOwner) {
          setIdentityForm({ username: loaded.profile.username, email: loaded.profile.email ?? '' })
        }
        setState({ status: 'success', ...loaded })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        const apiError = getProfileApiError(error)
        setState(apiError.status === 404
          ? { status: 'not-found' }
          : { status: 'error', message: apiError.message })
      })
    return () => controller.abort()
  }, [isOwner, userId])

  function updateIdentity(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.currentTarget
    if (name === 'username' || name === 'email') {
      setIdentityForm((form) => ({ ...form, [name]: value }))
      setIdentityFeedback({ error: '', success: '' })
    }
  }

  function updatePassword(event: ChangeEvent<HTMLInputElement>): void {
    const { name, value } = event.currentTarget
    if (name === 'currentPassword' || name === 'newPassword') {
      setPasswordForm((form) => ({ ...form, [name]: value }))
      setPasswordFeedback({ error: '', success: '' })
    }
  }

  async function submitIdentity(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (identityForm.username.trim().length < 3 || identityForm.username.trim().length > 30) {
      setIdentityFeedback({ error: 'Username must contain between 3 and 30 characters.', success: '' })
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identityForm.email.trim())) {
      setIdentityFeedback({ error: 'Enter a valid email address.', success: '' })
      return
    }
    setIsSavingIdentity(true)
    setIdentityFeedback({ error: '', success: '' })
    try {
      const profile = await saveProfile(identityForm.username, identityForm.email)
      setState((current) => current.status === 'success' ? { ...current, profile } : current)
      localStorage.setItem('username', profile.username)
      window.dispatchEvent(new Event('profile-updated'))
      setIdentityFeedback({ error: '', success: 'Your profile has been updated.' })
    } catch (error: unknown) {
      setIdentityFeedback({ error: getProfileApiError(error).message, success: '' })
    } finally {
      setIsSavingIdentity(false)
    }
  }

  async function submitPassword(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault()
    if (passwordForm.newPassword.length < 8 || passwordForm.newPassword.length > 128) {
      setPasswordFeedback({ error: 'The new password must contain between 8 and 128 characters.', success: '' })
      return
    }
    setIsSavingPassword(true)
    setPasswordFeedback({ error: '', success: '' })
    try {
      await savePassword(passwordForm.currentPassword, passwordForm.newPassword)
      setPasswordForm({ currentPassword: '', newPassword: '' })
      setPasswordFeedback({ error: '', success: 'Your password has been updated.' })
    } catch (error: unknown) {
      setPasswordFeedback({ error: getProfileApiError(error).message, success: '' })
    } finally {
      setIsSavingPassword(false)
    }
  }

  function removePost(postId: string): void {
    setState((current) => current.status === 'success'
      ? {
          ...current,
          posts: current.posts.filter((post) => post.id !== postId),
          likedPosts: current.likedPosts.filter((post) => post.id !== postId),
        }
      : current)
  }

  if (state.status === 'loading') return <p className="profile-page-loading">Loading profile...</p>
  if (state.status === 'not-found') {
    return <section className="profile-page-error" role="alert"><h1>User not found</h1><Link to="/feed">Return to feed</Link></section>
  }
  if (state.status === 'error') return <p className="profile-page-error" role="alert">{state.message}</p>

  const memberSince = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' })
    .format(new Date(state.profile.createdAt))
  const visiblePosts = activeSection === 'own' ? state.posts : state.likedPosts

  return (
    <div className="profile-page">
      <header className="profile-titlebar">
        <img src="/msn-boneco-vector-logo.png" alt="" />
        <span>{isOwner ? 'My MiBLo profile' : `${state.profile.username}'s profile`}</span>
      </header>

      <section className="profile-summary">
        <div className="profile-avatar" aria-hidden="true">{state.profile.username.charAt(0).toUpperCase()}</div>
        <div>
          <h1>{state.profile.username}</h1>
          <p><span className="profile-online-dot" /> Online</p>
          <small>Member since {memberSince}</small>
        </div>
      </section>

      {isOwner && (
        <div className="profile-forms">
          <Form className="profile-panel" onSubmit={submitIdentity} noValidate>
            <h2>Account information</h2>
            <Input label="Username" name="username" id="profile-username" className="profile-input" value={identityForm.username} onChange={updateIdentity} required />
            <Input label="E-mail address" type="email" name="email" id="profile-email" className="profile-input" value={identityForm.email} onChange={updateIdentity} required />
            {identityFeedback.error && <p className="profile-error" role="alert">{identityFeedback.error}</p>}
            {identityFeedback.success && <p className="profile-success" role="status">{identityFeedback.success}</p>}
            <button type="submit" disabled={isSavingIdentity}>{isSavingIdentity ? 'Saving...' : 'Save information'}</button>
          </Form>
          <Form className="profile-panel" onSubmit={submitPassword} noValidate>
            <h2>Change password</h2>
            <Input label="Current password" type="password" name="currentPassword" id="current-password" className="profile-input" value={passwordForm.currentPassword} onChange={updatePassword} required />
            <Input label="New password" type="password" name="newPassword" id="new-password" className="profile-input" value={passwordForm.newPassword} onChange={updatePassword} required />
            {passwordFeedback.error && <p className="profile-error" role="alert">{passwordFeedback.error}</p>}
            {passwordFeedback.success && <p className="profile-success" role="status">{passwordFeedback.success}</p>}
            <button type="submit" disabled={isSavingPassword}>{isSavingPassword ? 'Saving...' : 'Change password'}</button>
          </Form>
        </div>
      )}

      <section className="profile-posts-area">
        {isOwner && (
          <div className="profile-post-tabs" role="tablist" aria-label="Profile activity">
            {(['own', 'comments', 'liked'] as const).map((section) => (
              <button key={section} type="button" role="tab" aria-selected={activeSection === section} onClick={() => setActiveSection(section)}>
                {section === 'own' ? 'My posts' : section === 'comments' ? 'My comments' : 'Liked posts'}
                <strong>{section === 'own' ? state.posts.length : section === 'comments' ? state.comments.length : state.likedPosts.length}</strong>
              </button>
            ))}
          </div>
        )}
        <div className="profile-posts-panel" role="tabpanel">
          <header>
            <div><h2>{isOwner ? (activeSection === 'comments' ? 'My comments' : activeSection === 'liked' ? 'Liked posts' : 'My posts') : `${state.profile.username}'s posts`}</h2></div>
          </header>
          {activeSection === 'comments' && isOwner ? (
            <ProfileCommentList comments={state.comments} onDelete={(commentId) => setState((current) => current.status === 'success' ? { ...current, comments: current.comments.filter((comment) => comment.id !== commentId) } : current)} />
          ) : (
            <ProfilePostList
              posts={visiblePosts}
              emptyMessage={isOwner && activeSection === 'liked' ? 'You have not liked a post yet.' : isOwner ? 'You have not created a post yet.' : 'This user has not created a post yet.'}
              canDelete={isOwner && activeSection === 'own'}
              onDelete={removePost}
              onUnlike={isOwner && activeSection === 'liked' ? removePost : undefined}
            />
          )}
        </div>
      </section>
    </div>
  )
}

function Profile(): ReactElement {
  const { userId } = useParams<{ userId: string }>()
  return <ProfileContent key={userId ?? 'my-profile'} userId={userId} />
}

export default Profile
