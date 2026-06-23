'use client';

import { useState } from 'react';
import ApplicationModal from '../ApplicationModule/page';

export default function AdApply({ ad }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="ad-apply-center">
                <div className="ad-apply-card">
                    <p>
                        Pošalji prijavu direktno oglašivaču i čekaj odgovor.
                    </p>

                    <button
                        className={`btn-apply ${ad.has_applied ? 'btn-apply--disabled' : ''}`}
                        onClick={() => !ad.has_applied && setIsOpen(true)}
                        disabled={ad.has_applied}
                    >
                        {ad.has_applied ? 'Prijava je već poslata' : 'Pošalji prijavu'}
                    </button>
                </div>
            </div>

            {isOpen && (
                <ApplicationModal ad={ad} onClose={() => setIsOpen(false)} />
            )}
        </>
    );
}