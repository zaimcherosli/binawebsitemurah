export async function onRequestPost(context) {
  const { request, env } = context;

  // Read from Cloudflare Pages environment variables with encoded fallback
  const defaultToken = atob('ODgzNTY4MjA4NTpBQUVDN2d2ZG12T2F4MVZ1NUxhRFpnT2tITWMtWmlnVGZNZw==');
  const defaultChatId = atob('MTI0Mjc1NzY4');
  const BOT_TOKEN = env.TELEGRAM_BOT_TOKEN || defaultToken;
  const CHAT_ID = env.TELEGRAM_CHAT_ID || defaultChatId;

  try {
    const formData = await request.formData();
    const caption = formData.get('caption') || formData.get('text') || 'Notifikasi Tempahan Baharu Kwikezee Studio';
    const photo = formData.get('photo');
    const document = formData.get('document');

    const tgFormData = new FormData();
    tgFormData.append('chat_id', CHAT_ID);
    tgFormData.append('parse_mode', 'HTML');

    let endpointMethod = 'sendMessage';

    if (photo && typeof photo === 'object' && photo.size > 0) {
      endpointMethod = 'sendPhoto';
      tgFormData.append('photo', photo);
      tgFormData.append('caption', caption);
    } else if (document && typeof document === 'object' && document.size > 0) {
      endpointMethod = 'sendDocument';
      tgFormData.append('document', document);
      tgFormData.append('caption', caption);
    } else {
      endpointMethod = 'sendMessage';
      tgFormData.append('text', caption);
    }

    const tgResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/${endpointMethod}`, {
      method: 'POST',
      body: tgFormData
    });

    const tgResult = await tgResponse.json();

    return new Response(JSON.stringify({
      success: tgResult.ok,
      data: tgResult
    }), {
      status: tgResult.ok ? 200 : 400,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
