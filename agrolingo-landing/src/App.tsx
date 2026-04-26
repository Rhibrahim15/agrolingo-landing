import React, { useEffect, useState } from "react";

// Hook 1: The custom animated cursor (updated for Saffron Gold)
const useAnimatedCursor = () => {
  useEffect(() => {
    const existingCursor = document.getElementById('custom-cursor');
    if (existingCursor) return; // prevent duplicates in dev mode

    const cursor = document.createElement('div');
    cursor.id = 'custom-cursor';
    cursor.className = 'cursor';
    document.body.appendChild(cursor);

    const cursorRing = document.createElement('div');
    cursorRing.id = 'custom-cursor-ring';
    cursorRing.className = 'cursor-ring';
    document.body.appendChild(cursorRing);

    let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
    const onMouseMove = (e: MouseEvent) => {
      if (cursor.style.display === 'none') cursor.style.display = 'block';
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    document.addEventListener('mousemove', onMouseMove);

    const animateRing = () => {
      ringX += (mouseX - ringX - 18) * 0.12;
      ringY += (mouseY - ringY - 18) * 0.12;
      cursor.style.transform = `translate(${mouseX - 5}px, ${mouseY - 5}px)`;
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();

    const handleMouseEnter = () => {
      cursorRing.style.width = '60px';
      cursorRing.style.height = '60px';
      cursorRing.style.borderColor = 'rgba(255, 183, 3, 0.8)';
    };
    const handleMouseLeave = () => {
      cursorRing.style.width = '36px';
      cursorRing.style.height = '36px';
      cursorRing.style.borderColor = 'rgba(255, 183, 3, 0.5)';
    };

    const elements = document.querySelectorAll('a, button, .feature-card, .testimonial-card');
    elements.forEach(el => {
      el.addEventListener('mouseenter', handleMouseEnter);
      el.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      if (document.body.contains(cursor)) document.body.removeChild(cursor);
      if (document.body.contains(cursorRing)) document.body.removeChild(cursorRing);
      elements.forEach(el => {
        el.removeEventListener('mouseenter', handleMouseEnter);
        el.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, []);
};

// Hook 2: Canvas Particle Background (Updated for Saffron Gold)
const useCanvasParticles = () => {
  useEffect(() => {
    const canvas = document.getElementById('bgCanvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.35 + 0.05,
    }));

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.dx; p.y += p.dy;
        if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 183, 3, ${p.opacity})`;
        ctx.fill();
        
        particles.slice(i + 1).forEach(p2 => {
          const dx = p.x - p2.x, dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(255, 183, 3, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      requestAnimationFrame(drawParticles);
    };
    drawParticles();

    const onResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
};

export default function App() {
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", phone: "", location: "kano", crop: "" });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    // Reveal animations
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed", "visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
    );
    document.querySelectorAll("[data-reveal], .reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useAnimatedCursor();
  useCanvasParticles();

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.crop) {
      setToast("Cika dukkan bayanai / Fill all fields");
      setTimeout(() => setToast(null), 3000);
      return;
    }
    setFormLoading(true);

    try {
      const response = await fetch("https://formspree.io/f/mzdyolgb", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setToast("An karɓa! An saka ka cikin jerinmu / Added to list ✓");
        setForm({ name: "", phone: "", location: "kano", crop: "" });
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      setToast("An sami matsala. / Error submitting form.");
    } finally {
      setFormLoading(false);
      setTimeout(() => setToast(null), 3500);
    }
  };

  return (
    <>
      <canvas id="bgCanvas" />
      
      {/* NAV */}
      <nav>
        <a href="#" className="nav-logo">
          <div className="flex items-center justify-center bg-white rounded-lg p-1 w-10 h-10 shadow-lg">
             <img src="/images/logo1.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div className="nav-logo-text">AgroLingo <span>AI</span></div>
        </a>
        <ul className="nav-links">
          <li><a href="#problem">The Problem</a></li>
          <li><a href="#features">Features</a></li>
          <li><a href="#how">How It Works</a></li>
          <li><a href="#impact">Impact</a></li>
          <li><a href="#tech">Technology</a></li>
        </ul>
        <a href="https://agrolingo.vercel.app" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '10px 24px', borderRadius: '10px', fontSize: '14px' }}>Try Demo →</a>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-floats">
          <div className="float-card float-card-1">
            <div className="float-title">🌿 Crop Diagnosis</div>
            <div className="float-content">Yellow spots detected on groundnut leaves — likely <strong style={{color: 'var(--saffron)'}}>Cercospora</strong></div>
            <div className="float-pill">89% confidence</div>
          </div>
          <div className="float-card float-card-2">
            <div className="float-title">📈 Market Intel</div>
            <div className="float-content">Cowpea prices up <strong style={{color: 'var(--saffron)'}}>+12%</strong> in Kano this week. Best time to sell.</div>
            <div className="float-pill">Live data</div>
          </div>
        </div>

        <div className="hero-badge" style={{ position: 'relative', zIndex: 10 }}>
          <div className="badge-dot"></div>
          World's First Hausa-Native Agricultural AI
        </div>

        <h1 className="hero-title" style={{ position: 'relative', zIndex: 10 }}>
          The <span className="accent">Farmer's</span> Voice,<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--saffron)] to-yellow-100">Amplified by AI</span>
        </h1>

        <p className="hero-subtitle" style={{ position: 'relative', zIndex: 10 }}>
          AgroLingo AI delivers expert agricultural intelligence to smallholder farmers 
          in Northern Nigeria — in Hausa, in their hands, at the speed of a question.
          <span className="hausa">Ƙarfin Manoma · Ta Hanyar Hankali na AI</span>
        </p>

        <div className="hero-ctas" style={{ position: 'relative', zIndex: 10 }}>
          <a href="https://agrolingo.vercel.app" target="_blank" rel="noopener noreferrer" className="btn-primary group">
            🌾 Launch AgroLingo Free
            <svg className="w-5 h-5 ml-1 animate-float-right" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </a>
          <a href="#features" className="btn-secondary">Explore Features →</a>
        </div>

        <div className="hero-stats" style={{ position: 'relative', zIndex: 10 }}>
          <div className="stat-item">
            <div className="stat-number">50M+</div>
            <div className="stat-label">Farmers in Northern Nigeria</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">3</div>
            <div className="stat-label">Languages: Hausa, EN & FR</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">0₦</div>
            <div className="stat-label">Free for smallholders</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">24/7</div>
            <div className="stat-label">AI Available Always</div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section id="problem" style={{ background: 'linear-gradient(180deg, transparent, rgba(17, 66, 50, 0.2), transparent)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="problem-floats">
            <div className="float-card float-card-3">
              <div className="float-title">🎤 Hausa Voice</div>
              <div className="float-content">"Masara tayi kwari…" → AI identifies <strong style={{color: 'var(--saffron)'}}>maize stalk rot</strong></div>
              <div className="float-pill">Voice-first</div>
            </div>
            <div className="float-card float-card-4">
              <div className="float-title">🌦️ Weather Advice</div>
              <div className="float-content">Rain on Thursday — delay fertilizer application by <strong style={{color: 'var(--saffron)'}}>2 days</strong></div>
              <div className="float-pill">Hyper-local</div>
            </div>
          </div>
          <div className="problem-grid">
            <div className="reveal">
              <div className="problem-wall">
                <div className="problem-wall-title">⚠️ The Three Walls Blocking Farmers</div>
                <div className="wall-item">
                  <div className="wall-icon">🔤</div>
                  <div className="wall-text"><strong>Language Wall</strong> — Every agricultural platform is English-only. 70% of Northern Nigerian farmers speak primarily Hausa.</div>
                </div>
                <div className="wall-item">
                  <div className="wall-icon">📵</div>
                  <div className="wall-text"><strong>Connectivity Wall</strong> — Limited 3G/4G coverage in rural Jigawa, Kano, and Sokoto means most apps simply don't work.</div>
                </div>
                <div className="wall-item">
                  <div className="wall-icon">🧩</div>
                  <div className="wall-text"><strong>Complexity Wall</strong> — Digital tools designed for educated urban users, not smallholder farmers managing 2–5 hectares.</div>
                </div>
              </div>
            </div>
            <div className="reveal reveal-delay-2">
              <div className="section-label">The Challenge</div>
              <h2 className="section-title mb-6">A <span className="accent">crisis</span> hiding in plain sight</h2>
              <div className="problem-stat">60%</div>
              <p className="problem-desc">
                of Nigeria's rural youth aged 15–17 are excluded from education and digital tools — with farmers disproportionately left behind. An estimated 20% of children 6–11 are already out of school in agricultural communities.
              </p>
              <p className="problem-desc">
                Meanwhile, a single timely piece of advice — the right fertilizer, the disease caught early, the market price on the right day — can double a farmer's income. AgroLingo delivers that advice in the language they dream in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION WITH IMAGE OVERLAYS */}
      <section id="features">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="features-header reveal">
            <div className="section-label">What AgroLingo Does</div>
            <h2 className="section-title">Built for the <span className="accent">real</span> &nbsp;&nbsp;&nbsp;&nbsp;farm</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card featured reveal reveal-delay-1" style={{ backgroundImage: "linear-gradient(rgba(17,66,50,0.2), rgba(17,66,50,0.95)), url('https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1200&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="feature-icon" style={{ background: 'var(--saffron)', color: '#000', borderColor: 'var(--saffron)' }}>🗣️</div>
              <div className="feature-title" style={{ color: '#fff' }}>Hausa-First Voice AI</div>
              <div className="feature-desc" style={{ color: 'rgba(255,255,255,0.9)' }}>Speak naturally in Hausa, English, or French. No forms, no menus, no literacy required. The AI understands your dialect and responds like a trusted village agronomist.</div>
              <div className="feature-tag" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--saffron)', borderColor: 'var(--saffron)' }}>Voice-First</div>
            </div>
            <div className="feature-card reveal reveal-delay-2" style={{ backgroundImage: "linear-gradient(rgba(5,10,8,0.2), rgba(5,10,8,0.95)), url('https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="feature-icon">🔬</div>
              <div className="feature-title">Crop Disease Diagnosis</div>
              <div className="feature-desc" style={{ color: 'rgba(255,255,255,0.8)' }}>Point your camera at a sick crop. AgroLingo identifies the disease, gives a confidence score, and delivers treatment steps in Hausa within seconds. Works offline.</div>
              <div className="feature-tag">AI Vision</div>
            </div>
            <div className="feature-card reveal reveal-delay-3" style={{ backgroundImage: "linear-gradient(rgba(5,10,8,0.2), rgba(5,10,8,0.95)), url('https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=800&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="feature-icon">🌦️</div>
              <div className="feature-title">Weather-Smart Farming</div>
              <div className="feature-desc" style={{ color: 'rgba(255,255,255,0.8)' }}>Not just weather — farming decisions based on weather. "Rain Thursday — delay fertilizer 2 days." Hyper-local to your LGA, not just your state.</div>
              <div className="feature-tag">Hyper-Local</div>
            </div>
            <div className="feature-card reveal reveal-delay-1" style={{ backgroundImage: "linear-gradient(rgba(5,10,8,0.2), rgba(5,10,8,0.95)), url('https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="feature-icon">📈</div>
              <div className="feature-title">Market Price Intelligence</div>
              <div className="feature-desc" style={{ color: 'rgba(255,255,255,0.8)' }}>Real-time and historical crop prices from major hubs like Dawanau, Kano, and Kaduna markets. Tells you not just the price — but the best time to sell.</div>
              <div className="feature-tag">Live Data</div>
            </div>
            <div className="feature-card reveal reveal-delay-2" style={{ backgroundImage: "linear-gradient(rgba(5,10,8,0.2), rgba(5,10,8,0.95)), url('https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?auto=format&fit=crop&w=1200&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="feature-icon">📵</div>
              <div className="feature-title">Offline PWA Access</div>
              <div className="feature-desc" style={{ color: 'rgba(255,255,255,0.8)' }}>No internet? No problem. Advanced Service Workers cache the app, and an offline expert database answers standard questions with zero data.</div>
              <div className="feature-tag">Zero-Data</div>
            </div>
            <div className="feature-card reveal reveal-delay-3" style={{ backgroundImage: "linear-gradient(rgba(5,10,8,0.2), rgba(5,10,8,0.95)), url('https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&w=800&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="feature-icon">👩‍🌾</div>
              <div className="feature-title">Gender-Inclusive Design</div>
              <div className="feature-desc" style={{ color: 'rgba(255,255,255,0.8)' }}>Female farmer mode with content, voice examples, and crop scenarios tailored to women-led farming operations across Northern Nigeria.</div>
              <div className="feature-tag">Inclusive</div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / CHAT MOCKUP */}
      <section id="how" style={{ background: 'var(--glass)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-label reveal">How It Works</div>
          <h2 className="section-title reveal reveal-delay-1">Simple as asking a <span className="accent">neighbour</span></h2>
          <div className="hiw-grid">
            <div className="reveal">
              <div className="hiw-step">
                <div className="step-number">01</div>
                <div>
                  <div className="step-title">Ask in Hausa or English</div>
                  <div className="step-desc">Type or speak your question naturally. "Ganyen masara ta rawaya" or "My maize leaves are turning yellow" — AgroLingo understands perfectly.</div>
                </div>
              </div>
              <div className="hiw-step">
                <div className="step-number">02</div>
                <div>
                  <div className="step-title">AI Analyses Your Situation</div>
                  <div className="step-desc">Powered by top-tier models, fine-tuned on Northern Nigerian agriculture. The AI cross-references symptoms, season, location, and crop type.</div>
                </div>
              </div>
              <div className="hiw-step">
                <div className="step-number">03</div>
                <div>
                  <div className="step-title">Get Actionable Advice</div>
                  <div className="step-desc">Not generic tips — specific, ranked treatment steps for your crop. Treatment, prevention, and sourcing guidance all in one response.</div>
                </div>
              </div>
            </div>

            <div className="hiw-visual reveal reveal-delay-2">
              <div className="chat-header">
                <div className="chat-avatar bg-white"><img src="/images/logo1.png" alt="AI" className="w-8 h-8 object-contain p-1" /></div>
                <div>
                  <div className="chat-name">AgroLingo AI</div>
                  <div className="chat-status"><span className="online-dot"></span>Online · Gemini 1.5 Flash · Hausa</div>
                </div>
              </div>
              <div className="chat-messages">
                <div className="chat-msg user" style={{ animationDelay: '0.2s' }}>
                  <div className="msg-avatar msg-user-av">👨‍🌾</div>
                  <div className="msg-bubble msg-user">Ganyen gyada na rawaya kuma yana zubo. Menene matsala?</div>
                </div>
                <div className="chat-msg" style={{ animationDelay: '0.5s' }}>
                  <div className="msg-avatar msg-ai-av bg-white"><img src="/images/logo1.png" alt="AI" className="w-full h-full object-contain p-0.5" /></div>
                  <div className="msg-bubble msg-ai">
                    Bayani mai kyau! Bisa alamun, akwai yiwuwar cuta ta <strong style={{ color: 'var(--saffron)' }}>Cercospora leaf spot</strong>.
                    <div className="msg-hausa">Good description! Based on symptoms, this is likely Cercospora leaf spot.</div>
                  </div>
                </div>
                <div className="chat-msg user" style={{ animationDelay: '0.8s' }}>
                  <div className="msg-avatar msg-user-av">👨‍🌾</div>
                  <div className="msg-bubble msg-user">Yaya zan magance shi?</div>
                </div>
                <div className="chat-msg" style={{ animationDelay: '1.1s' }}>
                  <div className="msg-avatar msg-ai-av bg-white"><img src="/images/logo1.png" alt="AI" className="w-full h-full object-contain p-0.5" /></div>
                  <div className="msg-bubble msg-ai">
                    <strong style={{ color: 'var(--saffron)' }}>Matakai 3 na farko:</strong><br/>
                    1. Ka fesa Mancozeb (80%)<br/>
                    2. Ka cire ganyen da suka mutu<br/>
                    3. Rage ban ruwa<br/>
                    <div className="msg-hausa">First 3 steps: Spray Mancozeb, remove dead leaves, reduce irrigation.</div>
                  </div>
                </div>
                <div className="typing-dots" style={{ marginLeft: 42 }}>
                  <div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section className="impact-section" id="impact">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="section-label reveal" style={{ justifyContent: 'center' }}>Measured Impact</div>
          <h2 className="section-title reveal reveal-delay-1">Numbers that <span className="accent">matter</span></h2>
          <p className="reveal reveal-delay-2" style={{ fontSize: 16, color: 'var(--text-dim)', maxWidth: 500, margin: '16px auto 0', lineHeight: 1.7 }}>
            From pilot communities in Kano State — real farmers, real outcomes.
          </p>
          <div className="impact-grid reveal reveal-delay-2">
            <div className="impact-card">
              <div className="impact-number">120+</div>
              <div className="impact-label">Farmers in needs assessment consultations</div>
            </div>
            <div className="impact-card">
              <div className="impact-number">89%</div>
              <div className="impact-label">Found Hausa responses clear and actionable</div>
            </div>
            <div className="impact-card">
              <div className="impact-number">4 days</div>
              <div className="impact-label">Earlier disease detection vs. extension visits</div>
            </div>
            <div className="impact-card">
              <div className="impact-number">40%</div>
              <div className="impact-label">Of pilot farmers were women — fully served</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="testimonials-header reveal">
            <div className="section-label">From the Field</div>
            <h2 className="section-title">Farmers <span className="accent">speak</span></h2>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card reveal reveal-delay-1">
              <div className="testimonial-quote">"</div>
              <div className="testimonial-text">
                I told the AI about my sorghum in Hausa and it gave me the exact answer — which fertilizer, how much, when to apply. My harvest was the best in five years.
                <span className="hausa-quote">"Na gaya wa AI game da dawa ta a Hausa, ya ba ni amsar daidai…"</span>
              </div>
              <div className="flex items-center">
                <div className="author-avatar">👨‍🌾</div>
                <div>
                  <div className="author-name">Alhaji Rabiu Ibrahim Gezawa</div>
                  <div className="author-role">Sorghum farmer · Gezawa LGA, Kano</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card reveal reveal-delay-2">
              <div className="testimonial-quote">"</div>
              <div className="testimonial-text">
                As a woman farmer, I always felt digital tools weren't made for me. AgroLingo speaks to me in Hausa, understands my situation, and treats me like an expert.
                <span className="hausa-quote">"A matsayina na mace manomiya, na ji kayan dijital ba a yi su gare ni ba…"</span>
              </div>
              <div className="flex items-center">
                <div className="author-avatar">👩‍🌾</div>
                <div>
                  <div className="author-name">Hajiya Zainab Musa</div>
                  <div className="author-role">Tomato farmer · Bunkure, Kano</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card reveal reveal-delay-3">
              <div className="testimonial-quote">"</div>
              <div className="testimonial-text">
                The market price feature alone saved my cooperative thousands of naira. We waited two extra days and sold our groundnuts at the peak price. That's real money.
                <span className="hausa-quote">"Damar farashin kasuwa kadai ta ceci ƙungiyarmu naira dubu…"</span>
              </div>
              <div className="flex items-center">
                <div className="author-avatar">👨‍🌾</div>
                <div>
                  <div className="author-name">Alhaji Suleiman Garba</div>
                  <div className="author-role">Cooperative leader · Wudil, Kano</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECH STACK & AU ALIGNMENT */}
      <section id="tech" style={{ borderTop: '1px solid var(--glass-border)', padding: '80px 60px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="tech-inner">
            <div className="reveal">
              <div className="section-label">Technology</div>
              <h2 className="section-title">Built on <span className="accent">open</span> intelligence</h2>
              <p style={{ fontSize: 15, color: 'var(--text-dim)', lineHeight: 1.75, marginTop: 20 }}>AgroLingo is built entirely on open-source and free-tier infrastructure — making it fully replicable, auditable, and community-owned.</p>
              <div className="tech-tags">
                <div className="tech-tag"><span className="dot" style={{ background: '#FFB703' }}></span>Google Gemini 1.5 Flash</div>
                <div className="tech-tag"><span className="dot" style={{ background: '#61DAFB' }}></span>React + Vite + PWA</div>
                <div className="tech-tag"><span className="dot" style={{ background: '#00C7B7' }}></span>Vercel Edge</div>
                <div className="tech-tag"><span className="dot" style={{ background: '#3ECF8E' }}></span>Supabase</div>
                <div className="tech-tag"><span className="dot" style={{ background: '#4285F4' }}></span>Web Speech API</div>
                <div className="tech-tag"><span className="dot" style={{ background: '#FF9900' }}></span>Open-Meteo</div>
                <div className="tech-tag"><span className="dot" style={{ background: '#86C568' }}></span>Multi-Provider AI Waterfall</div>
              </div>
            </div>
            <div className="reveal reveal-delay-2">
              <div className="section-label">AU Framework Alignment</div>
              <h2 className="section-title" style={{ fontSize: 'clamp(28px,3vw,38px)' }}>Anchored in <span className="accent">continental</span> strategy</h2>
              <div className="alignment-list">
                <div className="align-item">
                  <div className="align-icon">🌍</div>
                  <div className="align-text"><strong>CESA 2026–2035</strong>Digital education tools for equitable, future-ready African learning systems.</div>
                </div>
                <div className="align-item">
                  <div className="align-icon">🤖</div>
                  <div className="align-text"><strong>AU Continental AI Strategy</strong>Ethical, community-owned AI deployed for underserved African populations.</div>
                </div>
                <div className="align-item">
                  <div className="align-icon">🔬</div>
                  <div className="align-text"><strong>STISA-2034</strong>Science and technology applied to agriculture — Africa's largest employment sector.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WAITLIST / CTA SECTION WITH FORM */}
      <section id="waitlist" style={{ position: 'relative', overflow: 'hidden', padding: '100px 60px' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 400, background: 'radial-gradient(ellipse, rgba(255, 183, 3, 0.05) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
        <div style={{ maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1, width: '100%' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="reveal">
              <p className="mono font-bold text-xs uppercase tracking-widest mb-3 text-[var(--saffron)]">Beta testing & Partnerships</p>
              <h2 className="display text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">Join the Digital Green Revolution.</h2>
              <p className="text-[var(--text-dim)] mb-8 max-w-md leading-relaxed">We are opening up priority access to select cooperatives, local government development units, and NGOs. Onboard your local communities now.</p>
            </div>
            <div className="glass rounded-3xl p-8 sm:p-12 w-full relative reveal reveal-delay-1 border border-[var(--glass-border)] overflow-hidden">
              <h3 className="display text-2xl font-bold mb-8">Secure Your Spot</h3>
              <form onSubmit={handleWaitlistSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-xs font-bold font-mono uppercase tracking-wide text-[var(--saffron)]">Full Name / Suna</label>
                  <input type="text" placeholder="Safiya Bello" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-white/5 h-12 rounded-xl px-4 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#FFB703] transition-colors" required />
                </div>
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-xs font-bold font-mono uppercase tracking-wide text-[var(--saffron)]">Phone/Contact / Tuntuba</label>
                  <input type="tel" placeholder="+234..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-white/5 h-12 rounded-xl px-4 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#FFB703] transition-colors" required />
                </div>
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-xs font-bold font-mono uppercase tracking-wide text-[var(--saffron)]">Location / Jiha</label>
                  <select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full bg-white/5 h-12 rounded-xl px-4 border border-white/10 text-white focus:outline-none focus:border-[#FFB703] transition-colors">
                    <option value="kano" className="bg-[#050a08]">Kano</option>
                    <option value="jigawa" className="bg-[#050a08]">Jigawa</option>
                    <option value="kaduna" className="bg-[#050a08]">Kaduna</option>
                    <option value="katsina" className="bg-[#050a08]">Katsina</option>
                    <option value="sokoto" className="bg-[#050a08]">Sokoto</option>
                    <option value="zamfara" className="bg-[#050a08]">Zamfara</option>
                    <option value="kebbi" className="bg-[#050a08]">Kebbi</option>
                    <option value="bauchi" className="bg-[#050a08]">Bauchi</option>
                    <option value="gombe" className="bg-[#050a08]">Gombe</option>
                    <option value="borno" className="bg-[#050a08]">Borno</option>
                    <option value="yobe" className="bg-[#050a08]">Yobe</option>
                    <option value="adamawa" className="bg-[#050a08]">Adamawa</option>
                    <option value="taraba" className="bg-[#050a08]">Taraba</option>
                    <option value="niger" className="bg-[#050a08]">Niger</option>
                    <option value="kwara" className="bg-[#050a08]">Kwara</option>
                    <option value="nasarawa" className="bg-[#050a08]">Nasarawa</option>
                    <option value="benue" className="bg-[#050a08]">Benue</option>
                    <option value="plateau" className="bg-[#050a08]">Plateau</option>
                    <option value="kogi" className="bg-[#050a08]">Kogi</option>
                    <option value="fct" className="bg-[#050a08]">FCT Abuja</option>
                    <option value="other" className="bg-[#050a08]">Other State</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2 text-left">
                  <label className="text-xs font-bold font-mono uppercase tracking-wide text-[var(--saffron)]">Primary Crop / Babban Shuka</label>
                  <input type="text" placeholder="Maize / Shinkafa" value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} className="w-full bg-white/5 h-12 rounded-xl px-4 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#FFB703] transition-colors" required />
                </div>
                <button type="submit" disabled={formLoading} className="btn-primary mt-4 h-14 flex items-center justify-center w-full">
                  {formLoading ? 'Submitting...' : 'Secure Priority Access'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="footer-grid">
            <div>
              <div className="footer-brand-title">AgroLingo <span>AI</span></div>
              <p className="footer-desc">The world's first Hausa-native agricultural intelligence assistant. Built by GreenByte Tech to serve the 50 million smallholder farmers of Northern Nigeria.</p>
              <div style={{ marginTop: 20, fontSize: 12, color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace' }}>Powered by Meta Llama 3 · Open Source · Ethical AI</div>
            </div>
            <div>
              <div className="footer-col-title">Product</div>
              <ul className="footer-links">
                <li><a href="#">AI Chat Assistant</a></li>
                <li><a href="#">Crop Disease Diagnosis</a></li>
                <li><a href="#">Market Intelligence</a></li>
                <li><a href="#">Weather Advisor</a></li>
              </ul>
            </div>
            <div>
              <div className="footer-col-title">Organisation</div>
              <ul className="footer-links">
                <li><a href="https://bit.ly/greenbyteco" target="_blank" rel="noopener noreferrer">About GreenByte Tech</a></li>
                <li><a href="#">Grant Applications</a></li>
                <li><a href="mailto:greenbyte.tech.ng@gmail.com">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© 2026 GreenByte Tech · CAC BN 9467262 · Kano State, Nigeria</div>
            <div className="footer-flag">Ƙarfin Manoma ta Hanyar AI 🌾🇳🇬</div>
          </div>
        </div>
      </footer>

      {/* TOAST SYSTEM */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 glass px-6 py-4 rounded-xl z-[100] flex items-center gap-3 animate-bounce shadow-2xl border border-white/10">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--saffron)' }} />
          <span className="font-semibold text-sm display">{toast}</span>
        </div>
      )}
    </>
  );
}
