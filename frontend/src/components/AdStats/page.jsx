import { Eye, Users } from 'lucide-react';

export function AdStats({ viewCount, applicationCount }) {
    return (
        <div className="sidebar-card">
            <h3 className="sidebar-card-title">Statistika</h3>

            <div className="stats-row">
                <div className="stat">
                    <Eye size={16} />
                    <div>
                        <span>{viewCount}</span>
                        <small>Pregleda</small>
                    </div>
                </div>

                <div className="stat">
                    <Users size={16} />
                    <div>
                        <span>{applicationCount}</span>
                        <small>Prijava</small>
                    </div>
                </div>
            </div>
        </div>
    );
}