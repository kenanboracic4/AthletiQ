'use client';

import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { Pencil, Trash } from 'lucide-react';
import ConfirmDeleteModal from '@/components/ConfrimDeleteModal/ConfrimDeleteModa';
import EditAdvertisementModal from '@/components/EditAdvertisment/EditAdvertismentModal';
import { useAdvertismentPostMutations } from '@/hooks/AdvertismentPostMutation';

export function AdOwnerActions({ ad }) {
    const { user } = useAuth();
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const { deleteAdvertisementFn } = useAdvertismentPostMutations();

    const isOwner = user?.id === ad?.creator_id;

    if (!isOwner) return null;

    return (
        <div className="owner-actions">
            <button className="action-btn edit" onClick={() => setIsEditOpen(true)}>
                <Pencil size={15} />
            </button>
            <button className="action-btn delete" onClick={() => setIsDeleteOpen(true)}>
                <Trash size={15} />
            </button>

            {isDeleteOpen && (
                <ConfirmDeleteModal
                    onConfirm={() => {
                        deleteAdvertisementFn(ad.id);
                        setIsDeleteOpen(false);
                    }}
                    onCancel={() => setIsDeleteOpen(false)}
                    type="advertisement"
                    nickname={ad.creator?.nickname}
                />
            )}

            <EditAdvertisementModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                ad={ad}
            />
        </div>
    );
}