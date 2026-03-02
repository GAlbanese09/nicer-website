import { useState, useEffect, useRef, useCallback } from "react";

// ─── Spray Paint Particle System ───
const SprayParticle = ({ x, y, color, size, delay }) => (
  <div
    style={{
      position: "fixed",
      left: x,
      top: y,
      width: size,
      height: size,
      borderRadius: "50%",
      background: color,
      opacity: 0,
      pointerEvents: "none",
      zIndex: 9999,
      animation: `sprayFade 1.2s ${delay}s ease-out forwards`,
      filter: `blur(${size > 4 ? 1 : 0}px)`,
    }}
  />
);

// ─── Drip SVG Component ───
const Drip = ({ color, left, height, delay }) => (
  <svg
    style={{
      position: "absolute",
      top: "100%",
      left,
      width: 8,
      height,
      overflow: "visible",
      opacity: 0,
      animation: `dripDown 2s ${delay}s ease-in forwards`,
    }}
  >
    <path
      d={`M4,0 L4,${height - 6} Q4,${height} 4,${height}`}
      stroke={color}
      strokeWidth="5"
      fill="none"
      strokeLinecap="round"
    />
    <circle cx="4" cy={height} r="4" fill={color} />
  </svg>
);

// ─── Animated Counter ───
const Counter = ({ end, suffix = "", duration = 2000, inView }) => {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!inView || hasAnimated.current) return;
    hasAnimated.current = true;
    const start = 0;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (end - start) * ease));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
};

// ─── Intersection Observer Hook ───
const useInView = (threshold = 0.2) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return [ref, inView];
};

// ─── Gallery Item ───
const GalleryItem = ({ title, category, color, index, size = "normal", image }) => {
  const [hovered, setHovered] = useState(false);
  const [ref, inView] = useInView(0.1);

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        gridColumn: size === "large" ? "span 2" : "span 1",
        gridRow: size === "large" ? "span 2" : "span 1",
        position: "relative",
        background: color,
        borderRadius: 4,
        overflow: "hidden",
        cursor: "pointer",
        minHeight: size === "large" ? 420 : 260,
        transform: inView
          ? hovered
            ? "scale(1.03) rotate(-0.5deg)"
            : "scale(1)"
          : "scale(0.85) rotate(2deg)",
        opacity: inView ? 1 : 0,
        transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
        transitionDelay: `${index * 0.08}s`,
        boxShadow: hovered
          ? `0 20px 60px ${color}66, inset 0 0 100px rgba(0,0,0,0.3)`
          : "inset 0 0 100px rgba(0,0,0,0.4)",
      }}
    >
      {/* Background image */}
      {image && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transition: "transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
            transform: hovered ? "scale(1.08)" : "scale(1)",
          }}
        />
      )}
      {/* Dark overlay for text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: hovered 
            ? "linear-gradient(transparent 30%, rgba(0,0,0,0.7))" 
            : "linear-gradient(transparent 20%, rgba(0,0,0,0.6))",
          transition: "all 0.5s ease",
        }}
      />

      {/* Content overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "60px 24px 24px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
          transform: hovered ? "translateY(0)" : "translateY(20px)",
          opacity: hovered ? 1 : 0.7,
          transition: "all 0.4s ease",
        }}
      >
        <div
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 11,
            letterSpacing: 3,
            textTransform: "uppercase",
            color: color,
            marginBottom: 6,
            filter: "brightness(1.5)",
          }}
        >
          {category}
        </div>
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: size === "large" ? 32 : 22,
            color: "#fff",
            lineHeight: 1.1,
          }}
        >
          {title}
        </div>
      </div>

      {/* Corner tag */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          border: `2px solid ${hovered ? "#fff" : "rgba(255,255,255,0.3)"}`,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s ease",
          transform: hovered ? "rotate(45deg) scale(1.1)" : "rotate(0deg)",
        }}
      >
        <span style={{ color: "#fff", fontSize: 18, fontWeight: 300 }}>→</span>
      </div>
    </div>
  );
};

