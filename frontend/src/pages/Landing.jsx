// frontend/src/pages/Landing.jsx
// Homepage — public, no login needed
import { Link } from 'react-router-dom'

import '../styles/shared.css'

export default function Landing() {
  return (
    <div className="page-centered-col">
      <h1 className="landing-title">DemandQ</h1>
      <p className="landing-subtitle">
        Find out what your community actually wants — before you spend a dirham.
      </p>
      <Link
        to="/login"
        className="btn-primary-lg"
      >
        Create a Survey
      </Link>
    </div>
  )
}