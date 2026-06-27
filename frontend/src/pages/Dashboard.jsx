// frontend/src/pages/Dashboard.jsx

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import '../style.css'

export default function Dashboard() {
  const [lang, setLang] = useState('en')

const texts = {
  en: {
    welcome: 'Welcome back',
    signOut: 'Sign out',
    totalSurveys: 'Total Surveys',
    results: 'Results',
    viewResponses: 'View responses',
    share: 'Share',
    copySurveyLinks: 'Copy survey links',
    yourSurveys: 'Your surveys',
    noSurveys: 'No surveys yet',
    newSurvey: '+ New Survey',
    loading: 'Loading...',
    empty: "You haven't created any surveys yet.",
    createFirst: 'Create your first survey',
    created: 'Created',
    copyLink: 'Copy Link',
    delete: 'Delete',
    linkCopied: 'Link copied!',
    switchTo: 'العربية'
  },
  ar: {
    welcome: 'مرحباً بعودتك',
    signOut: 'تسجيل الخروج',
    totalSurveys: 'إجمالي الاستبيانات',
    results: 'النتائج',
    viewResponses: 'عرض الردود',
    share: 'مشاركة',
    copySurveyLinks: 'نسخ روابط الاستبيان',
    yourSurveys: 'استبياناتك',
    noSurveys: 'لا توجد استبيانات بعد',
    newSurvey: '+ استبيان جديد',
    loading: 'جاري التحميل...',
    empty: 'لم تقم بإنشاء أي استبيان بعد.',
    createFirst: 'أنشئ أول استبيان',
    created: 'تم الإنشاء',
    copyLink: 'نسخ الرابط',
    delete: 'حذف',
    linkCopied: 'تم نسخ الرابط!',
    switchTo: 'English'
  }
}
  const navigate = useNavigate()

  const [surveys, setSurveys] = useState([])
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    loadSurveys()
  }, [])

  async function loadSurveys() {
    setLoading(true)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      setUserEmail(session.user.email)
    }

    const { data, error } = await supabase
      .from('surveys')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) setSurveys(data)
    else console.error(error)

    setLoading(false)
  }

  async function handleDelete(id, title) {
    const confirmed = window.confirm(`Delete "${title}"?`)
    if (!confirmed) return

    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    setSurveys(prev => prev.filter(s => s.id !== id))
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const publicBaseUrl = window.location.origin

  return (
      <div className="dash-page" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <aside className="dash-sidebar">
        <div className="dash-menu">☰</div>
        <button>🏠</button>
        <button>📊</button>
        <button>📝</button>
        <button>👤</button>
        <button>⚙️</button>
      </aside>

      <main className="dash-container">
        <section className="dash-hero">
          <div>
            <h1>DemandQ</h1>
            <p>{texts[lang].welcome}, {userEmail || 'User'} 👋</p>

            <button onClick={handleSignOut} className="dash-signout">
              {texts[lang].signOut}
            </button>

            <p>{texts[lang].totalSurveys}</p>

            <h2>{texts[lang].yourSurveys}</h2>

            <button onClick={() => navigate('/create')} className="dash-new-btn">
              {texts[lang].newSurvey}
            </button>
          </div>

          <button onClick={handleSignOut} className="dash-signout">
            Sign out
          </button>

          <button
          className="dash-lang-btn"
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
        >
          {texts[lang].switchTo}
        </button>

        </section>

        <section className="dash-stats">
          <div className="dash-stat-card">
            <span>📋</span>
            <h3>{surveys.length}</h3>
            <p>Total Surveys</p>
          </div>

          <div className="dash-stat-card">
            <span>📈</span>
            <h3>Results</h3>
            <p>View responses</p>
          </div>

          <div className="dash-stat-card">
            <span>🔗</span>
            <h3>Share</h3>
            <p>Copy survey links</p>
          </div>
        </section>

        <section className="dash-content">
          <div className="dash-content-header">
            <div>
              <h2>Your surveys</h2>
              <p>
                {surveys.length === 0
                  ? 'No surveys yet'
                  : `${surveys.length} survey${surveys.length !== 1 ? 's' : ''}`}
              </p>
            </div>

            <button onClick={() => navigate('/create')} className="dash-new-btn">
              + New Survey
            </button>
          </div>

          {loading ? (
            <p className="dash-loading">Loading...</p>
          ) : surveys.length === 0 ? (
            <div className="dash-empty">
              <div className="dash-empty-icon">📝</div>
              <p>You haven't created any surveys yet.</p>
              <button onClick={() => navigate('/create')}>
                Create your first survey
              </button>
            </div>
          ) : (
            <div className="dash-grid">
              {surveys.map((survey) => (
                <div key={survey.id} className="dash-survey-card">
                  <div className="dash-card-icon">📋</div>

                  <h3>{survey.title}</h3>

                  {survey.description && (
                    <p>{survey.description}</p>
                  )}

                  <small>
                    Created {new Date(survey.created_at).toLocaleDateString()}
                  </small>

                  <div className="dash-card-actions">
                    <button onClick={() => navigate(`/results/${survey.id}`)}>
                      📊 Results
                    </button>

                    <button
                      onClick={() => {
                        const link = `${publicBaseUrl}/survey/${survey.id}`
                        navigator.clipboard.writeText(link)
                        alert(texts[lang].linkCopied)
                      }}
                    >
                      🔗 Copy Link
                    </button>

                    <button
                      className="delete"
                      onClick={() => handleDelete(survey.id, survey.title)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}