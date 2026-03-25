/**
 * Vercel Edge Function - Fetch description from Instagram/TikTok
 * Multiple fallback methods for better reliability
 */

export const config = {
    runtime: 'edge',
};

// User agents to try
const USER_AGENTS = {
    mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    desktop: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    bot: 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
};

/**
 * Extract Instagram post ID from URL
 */
function getInstagramId(url) {
    const patterns = [
        /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
        /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
        /instagram\.com\/reels\/([A-Za-z0-9_-]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

/**
 * Clean HTML entities and tags
 */
function cleanHtml(html) {
    if (!html) return '';
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        // HTML entities
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#x27;/g, "'")
        .replace(/&#x2F;/g, '/')
        .replace(/&apos;/g, "'")
        // Accented characters (HTML entities)
        .replace(/&agrave;/g, 'à')
        .replace(/&acirc;/g, 'â')
        .replace(/&auml;/g, 'ä')
        .replace(/&eacute;/g, 'é')
        .replace(/&egrave;/g, 'è')
        .replace(/&ecirc;/g, 'ê')
        .replace(/&euml;/g, 'ë')
        .replace(/&icirc;/g, 'î')
        .replace(/&iuml;/g, 'ï')
        .replace(/&ocirc;/g, 'ô')
        .replace(/&ouml;/g, 'ö')
        .replace(/&ugrave;/g, 'ù')
        .replace(/&ucirc;/g, 'û')
        .replace(/&uuml;/g, 'ü')
        .replace(/&ccedil;/g, 'ç')
        .replace(/&oelig;/g, 'œ')
        .replace(/&aelig;/g, 'æ')
        // Numeric HTML entities (&#xxx;)
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
        // Hex HTML entities (&#xXXX;)
        .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
        // Malformed entities like "&;" or "& ;"
        .replace(/&\s*;/g, '')
        // Unicode escapes
        .replace(/\\n/g, '\n')
        .replace(/\\u0040/g, '@')
        .replace(/\\u([0-9a-fA-F]{4})/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
        .trim();
}

/**
 * Method 1: Fetch page and extract Open Graph meta tags
 * Works because Instagram serves OG tags for link previews
 */
async function fetchViaOpenGraph(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': USER_AGENTS.bot,
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'fr-FR,fr;q=0.9',
            },
            redirect: 'follow',
        });

        if (!response.ok) return null;

        const html = await response.text();

        // Try og:description
        let match = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
        if (!match) {
            match = html.match(/<meta\s+content="([^"]+)"\s+property="og:description"/i);
        }

        if (match && match[1]) {
            const description = cleanHtml(match[1]);
            // Instagram often truncates OG description, but it's better than nothing
            if (description.length > 50) {
                return description;
            }
        }

        // Try twitter:description
        match = html.match(/<meta\s+(?:name|property)="twitter:description"\s+content="([^"]+)"/i);
        if (match && match[1]) {
            return cleanHtml(match[1]);
        }

        // Try description meta
        match = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
        if (match && match[1]) {
            return cleanHtml(match[1]);
        }

        return null;
    } catch (e) {
        console.error('OpenGraph method failed:', e);
        return null;
    }
}

/**
 * Method 2: Extract from embedded JSON data in Instagram page
 */
async function fetchViaEmbeddedJson(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': USER_AGENTS.desktop,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'fr-FR,fr;q=0.9',
                'Cache-Control': 'no-cache',
            },
            redirect: 'follow',
        });

        if (!response.ok) return null;

        const html = await response.text();

        // Look for JSON-LD structured data
        const jsonLdMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
        if (jsonLdMatch) {
            try {
                const jsonData = JSON.parse(jsonLdMatch[1]);
                if (jsonData.caption) return cleanHtml(jsonData.caption);
                if (jsonData.description) return cleanHtml(jsonData.description);
                if (jsonData.articleBody) return cleanHtml(jsonData.articleBody);
            } catch (e) {
                // JSON parse failed, continue
            }
        }

        // Look for window._sharedData or similar
        const sharedDataMatch = html.match(/window\._sharedData\s*=\s*(\{[\s\S]*?\});<\/script>/);
        if (sharedDataMatch) {
            try {
                const data = JSON.parse(sharedDataMatch[1]);
                const media = data?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media;
                if (media?.edge_media_to_caption?.edges?.[0]?.node?.text) {
                    return cleanHtml(media.edge_media_to_caption.edges[0].node.text);
                }
            } catch (e) {
                // Parse failed, continue
            }
        }

        // Look for __additionalDataLoaded or window.__additionalDataLoaded
        const additionalDataMatch = html.match(/window\.__additionalDataLoaded\s*\([^,]+,\s*(\{[\s\S]*?\})\s*\)/);
        if (additionalDataMatch) {
            try {
                const data = JSON.parse(additionalDataMatch[1]);
                if (data?.graphql?.shortcode_media?.edge_media_to_caption?.edges?.[0]?.node?.text) {
                    return cleanHtml(data.graphql.shortcode_media.edge_media_to_caption.edges[0].node.text);
                }
            } catch (e) {
                // Parse failed, continue
            }
        }

        // Look for "caption" in any script tag
        const captionMatch = html.match(/"caption"\s*:\s*\{\s*"text"\s*:\s*"([^"]+)"/);
        if (captionMatch) {
            return cleanHtml(captionMatch[1]);
        }

        // Alternative caption format
        const captionMatch2 = html.match(/"edge_media_to_caption"[\s\S]*?"text"\s*:\s*"([^"]+)"/);
        if (captionMatch2) {
            return cleanHtml(captionMatch2[1]);
        }

        return null;
    } catch (e) {
        console.error('EmbeddedJson method failed:', e);
        return null;
    }
}

