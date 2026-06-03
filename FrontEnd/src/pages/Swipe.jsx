import Card from "../components/ui/card/Card";
import "../layouts/swipe.css";
import { useState, useEffect } from "react";
import swipeApi from "../api/swipeApi";

import {
  Heart,
  X,
  Star,
  MapPin,
  MessageCircle,
} from "lucide-react";

const currentUser = {
  id: 'a1b2c3d4-0000-0000-0000-000000000005',
  name: 'Laura',
  initials: 'L',
};

function Swipe() {
  return (
    <div className="swipe-page">

      {/* TOPBAR */}

      <div className="topbar">

        <h1 className="logo">
          Flame
        </h1>

        <div className="topbar-icons">

          <div className="icon-btn">
            <MessageCircle size={22} />
          </div>

          <div className="profile-avatar">
            {currentUser.initials}
          </div>

          <span className="current-user-name" title={currentUser.id}>
            {currentUser.name}
          </span>

        </div>

      </div>

      {/* TARJETA ACTUAL (datos mock) */}

      <div className="cards-stack">
        <SwipeStack />
      </div>

    </div>
    );
  }

  function SwipeStack() {
    const [index, setIndex] = useState(0);
    const [profilesList, setProfilesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [feedError, setFeedError] = useState(null);
    const [feedDiagnostics, setFeedDiagnostics] = useState(null);

    useEffect(() => {
      let mounted = true;
      (async () => {
        setLoading(true);
        setFeedError(null);
        setFeedDiagnostics(null);
        try {
          const data = await swipeApi.getFeed({ debug: true });
          console.log('GET /api/discover/feed ->', data);
          // Backend returns an object { profiles: [...] }
          const list = data?.profiles && Array.isArray(data.profiles) ? data.profiles : (Array.isArray(data) ? data : []);
          if (mounted && list.length) {
            setProfilesList(list);
            setIndex(0);
          } else {
            console.log('Feed empty or not an array');
            if (mounted) {
              setProfilesList([]);
            }
          }
        } catch (err) {
          console.error('Error fetching feed:', err);
          if (mounted) {
            setFeedError(err.message || 'Error cargando el feed');
            setFeedDiagnostics(err.data?.detail || err.data || null);
            setProfilesList([]);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      })();
      return () => { mounted = false; };
    }, []);

    const handleNext = () => setIndex((i) => i + 1);

    const handleDislike = async () => {
      const p = profilesList[index];
      if (!p) return handleNext();
      try {
        const res = await swipeApi.pass(p.id);
        console.log(`POST /api/swipe/pass/${p.id} ->`, res);
      } catch (err) {
        console.error('pass error', err);
      }
      handleNext();
    };

    const handleLike = async () => {
      const p = profilesList[index];
      if (!p) return handleNext();
      try {
        const res = await swipeApi.like(p.id);
        console.log(`POST /api/swipe/like/${p.id} ->`, res);
      } catch (err) {
        console.error('like error', err);
      }
      handleNext();
    };

    const p = profilesList[index];

    console.log('Rendering profile at index', index, p);

    if (loading) {
      return (
        <Card>
          <div className="swipe-card-content empty-state">
            <h3>Cargando feed</h3>
            <p>Estamos consultando Neo4j y MongoDB para traer recomendaciones.</p>
          </div>
        </Card>
      );
    }

    if (feedError && profilesList.length === 0) {
      return (
        <Card>
          <div className="swipe-card-content empty-state feed-debug-panel">
            <h3>No se pudo cargar el feed</h3>
            <p>{feedError}</p>

            {feedDiagnostics ? (
              <pre className="feed-debug-json">{JSON.stringify(feedDiagnostics, null, 2)}</pre>
            ) : null}

            <button
              className="retry-feed-btn"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </button>
          </div>
        </Card>
      );
    }

    if (!p) {
      return (
        <Card>
          <div className="swipe-card-content empty-state">
            <h3>No quedan perfiles</h3>
            <p>Vuelve más tarde o reinicia la lista para ver más perfiles.</p>
          </div>
        </Card>
      );
    }

    // Fallback fields for different API shapes
    const photoUrl = (p.photos && p.photos[0]) || p.photo || p.avatar || p.photoUrl || '';
    const displayName = p.name || p.username || p.firstName || p.fullName || 'Usuario';
    const displayAge = p.age || p.years || '';
    const displayLocation = p.location || p.city || p.region || '';
    const displayBio = p.bio || p.description || '';
    const displayInterests = p.interests || p.tags || p.hobbies || [];

    return (
      <Card>
        <div className="swipe-card-content">
          <div
            className="card-image"
            style={{
              backgroundImage: `url(${photoUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="overlay-gradient"></div>

            <div className="card-info">
              <div className="name-row">
                <h2>{displayName}{displayAge ? `, ${displayAge}` : ''}</h2>
                <div className="online-dot"></div>
              </div>

              <div className="location">
                <MapPin size={16} />
                {displayLocation}
              </div>

              <p className="bio">{displayBio}</p>

              <div className="tags">
                {displayInterests && displayInterests.map((t, i) => (
                  <div className="tag" key={i}>{t}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="actions-container">
            <button className="action-btn dislike" onClick={handleDislike}>
              <X size={34} />
            </button>

            <button className="action-btn superlike">
              <Star size={28} />
            </button>

            <button className="action-btn like" onClick={handleLike}>
              <Heart size={34} />
            </button>
          </div>
        </div>
      </Card>
    );
  }

  export default Swipe;