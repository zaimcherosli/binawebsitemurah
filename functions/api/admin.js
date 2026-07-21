export async function onRequestGet(context) {
  const { request, env } = context;
  const R2 = env.R2_BUCKET;

  if (!R2) {
    return new Response(JSON.stringify({ success: false, message: "R2 binding tidak dikonfigurasikan." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(request.url);
  const actualPasscode = env.ADMIN_PASSCODE || 'admin123';
  
  // Ambil token sama ada dari header atau query parameter (untuk tag img/a)
  const token = request.headers.get('X-Admin-Token') || url.searchParams.get('token');

  // Sahkan token admin
  if (token !== actualPasscode) {
    return new Response(JSON.stringify({ success: false, message: "Akses ditolak." }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 1. Jika memohon fail spesifik (R2 proxy)
  const fileKey = url.searchParams.get('file');
  if (fileKey) {
    try {
      const object = await R2.get(fileKey);
      if (object === null) {
        return new Response("Fail tidak ditemui di R2.", { status: 404 });
      }

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      headers.set("Cache-Control", "public, max-age=86400"); // Cache 1 hari untuk prestasi

      return new Response(object.body, { headers });
    } catch (err) {
      return new Response("Ralat memuat turun fail dari R2: " + err.message, { status: 500 });
    }
  }

  // 2. Jika memohon senarai taklimat klien (Default GET)
  try {
    const listResult = await R2.list({ prefix: 'submissions/', delimiter: '/' });
    const prefixes = listResult.delimitedPrefixes || [];
    const submissions = [];

    for (const prefix of prefixes) {
      const briefKey = `${prefix}brief.json`;
      const briefObj = await R2.get(briefKey);
      
      if (briefObj) {
        try {
          const briefText = await briefObj.text();
          const briefJson = JSON.parse(briefText);
          submissions.push(briefJson);
        } catch (e) {
          console.error(`Gagal membaca JSON dari ${briefKey}:`, e);
        }
      }
    }

    // Susun mengikut masa terkini dahulu (timestamp descending)
    submissions.sort((a, b) => b.timestamp - a.timestamp);

    return new Response(JSON.stringify(submissions), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  const R2 = env.R2_BUCKET;

  if (!R2) {
    return new Response(JSON.stringify({ success: false, message: "R2 binding tidak dikonfigurasikan." }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const actualPasscode = env.ADMIN_PASSCODE || 'admin123';
  const token = request.headers.get('X-Admin-Token');

  // Sahkan token admin
  if (token !== actualPasscode) {
    return new Response(JSON.stringify({ success: false, message: "Akses ditolak." }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const url = new URL(request.url);
  const folderId = url.searchParams.get('id');

  if (!folderId) {
    return new Response(JSON.stringify({ success: false, message: "ID projek diperlukan." }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const prefix = `submissions/${folderId}/`;
    
    // Senaraikan dan padam semua fail secara rekursif menggunakan cursor
    let truncated = true;
    let cursor = undefined;

    while (truncated) {
      const listOptions = { prefix };
      if (cursor) listOptions.cursor = cursor;

      const listResult = await R2.list(listOptions);
      
      for (const object of listResult.objects) {
        await R2.delete(object.key);
      }

      truncated = listResult.truncated;
      cursor = listResult.cursor;
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Semua fail di folder '${folderId}' berjaya dipadam secara kekal dari R2.` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
