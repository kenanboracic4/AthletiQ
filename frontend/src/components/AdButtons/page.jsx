'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { useChat } from '@/hooks/Chat';
import { Flag } from 'lucide-react';

import ApplicationsModal from '@/components/ApplicationsModal/ApplicationsModal';
import ReportModal from '@/components/ReportModal/ReportModal';
import { getApplicationsByAdvertisement } from '@/api/application';
import { useRouter } from 'next/navigation';

export function AdButtons({ ad }) {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [reportOpen, setReportOpen] = useState(false);
    const { createChatAsync, isCreating } = useChat();
    const router = useRouter();

    const createChatSubmit = async () => {
        if (!user) return;

        const data = {
            advertisment_id: ad.id,
            first_user_id: user?.id,
            second_user_id: ad?.creator_id,
        };
        console.log(data)
        try {
            const newChat = await createChatAsync(data);
            router.push(`/chat/${newChat.id}`);
        } catch (error) {
            console.error(error);
        }
    };

    const isCreator = ad?.creator_id === user?.id || ad?.creator?.nickname === user?.nickname;

    return (
        <>
            <button
                className="btn-contact"
                onClick={createChatSubmit}
                disabled={isCreating}
            >
                {isCreating ? 'Kreiranje...' : 'Kontaktiraj oglašivača'}
            </button>

            {isCreator && (
                <button className="btn-apply" onClick={() => setIsModalOpen(true)}>
                    Pregled prijava ({ad.application_count})
                </button>
            )}

            {!isCreator && user && (
                <button className="btn-contact" onClick={() => setReportOpen(true)}>
                    <Flag size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
                    Prijavi oglas
                </button>
            )}

            <ApplicationsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                advertisementTitle={ad?.title}
                advertisementId={ad?.id}
            />

            {reportOpen && (
                <ReportModal
                    targetType="advertisement"
                    advertisementId={ad.id}
                    onClose={() => setReportOpen(false)}
                />
            )}
        </>
    );
}