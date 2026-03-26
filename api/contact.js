// Vercel Serverless Function for contact form
export default async function handler(req, res) {
    // Only allow POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email invalide' });
    }

    // Anti-spam: check honeypot field
    if (req.body._honeypot) {
        return res.status(200).json({ success: true }); // Silently ignore spam
    }

    try {
        // Use FormSubmit.co service (free, no API key needed)
        // The email will be sent to the configured address
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
                _template: 'table'
            })
        });

        const data = await response.json();

        if (response.ok) {
            return res.status(200).json({ success: true, message: 'Message envoye avec succes' });
        } else {
            console.error('FormSubmit error:', data);
            return res.status(500).json({ error: 'Erreur lors de l\'envoi du message' });
        }
    } catch (error) {
        console.error('Contact form error:', error);
        return res.status(500).json({ error: 'Erreur serveur' });
    }
}