// ─── Timeline Item ───
const TimelineItem = ({ year, title, desc, side, index }) => {
  const [ref, inView] = useInView(0.3);
  const isLeft = side === "left";

  return (
    <div
      ref={ref}
      className="timeline-item"
      style={{
        display: "flex",
        justifyContent: isLeft ? "flex-end" : "flex-start",
        paddingLeft: isLeft ? 0 : "calc(50% + 30px)",
        paddingRight: isLeft ? "calc(50% + 30px)" : 0,
        marginBottom: 50,
        position: "relative",
      }}
    >
      {/* Center dot */}
      <div
        className="timeline-dot"
        style={{
          position: "absolute",
          left: "50%",
          top: 8,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: inView ? "#FF2D55" : "#333",
          border: "3px solid #0a0a0a",
          transform: "translateX(-50%)",
          transition: "all 0.5s ease",
          boxShadow: inView ? "0 0 20px #FF2D55" : "none",
          zIndex: 2,
        }}
      />

      <div
        style={{
          maxWidth: 380,
          opacity: inView ? 1 : 0,
          transform: inView
            ? "translateX(0) rotate(0deg)"
            : `translateX(${isLeft ? "60px" : "-60px"}) rotate(${isLeft ? "3deg" : "-3deg"})`,
          transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s`,
        }}
      >
        <div
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 52,
            color: "#FF2D55",
            lineHeight: 1,
            textShadow: "0 0 40px rgba(255,45,85,0.3)",
          }}
        >
          {year}
        </div>
        <div
          style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 18,
            fontWeight: 600,
            color: "#fff",
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 14,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.6,
          }}
        >
          {desc}
        </div>
      </div>
    </div>
  );
};

// ─── Main App ───
export default function NicerWebsite() {
  const [scrollY, setScrollY] = useState(0);
  const [particles, setParticles] = useState([]);
  const [activeNav, setActiveNav] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [statsRef, statsInView] = useInView(0.3);
  const particleId = useRef(0);

  useEffect(() => {
    setTimeout(() => setHeroLoaded(true), 300);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Spray paint cursor effect
  const handleMouseMove = useCallback((e) => {
    if (Math.random() > 0.7) return;
    const colors = ["#FF2D55", "#FFD60A", "#30D158", "#5E5CE6", "#FF9F0A", "#BF5AF2"];
    const newParticles = Array.from({ length: 3 }, () => ({
      id: particleId.current++,
      x: e.clientX + (Math.random() - 0.5) * 30,
      y: e.clientY + (Math.random() - 0.5) * 30,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 6 + 2,
      delay: Math.random() * 0.15,
    }));
    setParticles((prev) => [...prev.slice(-40), ...newParticles]);
  }, []);

  const navItems = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "work", label: "Work" },
    { id: "journey", label: "Journey" },
    { id: "services", label: "Services" },
    { id: "contact", label: "Contact" },
  ];

  // Gallery images — real photos in public/gallery/
  const galleryItems = [
    { title: "Big Pun Memorial Wall", category: "Memorial · Bronx", color: "#8B2252", size: "large", image: "/gallery/big-pun-memorial-wall.jpg" },
    { title: "Houston Bowery Wall", category: "Landmark · Manhattan", color: "#1a5276", image: "/gallery/Houston-Bowery-Wall.jpg" },
    { title: "BLM Foley Square", category: "Community · Manhattan", color: "#1B4332", image: "/gallery/BLM-Foley-Square.jpg" },
    { title: "Nicer Character Piece", category: "Aerosol · Bronx", color: "#3d2b1f", image: "/gallery/Nicer-v.jpg" },
    { title: "I Love The Bronx", category: "Community · Bronx", color: "#b71c1c", size: "large", image: "/gallery/i-love-the-bronx.jpg" },
    { title: "Graffiti Hall of Fame", category: "Legacy · Harlem", color: "#1a237e", image: "/gallery/Graffiti_Hall_of_Fame.jpg" },
    { title: "WHEELS Academy Mural", category: "Education · Bronx", color: "#0E6655", image: "/gallery/Wheels-Academy.jpg" },
  ];

  const timelineData = [
    { year: "1980", title: "T.A.T. Cru is Born", desc: "Founded in the South Bronx. Young writers hit the 2, 5, and 6 subway lines with window-down whole car murals." },
    { year: "1985", title: "From Trains to Walls", desc: "MTA crackdowns end subway painting. Nicer, Bio, and BG183 vow to keep painting — transitioning to building walls across the Bronx." },
    { year: "1993", title: "Fat Joe's Represent", desc: "Memorial mural becomes the cover art for Fat Joe's debut album. Graffiti meets the music industry." },
    { year: "1996", title: "Tats Cru, Inc.", desc: "The crew incorporates as the first graffiti company of its kind. The Coca-Cola partnership follows, changing everything." },
    { year: "2000", title: "Big Pun Memorial", desc: "Painting begins the day Pun dies. Artists arrested mid-mural, then released. The wall becomes a Bronx landmark." },
    { year: "2006", title: "The Mural Kings Documentary", desc: "Feature-length film captures the crew's legacy. Screened globally, rated 7.3 on IMDB." },
    { year: "2019", title: "Houston Bowery Wall", desc: "First full graffiti crew to paint this iconic Manhattan wall — previously held by Keith Haring and Banksy." },
    { year: "2023", title: "NBA × Hip-Hop 50th", desc: "Mitchell & Ness collaboration: hand-designed jerseys for 8 NBA teams celebrating 50 years of hip-hop culture." },
  ];

  return (
    <div
      onMouseMove={handleMouseMove}
      style={{
        background: "#0a0a0a",
        color: "#fff",
        minHeight: "100vh",
        fontFamily: "'DM Sans', sans-serif",
        overflowX: "hidden",
        cursor: "crosshair",
      }}
    >
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@300;400;600;700&family=DM+Sans:wght@300;400;500;700&family=Permanent+Marker&display=swap"
        rel="stylesheet"
      />

      {/* Global Animations */}
      <style>{`
        @keyframes sprayFade {
          0% { opacity: 0.8; transform: scale(1); }
          100% { opacity: 0; transform: scale(2.5); }
        }
        @keyframes dripDown {
          0% { opacity: 0; clip-path: inset(0 0 100% 0); }
          100% { opacity: 0.7; clip-path: inset(0 0 0% 0); }
        }
        @keyframes glitchText {
          0%, 100% { text-shadow: 2px 0 #FF2D55, -2px 0 #30D158; }
          25% { text-shadow: -2px -1px #5E5CE6, 2px 1px #FFD60A; }
          50% { text-shadow: 1px 2px #FF9F0A, -1px -2px #FF2D55; }
          75% { text-shadow: -1px 1px #30D158, 1px -1px #BF5AF2; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(1deg); }
        }
        @keyframes revealUp {
          0% { clip-path: inset(100% 0 0 0); }
          100% { clip-path: inset(0 0 0 0); }
        }
        @keyframes strokeDash {
          to { stroke-dashoffset: 0; }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,45,85,0.4); }
          50% { box-shadow: 0 0 0 15px rgba(255,45,85,0); }
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        ::selection { background: #FF2D55; color: #fff; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: #FF2D55; border-radius: 3px; }
        
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger { display: flex !important; }
          .mobile-menu { display: flex !important; }
          .about-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; gap: 24px !important; }
          .gallery-grid { grid-template-columns: 1fr !important; }
          .gallery-grid > * { grid-column: span 1 !important; grid-row: span 1 !important; }
          .services-grid { grid-template-columns: 1fr !important; }
          .timeline-item { padding-left: 40px !important; padding-right: 16px !important; justify-content: flex-start !important; }
          .timeline-line { left: 16px !important; }
          .timeline-dot { left: 16px !important; }
          .footer-inner { flex-direction: column; text-align: center; }
          .contact-buttons { flex-direction: column !important; align-items: center; }
          .hero-buttons { flex-direction: column !important; align-items: center; }
          .floating-stats { position: relative !important; bottom: auto !important; right: auto !important; margin-top: 16px; }
          .about-visual { aspect-ratio: 16/9 !important; }
        }
      `}</style>

      {/* Spray Particles */}
      {particles.map((p) => (
        <SprayParticle key={p.id} {...p} />
      ))}

      {/* ═══════════ NAVIGATION ═══════════ */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: "16px clamp(16px, 4vw, 40px)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background:
            scrollY > 100
              ? "rgba(10,10,10,0.9)"
              : "transparent",
          backdropFilter: scrollY > 100 ? "blur(20px)" : "none",
          borderBottom:
            scrollY > 100 ? "1px solid rgba(255,255,255,0.06)" : "none",
          transition: "all 0.4s ease",
        }}
      >
        <div
          style={{
            fontFamily: "'Permanent Marker', cursive",
            fontSize: 28,
            color: "#FF2D55",
            letterSpacing: -1,
            textShadow: "0 0 30px rgba(255,45,85,0.5)",
          }}
        >
          NICER
        </div>

        {/* Desktop nav */}
        <div className="desktop-nav" style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setActiveNav(item.id)}
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 13,
                letterSpacing: 2,
                textTransform: "uppercase",
                color:
                  activeNav === item.id
                    ? "#FF2D55"
                    : "rgba(255,255,255,0.5)",
                textDecoration: "none",
                transition: "color 0.3s",
                position: "relative",
              }}
            >
              {item.label}
              {activeNav === item.id && (
                <div
                  style={{
                    position: "absolute",
                    bottom: -6,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: "#FF2D55",
                    boxShadow: "0 0 10px #FF2D55",
                  }}
                />
              )}
            </a>
          ))}
        </div>

        {/* Hamburger button */}
        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            flexDirection: "column",
            gap: 5,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
            zIndex: 1002,
          }}
        >
          <span style={{
            width: 24, height: 2, background: "#fff",
            transition: "all 0.3s ease",
            transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none",
          }} />
          <span style={{
            width: 24, height: 2, background: "#fff",
            transition: "all 0.3s ease",
            opacity: menuOpen ? 0 : 1,
          }} />
          <span style={{
            width: 24, height: 2, background: "#fff",
            transition: "all 0.3s ease",
            transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none",
          }} />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className="mobile-menu"
        style={{
          display: "none",
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(10,10,10,0.97)",
          zIndex: 999,
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "opacity 0.3s ease",
        }}
      >
        {navItems.map((item, i) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={() => { setActiveNav(item.id); setMenuOpen(false); }}
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 36,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: activeNav === item.id ? "#FF2D55" : "rgba(255,255,255,0.7)",
              textDecoration: "none",
              transition: "all 0.3s ease",
              transform: menuOpen ? "translateY(0)" : "translateY(20px)",
              transitionDelay: `${i * 0.05}s`,
            }}
          >
            {item.label}
          </a>
        ))}
      </div>

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section
        id="home"
        style={{
          height: "100vh",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Animated background layers */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse at 20% 50%, rgba(255,45,85,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, rgba(94,92,230,0.1) 0%, transparent 50%), radial-gradient(ellipse at 50% 80%, rgba(255,159,10,0.08) 0%, transparent 40%)",
            transform: `translateY(${scrollY * 0.3}px)`,
          }}
        />

        {/* Grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        />

        {/* Scanline effect */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
            pointerEvents: "none",
          }}
        />

        {/* Hero content */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            textAlign: "center",
            transform: `translateY(${scrollY * -0.2}px)`,
          }}
        >
          {/* Pre-title */}
          <div
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 14,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)",
              marginBottom: 20,
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 1s ease 0.3s",
            }}
          >
            Hector Nazario · Tats Cru · South Bronx
          </div>

          {/* Main title */}
          <div style={{ position: "relative", display: "inline-block" }}>
            <h1
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(80px, 15vw, 200px)",
                lineHeight: 0.85,
                letterSpacing: -3,
                color: "#fff",
                opacity: heroLoaded ? 1 : 0,
                transform: heroLoaded ? "translateY(0) scale(1)" : "translateY(40px) scale(0.95)",
                transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.5s",
                animation: heroLoaded ? "glitchText 4s infinite 3s" : "none",
              }}
            >
              NICER
            </h1>
            {/* Drips from the letters */}
            {heroLoaded && (
              <>
                <Drip color="#FF2D55" left="15%" height={60} delay={2} />
                <Drip color="#FFD60A" left="45%" height={80} delay={2.5} />
                <Drip color="#30D158" left="75%" height={45} delay={3} />
                <Drip color="#5E5CE6" left="90%" height={70} delay={2.8} />
              </>
            )}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: "clamp(16px, 2.5vw, 28px)",
              fontWeight: 300,
              color: "rgba(255,255,255,0.6)",
              marginTop: 24,
              letterSpacing: 4,
              textTransform: "uppercase",
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? "translateY(0)" : "translateY(30px)",
              transition: "all 1s ease 1s",
            }}
          >
            The Mural King
          </div>

          {/* CTA */}
          <div
            style={{
              marginTop: 50,
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? "translateY(0)" : "translateY(30px)",
              transition: "all 1s ease 1.4s",
              display: "flex",
              gap: 20,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
            className="hero-buttons"
          >
            <a
              href="#work"
              style={{
                padding: "14px 40px",
                fontFamily: "'Oswald', sans-serif",
                fontSize: 14,
                letterSpacing: 3,
                textTransform: "uppercase",
                background: "#FF2D55",
                color: "#fff",
                border: "none",
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden",
              }}
            >
              View Work
            </a>
            <a
              href="#contact"
              style={{
                padding: "14px 40px",
                fontFamily: "'Oswald', sans-serif",
                fontSize: 14,
                letterSpacing: 3,
                textTransform: "uppercase",
                background: "transparent",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              Commission
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            opacity: heroLoaded ? 0.5 : 0,
            transition: "opacity 1s ease 2s",
            animation: "float 3s ease-in-out infinite",
          }}
        >
          <div
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 10,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            Scroll
          </div>
          <div
            style={{
              width: 1,
              height: 40,
              background: "linear-gradient(rgba(255,255,255,0.5), transparent)",
            }}
          />
        </div>
      </section>

      {/* ═══════════ MARQUEE STRIP ═══════════ */}
      <div
        style={{
          padding: "18px 0",
          background: "#FF2D55",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            animation: "marquee 20s linear infinite",
            whiteSpace: "nowrap",
          }}
        >
          {Array(2)
            .fill(
              "SOUTH BRONX · MURALIST · CHARACTER MASTER · TATS CRU · THE MURAL KINGS · 40+ YEARS · 120+ MEMORIALS · COCA-COLA · NBA · HOUSTON BOWERY · BIG PUN · "
            )
            .map((text, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 16,
                  letterSpacing: 4,
                  color: "#fff",
                  paddingRight: 20,
                }}
              >
                {text}
              </span>
            ))}
        </div>
      </div>

      {/* ═══════════ ABOUT SECTION ═══════════ */}
      <section id="about" style={{ padding: "clamp(60px, 10vw, 120px) clamp(16px, 4vw, 40px)", maxWidth: 1200, margin: "0 auto" }}>
        {(() => {
          const [ref, inView] = useInView();
          return (
            <div
              ref={ref}
              className="about-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 80,
                alignItems: "center",
              }}
            >
              {/* Left - visual */}
              <div style={{ position: "relative" }}>
                <div
                  className="about-visual"
                  style={{
                    width: "100%",
                    aspectRatio: "3/4",
                    background:
                      "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
                    position: "relative",
                    overflow: "hidden",
                    opacity: inView ? 1 : 0,
                    transform: inView ? "translateX(0) rotate(0deg)" : "translateX(-60px) rotate(-3deg)",
                    transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {/* Abstract paint splatter composition */}
                  <div
                    style={{
                      position: "absolute",
                      top: "10%",
                      left: "10%",
                      width: "60%",
                      height: "60%",
                      background: "radial-gradient(circle, #FF2D55 0%, transparent 70%)",
                      opacity: 0.3,
                      borderRadius: "50%",
                      filter: "blur(40px)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "15%",
                      right: "5%",
                      width: "50%",
                      height: "40%",
                      background: "radial-gradient(circle, #FFD60A 0%, transparent 70%)",
                      opacity: 0.2,
                      borderRadius: "50%",
                      filter: "blur(30px)",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      fontFamily: "'Permanent Marker', cursive",
                      fontSize: 120,
                      color: "rgba(255,255,255,0.05)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    NICER
                  </div>
                  {/* Corner label */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: 24,
                      left: 24,
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 11,
                      letterSpacing: 3,
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    Born 1967 · South Bronx, NY
                  </div>
                </div>

                {/* Floating stats card */}
                <div
                  className="floating-stats"
                  style={{
                    position: "absolute",
                    bottom: -30,
                    right: -30,
                    background: "rgba(20,20,20,0.95)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "24px 28px",
                    opacity: inView ? 1 : 0,
                    transform: inView ? "translateY(0)" : "translateY(20px)",
                    transition: "all 0.8s ease 0.4s",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 48,
                      color: "#FF2D55",
                      lineHeight: 1,
                    }}
                  >
                    40+
                  </div>
                  <div
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 11,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.5)",
                    }}
                  >
                    Years Creating
                  </div>
                </div>
              </div>

              {/* Right - text */}
              <div>
                <div
                  style={{
                    fontFamily: "'Oswald', sans-serif",
                    fontSize: 12,
                    letterSpacing: 4,
                    textTransform: "uppercase",
                    color: "#FF2D55",
                    marginBottom: 16,
                    opacity: inView ? 1 : 0,
                    transition: "all 0.8s ease 0.2s",
                  }}
                >
                  The Artist
                </div>
                <h2
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 56,
                    lineHeight: 1,
                    marginBottom: 28,
                    opacity: inView ? 1 : 0,
                    transform: inView ? "translateY(0)" : "translateY(30px)",
                    transition: "all 0.8s ease 0.3s",
                  }}
                >
                  From Abandoned
                  <br />
                  Buildings to{" "}
                  <span style={{ color: "#FF2D55" }}>Global Walls</span>
                </h2>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: 1.8,
                    color: "rgba(255,255,255,0.55)",
                    marginBottom: 24,
                    opacity: inView ? 1 : 0,
                    transition: "all 0.8s ease 0.5s",
                  }}
                >
                  Born in 1967 in the South Bronx during the era of "The Bronx
                  Is Burning," Hector Nazario — NICER — turned childhood
                  imagination into four decades of transformative art. As a kid,
                  he played in abandoned buildings, transforming rubble into
                  worlds of wonder. Today, his murals transform entire
                  neighborhoods.
                </p>
                <p
                  style={{
                    fontSize: 16,
                    lineHeight: 1.8,
                    color: "rgba(255,255,255,0.55)",
                    marginBottom: 32,
                    opacity: inView ? 1 : 0,
                    transition: "all 0.8s ease 0.6s",
                  }}
                >
                  As a founding member of Tats Cru — "The Mural Kings" — he
                  helped pioneer the movement from subway trains to professional
                  muralism, becoming the character master whose cartoons,
                  portraits, and vivid compositions have graced walls from the
                  South Bronx to Berlin, Marrakesh, and Shenzhen.
                </p>

                {/* Quote */}
                <div
                  style={{
                    borderLeft: "3px solid #FF2D55",
                    paddingLeft: 24,
                    opacity: inView ? 1 : 0,
                    transition: "all 0.8s ease 0.7s",
                  }}
                >
                  <p
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 20,
                      fontWeight: 300,
                      fontStyle: "italic",
                      color: "rgba(255,255,255,0.75)",
                      lineHeight: 1.5,
                    }}
                  >
                    "We bring what's in galleries and museums — art and color and
                    style — to neighborhoods where kids might never see the
                    MOMA."
                  </p>
                  <p
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 12,
                      letterSpacing: 2,
                      textTransform: "uppercase",
                      color: "#FF2D55",
                      marginTop: 12,
                    }}
                  >
                    — Nicer
                  </p>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <section
        ref={statsRef}
        style={{
          padding: "60px 40px",
          background: "linear-gradient(180deg, rgba(255,45,85,0.08) 0%, transparent 100%)",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 40,
            textAlign: "center",
          }}
          className="stats-grid"
        >
          {[
            { num: 120, suffix: "+", label: "Memorial Murals" },
            { num: 44, suffix: "+", label: "Years Active" },
            { num: 50, suffix: "+", label: "Brand Partners" },
            { num: 6, suffix: "", label: "Continents Reached" },
          ].map((stat, i) => (
            <div key={i}>
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 64,
                  lineHeight: 1,
                  color: "#FF2D55",
                  textShadow: "0 0 40px rgba(255,45,85,0.3)",
                }}
              >
                <Counter end={stat.num} suffix={stat.suffix} inView={statsInView} />
              </div>
              <div
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: 12,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.4)",
                  marginTop: 8,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ WORK / GALLERY ═══════════ */}
      <section id="work" style={{ padding: "clamp(60px, 10vw, 120px) clamp(16px, 4vw, 40px)", maxWidth: 1400, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 60 }}>
          <div
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 12,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#FF2D55",
              marginBottom: 12,
            }}
          >
            Portfolio
          </div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(40px, 8vw, 64px)",
              lineHeight: 1,
            }}
          >
            Selected Works
          </h2>
        </div>

        <div
          className="gallery-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            gridAutoRows: "minmax(260px, auto)",
          }}
        >
          {galleryItems.map((item, i) => (
            <GalleryItem key={i} index={i} {...item} />
          ))}
        </div>
      </section>

      {/* ═══════════ JOURNEY TIMELINE ═══════════ */}
      <section
        id="journey"
        style={{
          padding: "clamp(60px, 10vw, 120px) clamp(16px, 4vw, 40px)",
          position: "relative",
          maxWidth: 1000,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 80 }}>
          <div
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 12,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#FF2D55",
              marginBottom: 12,
            }}
          >
            1980 — Present
          </div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 64,
              lineHeight: 1,
            }}
          >
            The Journey
          </h2>
        </div>

        {/* Center line */}
        <div
          className="timeline-line"
          style={{
            position: "absolute",
            left: "50%",
            top: 260,
            bottom: 120,
            width: 2,
            background:
              "linear-gradient(transparent, rgba(255,45,85,0.3) 10%, rgba(255,45,85,0.3) 90%, transparent)",
            transform: "translateX(-50%)",
          }}
        />

        {timelineData.map((item, i) => (
          <TimelineItem
            key={i}
            {...item}
            side={i % 2 === 0 ? "left" : "right"}
            index={i}
          />
        ))}
      </section>

      {/* ═══════════ SERVICES ═══════════ */}
      <section
        id="services"
        style={{
          padding: "clamp(60px, 10vw, 120px) clamp(16px, 4vw, 40px)",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255,45,85,0.04) 50%, transparent 100%)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 12,
                letterSpacing: 4,
                textTransform: "uppercase",
                color: "#FF2D55",
                marginBottom: 12,
              }}
            >
              What I Do
            </div>
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 64,
                lineHeight: 1,
              }}
            >
              Services
            </h2>
          </div>

          <div
            className="services-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
            }}
          >
            {[
              {
                icon: "🎨",
                title: "Murals & Public Art",
                desc: "Large-scale aerosol murals for buildings, businesses, schools, and public spaces. From concept to completion.",
              },
              {
                icon: "🏢",
                title: "Commercial & Brand",
                desc: "Advertising murals, product design, brand activations, and experiential marketing campaigns.",
              },
              {
                icon: "🖼️",
                title: "Fine Art & Gallery",
                desc: "Canvas works, limited edition prints, and mixed media pieces for collectors and exhibitions.",
              },
              {
                icon: "🕊️",
                title: "Memorial Walls",
                desc: "Honoring loved ones through carefully crafted memorial murals that celebrate their memory and legacy.",
              },
              {
                icon: "🎤",
                title: "Speaking & Workshops",
                desc: "University lectures, school workshops, and community programs teaching aerosol art techniques and history.",
              },
              {
                icon: "✏️",
                title: "Private Commissions",
                desc: "Custom artwork for homes, offices, and personal collections. Each piece is one-of-a-kind.",
              },
            ].map((service, i) => {
              const [ref, inView] = useInView(0.2);
              const [hovered, setHovered] = useState(false);
              return (
                <div
                  key={i}
                  ref={ref}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                  style={{
                    padding: 36,
                    background: hovered
                      ? "rgba(255,45,85,0.08)"
                      : "rgba(255,255,255,0.02)",
                    border: `1px solid ${hovered ? "rgba(255,45,85,0.3)" : "rgba(255,255,255,0.06)"}`,
                    cursor: "pointer",
                    transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
                    opacity: inView ? 1 : 0,
                    transform: inView
                      ? hovered
                        ? "translateY(-8px)"
                        : "translateY(0)"
                      : "translateY(40px)",
                    transitionDelay: `${i * 0.08}s`,
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 20 }}>
                    {service.icon}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Oswald', sans-serif",
                      fontSize: 20,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 12,
                      color: hovered ? "#FF2D55" : "#fff",
                      transition: "color 0.3s",
                    }}
                  >
                    {service.title}
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: "rgba(255,255,255,0.45)",
                    }}
                  >
                    {service.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ CONTACT CTA ═══════════ */}
      <section
        id="contact"
        style={{
          padding: "clamp(60px, 10vw, 140px) clamp(16px, 4vw, 40px)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            background: "radial-gradient(circle, rgba(255,45,85,0.12) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            style={{
              fontFamily: "'Oswald', sans-serif",
              fontSize: 12,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#FF2D55",
              marginBottom: 16,
            }}
          >
            Let's Create
          </div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(48px, 8vw, 96px)",
              lineHeight: 1,
              marginBottom: 24,
            }}
          >
            Got a Wall?
            <br />
            <span style={{ color: "#FF2D55" }}>Let's Talk.</span>
          </h2>
          <p
            style={{
              fontSize: 18,
              color: "rgba(255,255,255,0.45)",
              maxWidth: 500,
              margin: "0 auto 40px",
              lineHeight: 1.7,
            }}
          >
            Murals, commissions, brand collaborations, speaking engagements —
            every wall tells a story. Let's write the next one together.
          </p>

          <div
            className="contact-buttons"
            style={{
              display: "flex",
              gap: 20,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="mailto:nicer@tatscru.net"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "16px 44px",
                fontFamily: "'Oswald', sans-serif",
                fontSize: 15,
                letterSpacing: 3,
                textTransform: "uppercase",
                background: "#FF2D55",
                color: "#fff",
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
                animation: "pulse 2s ease-in-out infinite",
              }}
            >
              ✉ Get In Touch
            </a>
            <a
              href="https://www.instagram.com/nicertatscru/"
              target="_blank"
              rel="noopener"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                padding: "16px 44px",
                fontFamily: "'Oswald', sans-serif",
                fontSize: 15,
                letterSpacing: 3,
                textTransform: "uppercase",
                background: "transparent",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)",
                textDecoration: "none",
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
            >
              ◈ Instagram
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer
        className="footer-inner"
        style={{
          padding: "40px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: 1200,
          margin: "0 auto",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div
          style={{
            fontFamily: "'Permanent Marker', cursive",
            fontSize: 22,
            color: "#FF2D55",
          }}
        >
          NICER
        </div>
        <div
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: "rgba(255,255,255,0.3)",
          }}
        >
          © {new Date().getFullYear()} Hector "Nicer" Nazario · Tats Cru, Inc.
          · South Bronx, NY
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["Instagram", "Email", "Tats Cru"].map((link) => (
            <a
              key={link}
              href="#"
              style={{
                fontFamily: "'Oswald', sans-serif",
                fontSize: 12,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.3)",
                textDecoration: "none",
                transition: "color 0.3s",
              }}
            >
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
