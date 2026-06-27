import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import '../styles/shared.css'

import topImage from '../Images/landing_top.jpg'
import bottomImage from '../Images/landing_bottom.jpg'

export default function Landing() {
  const navigate = useNavigate()
  const [leaving, setLeaving] = useState(false)

  const handleStart = () => {
    setLeaving(true)

    setTimeout(() => {
      navigate('/login')
    }, 850)
  }

  return (
    <div className={`land-root ${leaving ? 'land-leaving' : ''}`}>

      {/* TOP IMAGE */}
      <section className="land-band land-band-top">
        <img
          src={topImage}
          alt="RaEd top illustration"
          className="land-band-image"
        />
      </section>

      {/* CENTER CONTENT */}
      <section className="land-center">
        <h1 className="land-logo">
          <span className="land-logo-en">NumuX |</span>
          <span className="land-logo-ar">نمو</span>
        </h1>

        <div className="land-text-switch">
          <p className="land-tagline text-en">
            Find out what your community actually wants
          </p>

          <p className="land-tagline-ar text-ar">
            اعرف ما يحتاجه مجتمعك فعلاً
          </p>
        </div>

          <button
            type="button"
            className="land-btn"
            onClick={handleStart}
          >
            <span className="btn-text btn-en">
              Create a Survey
            </span>

            <span className="btn-text btn-ar">
              إنشاء استبيان
            </span>
          </button>
      </section>

      {/* BOTTOM IMAGE */}
      <section className="land-band land-band-bottom">
        <img
          src={bottomImage}
          alt="RaEd bottom illustration"
          className="land-band-image"
        />
      </section>

    </div>
  )
}