/**
 * Method 3: Use Instagram's embed endpoint
 */
async function fetchViaEmbed(postId) {
    try {
        // Try both /p/ and /reel/ formats
        const urls = [
            `https://www.instagram.com/p/${postId}/embed/captioned/`,
            `https://www.instagram.com/reel/${postId}/embed/captioned/`,
        ];

        for (const embedUrl of urls) {
            const response = await fetch(embedUrl, {
                headers: {
                    'User-Agent': USER_AGENTS.mobile,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'fr-FR,fr;q=0.9',
                },
            });

            if (!response.ok) continue;

            const html = await response.text();

            // Look for caption in the embed HTML
            const patterns = [
                /<div[^>]*class="[^"]*Caption[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
                /<span[^>]*class="[^"]*Caption[^"]*"[^>]*>([\s\S]*?)<\/span>/i,
                /class="CaptionContent"[^>]*>([\s\S]*?)</i,
                /"caption":\s*"([^"]+)"/i,
            ];

            for (const pattern of patterns) {
                const match = html.match(pattern);
                if (match && match[1]) {
                    const cleaned = cleanHtml(match[1]);
                    if (cleaned.length > 20) {
                        return cleaned;
                    }
                }
            }
        }

        return null;
    } catch (e) {
        console.error('Embed method failed:', e);
        return null;
    }
}

/**
 * Method 4: Instagram GraphQL API (unofficial)
 */
async function fetchViaGraphQL(postId) {
    try {
        const graphqlUrl = `https://www.instagram.com/graphql/query/?query_hash=b3055c01b4b222b8a47dc12b090e4e64&variables=${encodeURIComponent(JSON.stringify({ shortcode: postId }))}`;

        const response = await fetch(graphqlUrl, {
            headers: {
                'User-Agent': USER_AGENTS.desktop,
                'Accept': 'application/json',
                'X-IG-App-ID': '936619743392459',
            },
        });

        if (!response.ok) return null;

        const data = await response.json();
        const caption = data?.data?.shortcode_media?.edge_media_to_caption?.edges?.[0]?.node?.text;

        if (caption) {
            return cleanHtml(caption);
        }

        return null;
    } catch (e) {
        console.error('GraphQL method failed:', e);
        return null;
    }
}

/**
 * Fetch Instagram description using multiple methods
 */
async function fetchInstagramDescription(postId, originalUrl) {
    // Try methods in order of reliability
    const methods = [
        () => fetchViaOpenGraph(originalUrl),
        () => fetchViaEmbeddedJson(originalUrl),
        () => fetchViaEmbed(postId),
        () => fetchViaGraphQL(postId),
    ];

    for (const method of methods) {
        const result = await method();
        if (result && result.length > 30) {
            return result;
        }
    }

    return null;
}

/**
 * Fetch TikTok description using oEmbed
 */
async function fetchTikTokDescription(url) {
    try {
        // TikTok oEmbed is more reliable
        const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;

        const response = await fetch(oembedUrl, {
            headers: {
                'User-Agent': USER_AGENTS.desktop,
                'Accept': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            if (data.title) {
                return cleanHtml(data.title);
            }
        }

        // Fallback: try to fetch the page directly
        const pageResponse = await fetch(url, {
            headers: {
                'User-Agent': USER_AGENTS.bot,
                'Accept': 'text/html',
            },
            redirect: 'follow',
        });

        if (pageResponse.ok) {
            const html = await pageResponse.text();

            // Try og:description
            const match = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
            if (match) {
                return cleanHtml(match[1]);
            }
        }

        return null;
    } catch (e) {
        console.error('TikTok fetch failed:', e);
        return null;
    }
}

/**
 * Main handler
 */
export default async function handler(request) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers });
    }

    if (request.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers }
        );
    }

    try {
        const body = await request.json();
        const { url } = body;

        if (!url) {
            return new Response(
                JSON.stringify({ error: 'URL is required' }),
                { status: 400, headers }
            );
        }

        let description = null;

        if (url.includes('instagram.com')) {
            const postId = getInstagramId(url);
            if (!postId) {
                return new Response(
                    JSON.stringify({ error: 'Invalid Instagram URL' }),
                    { status: 400, headers }
                );
            }
            description = await fetchInstagramDescription(postId, url);
        } else if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) {
            description = await fetchTikTokDescription(url);
        } else {
            return new Response(
                JSON.stringify({ error: 'Plateforme non supportee. Utilisez Instagram ou TikTok.' }),
                { status: 400, headers }
            );
        }

        if (!description) {
            return new Response(
                JSON.stringify({
                    error: 'Impossible d\'extraire la description. Copiez-collez la description manuellement.',
                    fallback: true
                }),
                { status: 404, headers }
            );
        }

        return new Response(
            JSON.stringify({ description }),
            { status: 200, headers }
        );

    } catch (error) {
        console.error('Error:', error);
        return new Response(
            JSON.stringify({
                error: 'Erreur lors de la recuperation. Essayez de coller la description manuellement.',
                fallback: true
            }),
            { status: 500, headers }
        );
    }
}
