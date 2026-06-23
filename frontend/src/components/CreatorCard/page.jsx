import { User } from 'lucide-react';

export function CreatorCard({ creator }) {
    if (!creator) return null;

    return (
        <div className="sidebar-card">
            <h3 className="sidebar-card-title">Objavio</h3>

            <div className="creator-row">
                <div className="creator-avatar">
                    {creator.image ? (
                        <img src={creator.image} alt={creator.nickname} />
                    ) : (
                        <User size={22} />
                    )}
                </div>

                <div className="creator-info">
                    <div className="creator-name">
                        {creator.nickname}
                    </div>

                    <div className="creator-role">
                        {creator.role}
                    </div>

                    <div className="creator-email">
                        {creator.email}
                    </div>
                </div>
            </div>
        </div>
    );
}