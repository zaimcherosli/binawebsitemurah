export async function onRequestPost(context) {
  const { request, env } = context;
  const R2 = env.R2_BUCKET;

  // Sahkan binding R2 sedia ada
  if (!R2) {
    return new Response(JSON.stringify({
      success: false,
      message: "R2 Bucket binding 'R2_BUCKET' tidak dijumpai. Sila tetapkan binding R2 anda dalam dashboard Cloudflare Pages."
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const formData = await request.formData();

    const companyName = formData.get('companyName') || '';
    if (!companyName) {
      return new Response(JSON.stringify({ success: false, message: "Nama syarikat diperlukan." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Buat ID unik berasaskan nama syarikat dan timestamp
    const slug = slugify(companyName);
    const timestamp = Date.now();
    const folderId = `${slug}_${timestamp}`;

    const filesMap = {
      logo: null,
      portfolio: [],
      docs: []
    };

    // Helper untuk periksa jika input adalah fail yang sah
    const isFile = (val) => {
      return val && typeof val === 'object' && typeof val.arrayBuffer === 'function' && val.size > 0;
    };

    // 1. Muat naik Logo
    const logoFile = formData.get('logo');
    if (isFile(logoFile)) {
      const sanitizedName = sanitizeFilename(logoFile.name);
      const key = `submissions/${folderId}/logo/${sanitizedName}`;
      await R2.put(key, await logoFile.arrayBuffer(), {
        httpMetadata: { contentType: logoFile.type }
      });
      filesMap.logo = key;
    }

    // 2. Muat naik Portfolio (Berbilang gambar)
    const portfolioFiles = formData.getAll('portfolio');
    for (const file of portfolioFiles) {
      if (isFile(file)) {
        const sanitizedName = sanitizeFilename(file.name);
        const key = `submissions/${folderId}/portfolio/${sanitizedName}`;
        await R2.put(key, await file.arrayBuffer(), {
          httpMetadata: { contentType: file.type }
        });
        filesMap.portfolio.push(key);
      }
    }

    // 3. Muat naik Sijil/Lesen (Berbilang fail/PDF)
    const docFiles = formData.getAll('docs');
    for (const file of docFiles) {
      if (isFile(file)) {
        const sanitizedName = sanitizeFilename(file.name);
        const key = `submissions/${folderId}/docs/${sanitizedName}`;
        await R2.put(key, await file.arrayBuffer(), {
          httpMetadata: { contentType: file.type }
        });
        filesMap.docs.push(key);
      }
    }

    // Sediakan fail metadata JSON maklumat projek
    const briefMetadata = {
      id: folderId,
      timestamp,
      companyName: companyName.toString(),
      tagline: (formData.get('tagline') || '').toString(),
      brandColors: (formData.get('brandColors') || '').toString(),
      services: (formData.get('services') || '').toString(),
      usp: (formData.get('usp') || '').toString(),
      coverageArea: (formData.get('coverageArea') || '').toString(),
      workflow: (formData.get('workflow') || '').toString(),
      whatsapp: (formData.get('whatsapp') || '').toString(),
      email: (formData.get('email') || '').toString(),
      address: (formData.get('address') || '').toString(),
      socialMedia: (formData.get('socialMedia') || '').toString(),
      testimonials: (formData.get('testimonials') || '').toString(),
      files: filesMap
    };

    // Muat naik fail metadata JSON ke R2
    const metadataKey = `submissions/${folderId}/brief.json`;
    await R2.put(metadataKey, JSON.stringify(briefMetadata, null, 2), {
      httpMetadata: { contentType: 'application/json' }
    });

    return new Response(JSON.stringify({ success: true, id: folderId }), {
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

// Helper untuk membersihkan nama syarikat ke format slug
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Ganti ruang kosong dengan -
    .replace(/[^\w\-]+/g, '')       // Buang semua aksara bukan huruf/angka/-
    .replace(/\-\-+/g, '-');         // Ganti gandaan - dengan satu -
}

// Helper untuk menapis aksara merbahaya pada nama fail
function sanitizeFilename(name) {
  return name
    .replace(/[^a-zA-Z0-9\.\-_]/g, '_')
    .replace(/__+/g, '_');
}
