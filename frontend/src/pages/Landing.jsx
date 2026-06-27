// frontend/src/pages/Landing.jsx
// Homepage — public, no login needed
import { Link } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()
  const [leaving, setLeaving] = useState(false)

  const goToLogin = () => {
    setLeaving(true)

    setTimeout(() => {
      navigate("/login")
    }, 1200)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 text-center">
      <h1 className="text-3xl font-bold mb-3">DemandQ</h1>
      <p className="text-gray-600 max-w-sm mb-8">
        Find out what your community actually wants — before you spend a dirham.
      </p>
      <Link
        to="/login"
        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
      >
        Create a Survey
      </Link>
    </div>
  )
}