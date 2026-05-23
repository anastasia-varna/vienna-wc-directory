
const map = L.map('map').setView([48.2082, 16.3738], 12);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

const markerCluster = L.markerClusterGroup({
  chunkedLoading: true,
  maxClusterRadius: 48,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false
});

map.addLayer(markerCluster);

let toiletData = [];
let currentFilteredToilets = [];
let userLocation = null;
let userMarker = null;
let accuracyCircle = null;

fetch('data/toilets.json')
  .then(response => response.json())
  .then(data => {
    toiletData = data;
    applyUrlFilters();
    applyFilters();

    ['search', 'freeOnly', 'accessibleOnly', 'babyOnly', 'openNowOnly'].forEach(id => {
      document.getElementById(id).addEventListener('input', applyFilters);
      document.getElementById(id).addEventListener('change', applyFilters);
    });

    document.getElementById('nearMe').addEventListener('click', findNearMe);
  });

function applyFilters() {
  const query = document.getElementById('search').value.trim().toLowerCase();
  const freeOnly = document.getElementById('freeOnly').checked;
  const accessibleOnly = document.getElementById('accessibleOnly').checked;
  const babyOnly = document.getElementById('babyOnly').checked;
  const openNowOnly = document.getElementById('openNowOnly').checked;

  const filtered = toiletData.filter(toilet => {
    return matchesSearch(toilet, query) &&
      (!freeOnly || toilet.free) &&
      (!accessibleOnly || toilet.accessible) &&
      (!babyOnly || toilet.baby_changing) &&
      (!openNowOnly || isProbablyOpenNow(toilet));
  });

  currentFilteredToilets = filtered;
  clearMarkers();
  renderMarkers(filtered);
  updateCount(filtered.length, toiletData.length);

  if (userLocation) {
    updateNearestPanel(findNearestToilet(userLocation, filtered));
  }
}

function renderMarkers(data) {
  data.forEach(toilet => {
    if (toilet.lat == null || toilet.lng == null) return;
    const badges = [
      toilet.free ? 'Free' : 'May be paid',
      toilet.accessible ? 'Accessible' : null,
      toilet.baby_changing ? 'Baby changing' : null,
      toilet.open_24h ? '24h' : null
    ].filter(Boolean).map(b => `<span class="badge">${b}</span>`).join('');

    const marker = L.marker([toilet.lat, toilet.lng])
      .bindPopup(`
        <strong>${toilet.name}</strong><br>
        ${badges}<br>
        <b>Area:</b> ${toilet.area || ''}<br>
        <b>District:</b> ${toilet.district}<br>
        <b>Schedule:</b> ${toilet.schedule || 'Unknown'}<br>
        <b>Status:</b> ${isProbablyOpenNow(toilet) ? 'Probably open now' : 'May be closed now'}<br>
        <p>${toilet.notes || ''}</p>
        <p><b>Source:</b> ${toilet.source || 'Community / manual entry'} ${toilet.source_url ? `<a href="${toilet.source_url}" target="_blank" rel="nofollow noopener">view</a>` : ''}</p>
        <p class="warning">${toilet.schedule_note || ''}</p>
      `);

    markerCluster.addLayer(marker);
  });
}

function clearMarkers() {
  markerCluster.clearLayers();
}

function applyUrlFilters() {
  const params = new URLSearchParams(window.location.search);
  const search = params.get('search');

  if (search) {
    document.getElementById('search').value = search;
  }

  ['freeOnly', 'accessibleOnly', 'babyOnly', 'openNowOnly'].forEach(id => {
    if (params.get(id) === 'true') {
      document.getElementById(id).checked = true;
    }
  });
}

function matchesSearch(toilet, query) {
  if (!query) return true;

  const district = String(toilet.district || '').padStart(2, '0');

  if (/^\d{1,2}$/.test(query)) {
    return district === query.padStart(2, '0');
  }

  if (/^1\d{2}0$/.test(query)) {
    return district === query.slice(1, 3);
  }

  const searchableText = [
    toilet.name,
    toilet.location_note,
    toilet.category,
    toilet.equipment,
    toilet.notes
  ].filter(Boolean).join(' ').toLowerCase();

  return searchableText.includes(query);
}

