// frontend/src/pages/Landing.jsx
// Homepage — public, no login needed
import "../style.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import landingTop from "../Images/landing_top.png"
import landingBottom from "../Images/landing_bottom.png"

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
    <div className={`land-page ${leaving ? "land-leaving" : ""}`}>
      <div className="land-split land-top">
        <img src={landingTop} alt="UAE design top" />
      </div>

<div className="land-content">
  <h1 className="land-logo">
     NumuX <span>نمو </span>
  </h1>

  <p className="land-tagline">
    Find out what your community actually wants — before you spend a dirham.
  </p>

  <button onClick={goToLogin} className="land-cta">
   Discover Customer Needs <span>استكشف احتياجات السوق المستهدف</span>
   / * Create a Survey */
  </button>
</div>
      <div className="land-split land-bottom">
        <img src={landingBottom} alt="UAE design bottom" />
      </div>
    </div>
  )
}