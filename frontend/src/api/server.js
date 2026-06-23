
import { cookies } from 'next/headers';

export const getUserByNicknameServer = async (nickname) => {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;
    const baseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    if (!refreshToken) return null;

    const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { Cookie: `refresh_token=${refreshToken}` },
        cache: 'no-store'
    });

    if (!refreshRes.ok) return null;

    const { access_token } = await refreshRes.json();

    const res = await fetch(`${baseUrl}/user/by-username/${nickname}`, {
        headers: { Authorization: `Bearer ${access_token}` },
        cache: 'no-store'
    });

    if (!res.ok) return null;
    return res.json();
}

export const getAdvertisementServer = async (advertisementId) => {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;
    const baseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    let headers = {};

    if (refreshToken) {
        try {
            const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
                method: 'POST',
                headers: { Cookie: `refresh_token=${refreshToken}` },
                cache: 'no-store'
            });

            if (refreshRes.ok) {
                const { access_token } = await refreshRes.json();
                headers['Authorization'] = `Bearer ${access_token}`;
            }
        } catch (error) {
            console.error("Greška prilikom osvežavanja tokena na serveru:", error);

        }
    }

    try {
        const res = await fetch(`${baseUrl}/advertisements/get-advertisement/${advertisementId}`, {
            headers: headers,
            cache: 'no-store'
        });

        if (!res.ok) {
            console.error(`Oglas sa ID-jem ${advertisementId} nije pronađen ili je server vratio error:`, res.status);
            return null;
        }

        return await res.json();
    } catch (error) {
        console.error("Network greška na serveru prilikom preuzimanja oglasa:", error);
        return null;
    }
};

export const getPostByIdServer = async (postId) => {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get('refresh_token')?.value;
    const baseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    let headers = {};

    if (refreshToken) {
        try {
            const refreshRes = await fetch(`${baseUrl}/auth/refresh`, {
                method: 'POST',
                headers: { Cookie: `refresh_token=${refreshToken}` },
                cache: 'no-store'
            });
            if (refreshRes.ok) {
                const { access_token } = await refreshRes.json();
                headers['Authorization'] = `Bearer ${access_token}`;
            }
        } catch (e) {
            console.error("Greška pri refreshu tokena:", e);
        }
    }

    try {
        const res = await fetch(`${baseUrl}/post/by-id/${postId}`, {
            headers,
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (e) {
        console.error("Greška pri dohvatu objave:", e);
        return null;
    }
};