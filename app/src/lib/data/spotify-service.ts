
import 'server-only';

// @ts-expect-error No type definitions available for spotify-web-api-node
import SpotifyWebApi from 'spotify-web-api-node';
import { TrendingSound } from './trending-sounds';

// Type definitions for Spotify API response
interface SpotifyArtist {
    name: string;
}

interface SpotifyAlbum {
    images: { url: string }[];
}

interface SpotifyTrack {
    id: string;
    name: string;
    artists: SpotifyArtist[];
    album: SpotifyAlbum;
    preview_url: string | null;
    popularity: number;
    duration_ms: number;
}

// Spotify API credentials
// In a real app, these should be in .env.local
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || '';
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || '';

const spotifyApi = new SpotifyWebApi({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
});

// Cache token to avoid rate limits
let tokenExpirationTime = 0;

async function getAccessToken() {
    if (Date.now() < tokenExpirationTime) {
        return;
    }

    try {
        const data = await spotifyApi.clientCredentialsGrant();
        spotifyApi.setAccessToken(data.body['access_token']);
        tokenExpirationTime = Date.now() + data.body['expires_in'] * 1000;
    } catch (error) {
        console.error('Error retrieving access token', error);
    }
}

export async function fetchSpotifyTrending(): Promise<TrendingSound[]> {
    if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
        console.warn("Spotify credentials missing. Using mocks.");
        return [];
    }

    await getAccessToken();

    try {
        // Get "Viral 50 - Global" playlist
        // Note: Playlist IDs can change, but this is a common one or we can search for it
        const playlistId = '37i9dQZEVXbLiRSafKK9cZ';
        const data = await spotifyApi.getPlaylist(playlistId);

        const tracks = data.body.tracks.items.slice(0, 10).map((item: { track: SpotifyTrack | null }, index: number) => {
            const track = item.track;
            if (!track) return null;

            return {
                id: `sp-${track.id}`,
                title: track.name,
                artist: track.artists[0].name,
                platform: 'spotify',
                thumbnailUrl: track.album.images[0]?.url || '',
                previewUrl: track.preview_url || '', // Note: many tracks might not have previews
                velocity: index < 3 ? 'hot' : index < 7 ? 'rising' : 'steady',
                stats: {
                    streams: track.popularity * 10000 + Math.floor(Math.random() * 5000),
                    growthRate: Math.floor(Math.random() * 20)
                },
                rank: index + 1,
                duration: Math.floor(track.duration_ms / 1000),
                bpm: 120, // Requires audio analysis endpoint for real data
                key: 'C',
                tags: ['pop', 'viral'],
                isRemixable: true
            } as TrendingSound;
        }).filter((t: TrendingSound | null) => t !== null) as TrendingSound[];

        return tracks;
    } catch (error) {
        console.error('Error fetching Spotify data', error);
        return [];
    }
}
