import Card from "../components/ui/card/Card";
import "../layouts/swipe.css";

import {
  Heart,
  X,
  Star,
  MapPin,
  MessageCircle,
} from "lucide-react";

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
            C
          </div>

        </div>

      </div>

      {/* CARD REUTILIZABLE */}

      <Card>

        <div className="swipe-card-content">

          <div className="card-image">

            <div className="overlay-gradient"></div>

            <div className="card-info">

              <div className="name-row">

                <h2>Camila, 24</h2>

                <div className="online-dot"></div>

              </div>

              <div className="location">

                <MapPin size={16} />

                Buenos Aires, Argentina

              </div>

              <p className="bio">
                Amo viajar, la música indie y las noches
                de café con buena conversación ✨
              </p>

              <div className="tags">

                <div className="tag">
                  Música
                </div>

                <div className="tag">
                  Viajes
                </div>

                <div className="tag">
                  Café
                </div>

              </div>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="actions-container">

            <button className="action-btn dislike">
              <X size={34} />
            </button>

            <button className="action-btn superlike">
              <Star size={28} />
            </button>

            <button className="action-btn like">
              <Heart size={34} />
            </button>

          </div>

        </div>

      </Card>

    </div>
  );
}
export default Swipe;