/**
 * Vercel Edge Function for contact form
 * Sends emails via FormSubmit.co
 */

export const config = {
    runtime: 'edge',
};

export default async function handler(request) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers });
    }

    // Only allow POST
    if (request.method !== 'POST') {
        return new Response(
            JSON.stringify({ error: 'Method not allowed' }),
            { status: 405, headers }
        );
    }

    try {
        const body = await request.json();
        const { name, email, message, _honeypot } = body;

        // Validate required fields
        if (!name || !email || !message) {
            return new Response(
                JSON.stringify({ error: 'Tous les champs sont requis' }),
                { status: 400, headers }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return new Response(
                JSON.stringify({ error: 'Email invalide' }),
                { status: 400, headers }
            );
        }

        // Anti-spam: check honeypot field
        if (_honeypot) {
            return new Response(
                JSON.stringify({ success: true }),
                { status: 200, headers }
            );
        }

        // Use FormSubmit.co service
        // Note: FormSubmit requires email verification on first use
        // Visit https://formsubmit.co/confirm/alban.latier@gmail.com after first submission
        const response = await fetch('https://formsubmit.co/ajax/alban.latier@gmail.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                email: email,
                message: message,
                _subject: `[Adapte Recette] Nouveau message de ${name}`,
                _template: 'table',
                _captcha: 'false'
            })
        });

        if (response.ok) {
            return new Response(
                JSON.stringify({ success: true, message: 'Message envoye avec succes' }),
                { status: 200, headers }
            );
        } else {
            const errorData = await response.text();
            console.error('FormSubmit error:', response.status, errorData);

            // Check for specific FormSubmit errors
            if (response.status === 403) {
                return new Response(
                    JSON.stringify({
                        error: 'Le service de contact doit etre active. Veuillez reessayer plus tard.'
                    }),
                    { status: 503, headers }
                );
            }

            return new Response(
                JSON.stringify({ error: 'Erreur lors de l\'envoi du message. Veuillez reessayer.' }),
                { status: 500, headers }
            );
        }
    } catch (error) {
        console.error('Contact form error:', error);
        return new Response(
            JSON.stringify({ error: 'Erreur serveur. Veuillez reessayer plus tard.' }),
            { status: 500, headers }
        );
    }
}