function updateCount(showing, total) {
  document.getElementById('count').textContent = `Showing ${showing} of ${total} toilet locations`;
}

function findNearMe() {
  const button = document.getElementById('nearMe');
  const nearestPanel = document.getElementById('nearest');

  if (!navigator.geolocation) {
    nearestPanel.hidden = false;
    nearestPanel.textContent = 'Location is not available in this browser.';
    return;
  }

  button.disabled = true;
  button.textContent = 'Locating...';
  nearestPanel.hidden = false;
  nearestPanel.textContent = 'Finding your nearest public toilet...';

  navigator.geolocation.getCurrentPosition(
    position => {
      userLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      drawUserLocation(userLocation);
      const nearest = findNearestToilet(userLocation, currentFilteredToilets);
      updateNearestPanel(nearest);

      if (nearest) {
        map.fitBounds([
          [userLocation.lat, userLocation.lng],
          [nearest.toilet.lat, nearest.toilet.lng]
        ], {
          padding: [42, 42],
          maxZoom: 16
        });
      } else {
        map.setView([userLocation.lat, userLocation.lng], 15);
      }

      button.disabled = false;
      button.textContent = 'Near me';
    },
    error => {
      nearestPanel.hidden = false;
      nearestPanel.textContent = error.code === error.PERMISSION_DENIED
        ? 'Location permission was blocked. You can still search by place or district.'
        : 'Could not get your location. Try again outdoors or search by landmark.';
      button.disabled = false;
      button.textContent = 'Near me';
    },
    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 60000
    }
  );
}

function drawUserLocation(location) {
  if (userMarker) map.removeLayer(userMarker);
  if (accuracyCircle) map.removeLayer(accuracyCircle);

  userMarker = L.circleMarker([location.lat, location.lng], {
    radius: 8,
    color: '#0b63ce',
    fillColor: '#0b63ce',
    fillOpacity: 1,
    weight: 3
  }).addTo(map).bindPopup('You are here');

  if (location.accuracy) {
    accuracyCircle = L.circle([location.lat, location.lng], {
      radius: location.accuracy,
      color: '#0b63ce',
      fillColor: '#0b63ce',
      fillOpacity: 0.08,
      weight: 1
    }).addTo(map);
  }
}

function findNearestToilet(location, toilets) {
  const candidates = toilets.filter(toilet => toilet.lat != null && toilet.lng != null);

  if (!candidates.length) return null;

  return candidates
    .map(toilet => ({
      toilet,
      distance: distanceKm(location.lat, location.lng, Number(toilet.lat), Number(toilet.lng))
    }))
    .sort((a, b) => a.distance - b.distance)[0];
}

function updateNearestPanel(nearest) {
  const nearestPanel = document.getElementById('nearest');
  nearestPanel.hidden = false;

  if (!nearest) {
    nearestPanel.textContent = 'No matching toilet found. Try clearing filters.';
    return;
  }

  const toilet = nearest.toilet;
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${toilet.lat},${toilet.lng}`)}`;
  const badges = [
    toilet.free ? 'Free' : null,
    toilet.accessible ? 'Accessible' : null,
    toilet.baby_changing ? 'Baby changing' : null
  ].filter(Boolean).map(label => `<span class="badge">${escapeHtml(label)}</span>`).join('');

  nearestPanel.innerHTML = `
    <strong>Nearest toilet: ${escapeHtml(toilet.name || 'Public WC')}</strong>
    <span>${nearest.distance.toFixed(1)} km away</span>
    <span>${badges}</span>
    <a href="${mapsUrl}" target="_blank" rel="noopener">Directions</a>
  `;
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

function isProbablyOpenNow(toilet) {
  if (toilet.open_24h) return true;

  // Lightweight MVP logic: parses schedules like "Daily 07:00–22:00".
  // For vague schedules, return true during normal daytime hours.
  const now = new Date();
  const hour = now.getHours() + now.getMinutes() / 60;
  const schedule = toilet.schedule || '';
  const match = schedule.match(/(\d{1,2}):(\d{2})[–-](\d{1,2}):(\d{2})/);

  if (match) {
    const open = Number(match[1]) + Number(match[2]) / 60;
    const close = Number(match[3]) + Number(match[4]) / 60;
    return hour >= open && hour <= close;
  }

  return hour >= 8 && hour <= 20;
}
