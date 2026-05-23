const pageConfig = window.SEO_PAGE || {};

fetch('data/toilets.json')
  .then(response => response.json())
  .then(toilets => {
    const filtered = filterToilets(toilets, pageConfig);
    const sorted = sortToilets(filtered, pageConfig);
    renderToiletList(sorted.slice(0, pageConfig.limit || 30), filtered.length);
    addStructuredData(sorted.slice(0, pageConfig.schemaLimit || 20), filtered.length);
  })
  .catch(() => {
    const list = document.getElementById('toilet-list');
    if (list) {
      list.innerHTML = '<li class="toilet-card">Toilet data could not be loaded. Please use the main map.</li>';
    }
  });

function filterToilets(toilets, config) {
  return toilets.filter(toilet => {
    if (toilet.lat == null || toilet.lng == null) return false;
    if (config.freeOnly && !toilet.free) return false;
    if (config.accessibleOnly && !toilet.accessible) return false;
    if (config.open24Only && !is24HourToilet(toilet)) return false;
    if (config.district && toilet.district !== config.district) return false;

    if (config.landmark) {
      return distanceKm(
        config.landmark.lat,
        config.landmark.lng,
        Number(toilet.lat),
        Number(toilet.lng)
      ) <= (config.radiusKm || 1.5);
    }

    return true;
  });
}

function sortToilets(toilets, config) {
  if (!config.landmark) {
    return toilets.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  }

  return toilets.sort((a, b) => {
    const distanceA = distanceKm(config.landmark.lat, config.landmark.lng, Number(a.lat), Number(a.lng));
    const distanceB = distanceKm(config.landmark.lat, config.landmark.lng, Number(b.lat), Number(b.lng));
    return distanceA - distanceB;
  });
}

function renderToiletList(toilets, total) {
  const list = document.getElementById('toilet-list');
  const count = document.getElementById('toilet-count');

  if (count) {
    count.textContent = `${total} matching toilet locations`;
  }

  if (!list) return;

  if (!toilets.length) {
    list.innerHTML = '<li class="toilet-card">No matching toilets found in the current data.</li>';
    return;
  }

  list.innerHTML = toilets.map(toilet => {
    const badges = [
      toilet.free ? 'Free' : 'May be paid',
      toilet.accessible ? 'Accessible' : null,
      toilet.baby_changing ? 'Baby changing' : null,
      is24HourToilet(toilet) ? '24 hours' : null,
      toilet.euro_key ? 'Euro key' : null
    ].filter(Boolean).map(label => `<span class="badge">${escapeHtml(label)}</span>`).join('');

    const distance = pageConfig.landmark
      ? `${distanceKm(pageConfig.landmark.lat, pageConfig.landmark.lng, Number(toilet.lat), Number(toilet.lng)).toFixed(1)} km away`
      : `District ${escapeHtml(toilet.district || '')}`;

    return `
      <li class="toilet-card">
        <h3>${escapeHtml(toilet.name || 'Public WC')}</h3>
        <div>${badges}</div>
        <div class="toilet-meta">
          ${escapeHtml(distance)}<br>
          ${toilet.location_note ? `${escapeHtml(toilet.location_note)}<br>` : ''}
          ${toilet.schedule ? `Hours: ${escapeHtml(toilet.schedule)}<br>` : ''}
          ${toilet.notes ? escapeHtml(toilet.notes) : ''}
        </div>
      </li>
    `;
  }).join('');
}

function distanceKm(lat1, lng1, lat2, lng2) {
  const radius = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(value) {
  return value * Math.PI / 180;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function is24HourToilet(toilet) {
  const schedule = `${toilet.schedule || ''} ${toilet.personal_service || ''} ${toilet.restrictions || ''}`.toLowerCase();
  return Boolean(toilet.open_24h) ||
    schedule.includes('00:00-24:00') ||
    schedule.includes('0:00-24:00') ||
    schedule.includes('24 hours') ||
    schedule.includes('24/7');
}

function addStructuredData(toilets, totalMatches) {
  const canonical = document.querySelector('link[rel="canonical"]')?.href || window.location.href;
  const siteOrigin = new URL(canonical).origin;
  const description = document.querySelector('meta[name="description"]')?.content || '';
  const title = document.title;

  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${canonical}#webpage`,
      url: canonical,
      name: title,
      description,
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${siteOrigin}#website`,
        name: 'Free Toilets Vienna',
        url: siteOrigin
      },
      about: {
        '@type': 'Thing',
        name: pageConfig.about || 'Public toilets in Vienna'
      }
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonical}#breadcrumbs`,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Free Toilets Vienna',
          item: new URL('index.html', canonical).href
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: pageConfig.breadcrumb || title,
          item: canonical
        }
      ]
    },
    {
      '@type': 'ItemList',
      '@id': `${canonical}#toilet-list`,
      name: pageConfig.listName || title,
      numberOfItems: totalMatches,
      itemListElement: toilets.map((toilet, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: buildToiletSchema(toilet, canonical)
      }))
    }
  ];

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graph
  });
  document.head.appendChild(script);
}

function buildToiletSchema(toilet, pageUrl) {
  const streetAddress = toilet.location_note || toilet.name || 'Public WC';
  const district = toilet.district || '';
  const postalCode = district ? `1${district}0` : undefined;
  const keywords = [
    toilet.free ? 'free toilet' : null,
    toilet.accessible ? 'accessible toilet' : null,
    toilet.baby_changing ? 'baby changing' : null,
    toilet.euro_key ? 'Euro key' : null,
    'public toilet Vienna'
  ].filter(Boolean);

  const schema = {
    '@type': 'PublicToilet',
    '@id': `${pageUrl}#${slugify(toilet.id || toilet.name)}`,
    name: `${toilet.name || 'Public WC'} Public WC`,
    description: toilet.notes || 'Public toilet location in Vienna.',
    publicAccess: true,
    isAccessibleForFree: Boolean(toilet.free),
    keywords,
    address: {
      '@type': 'PostalAddress',
      streetAddress,
      addressLocality: 'Vienna',
      addressRegion: 'Vienna',
      addressCountry: 'AT'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: Number(toilet.lat),
      longitude: Number(toilet.lng)
    },
    url: pageUrl
  };

  if (postalCode) {
    schema.address.postalCode = postalCode;
  }

  if (toilet.schedule && toilet.schedule !== 'Needs verification') {
    schema.openingHours = toilet.schedule;
  }

  if (toilet.contact) {
    schema.telephone = toilet.contact;
  }

  return schema;
}

function slugify(value) {
  return String(value || 'public-wc')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
