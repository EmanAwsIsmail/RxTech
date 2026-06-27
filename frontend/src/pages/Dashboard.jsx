// frontend/src/pages/Dashboard.jsx
// Changes from original:
//   1. Import Toast component
//   2. Add `toast` state — replaces window.alert() for "Copy Share Link"
//   3. Remove max-width constraint so grid fills the page

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Toast from '../components/Toast'
import '../styles/shared.css'

export default function Dashboard() {
  const navigate = useNavigate()

  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')
  const [toast, setToast] = useState('') // ← replaces alert()
  const [confirmDelete, setConfirmDelete] = useState(null) // holds { id, title }
  const [userName, setUserName] = useState('')
  useEffect(() => {
    loadSurveys()
  }, [])

  async function loadSurveys() {
    setLoading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      setUserEmail(session.user.email)
      setUserName(session.user.user_metadata?.full_name || '')
    }
    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (!error) setSurveys(data)
    else console.error(error)
    setLoading(false)
  }

  async function handleDelete(id) {
  const { error } = await supabase.from('surveys').delete().eq('id', id)
  if (error) { setToast('Delete failed: ' + error.message); return }
  setSurveys(prev => prev.filter(s => s.id !== id))
  setToast('Survey deleted')
  setConfirmDelete(null)
}

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const publicBaseUrl = window.location.origin

  return (
    <div className="page-shell">

      {/* Styled toast — replaces browser alert() */}
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
      {confirmDelete && (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999, padding: '1rem'
  }}>
    <div style={{
      background: '#fff', borderRadius: '16px', padding: '2rem',
      maxWidth: '380px', width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.18)'
    }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-ink)', marginBottom: '0.5rem' }}>
        Delete survey?
      </h3>
      <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        "<strong>{confirmDelete.title}</strong>" and all its responses will be permanently deleted.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          onClick={() => setConfirmDelete(null)}
          className="btn-secondary"
          style={{ margin: 0 }}
        >
          Cancel
        </button>
        <button
          onClick={() => handleDelete(confirmDelete.id)}
          style={{
            flex: 1, padding: '0.75rem', background: 'var(--color-warn)',
            color: '#fff', fontWeight: 600, fontSize: '0.95rem',
            border: 'none', borderRadius: '10px', cursor: 'pointer'
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

      <header className="app-header">
        <h1 className="app-logo">DemandQ</h1>
        <div className="header-actions">
          <span className="header-email">{userName || userEmail}</span>
          <button onClick={handleSignOut} className="link-muted">
            Sign out
          </button>
        </div>
      </header>

      <main className="container-lg">
        <div className="section-header-row">
          <div>
            <h2 className="section-title">Your surveys</h2>
            <p className="section-subtitle">
              {surveys.length === 0
                ? 'No surveys yet'
                : `${surveys.length} survey${surveys.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button onClick={() => navigate('/create')} className="btn-primary-sm">
            + New Survey
          </button>
        </div>

        {loading ? (
          <p className="text-muted-sm">Loading...</p>
        ) : surveys.length === 0 ? (
          <div className="empty-state">
            <p style={{ marginBottom: '1rem' }}>You haven't created any surveys yet.</p>
            <button onClick={() => navigate('/create')} className="btn-primary-sm">
              Create your first survey
            </button>
          </div>
        ) : (
          <ul className="survey-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {surveys.map((survey) => (
              <li key={survey.id} className="survey-item">
                <div className="survey-item-row">
                  <div className="survey-item-main">
                    <p className="survey-item-title">{survey.title}</p>
                    {survey.description && (
                      <p className="survey-item-desc">{survey.description}</p>
                    )}
                    <p className="survey-item-meta">
                      Created {new Date(survey.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="survey-item-actions">
                    <button
                      onClick={() => navigate(`/results/${survey.id}`)}
                      className="btn-link-blue"
                    >
                      View Results
                    </button>
                    <button
                      onClick={() => {
                        const link = `${publicBaseUrl}/survey/${survey.id}`
                        navigator.clipboard.writeText(link)
                        setToast('Link copied!') // ← styled toast, not alert()
                      }}
                      className="btn-text-muted"
                    >
                      Copy Share Link
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ id: survey.id, title: survey.title })}
                      className="btn-text-danger-strong"
                    >
                      Delete Survey
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}