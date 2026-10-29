// Initialize Proj4 for coordinate transformation
let toWGS84 = null;
let fromEPSG2770 = null;

if (typeof proj4 !== "undefined") {
  proj4.defs(
    "EPSG:27700",
    "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.060,0.1502,0.2470,0.8421,-20.4894 +units=m +no_defs",
  );
  toWGS84 = proj4("EPSG:27700", "EPSG:4326");
  proj4.defs(
    "EPSG:2770",
    "+proj=lcc +lat_0=33.5 +lon_0=-118 +lat_1=35.4666666666667 +lat_2=34.0333333333333 +x_0=2000000 +y_0=500000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs",
  );
  fromEPSG2770 = proj4("EPSG:2770", "EPSG:4326");
  console.log("Proj4 initialized for EPSG:27700 -> EPSG:4326 transformation");
} else {
  console.warn("Proj4 not available");
}

// Modal Management System
let modalTrigger = null;
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function escapeHtml(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

function formatPopupNumber(value, digits = 1) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toLocaleString("en-GB", {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
      })
    : "Unavailable";
}

function closeModal(modal) {
  modal.classList.remove("active");
  if (modalTrigger && document.contains(modalTrigger)) {
    modalTrigger.focus();
  }
  modalTrigger = null;
}

function setupModalHandlers() {
  const modals = document.querySelectorAll(".modal-overlay");

  modals.forEach((modal) => {
    const dialog = modal.querySelector(".modal-box");
    const title = dialog && dialog.querySelector(".modal-title");
    if (dialog && title) {
      if (!title.id) title.id = `${modal.id}-title`;
      dialog.setAttribute("role", "dialog");
      dialog.setAttribute("aria-modal", "true");
      dialog.setAttribute("aria-labelledby", title.id);
    }

    const closeBtn = modal.querySelector(".modal-close-btn");
    if (closeBtn) closeBtn.addEventListener("click", () => closeModal(modal));

    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  document.addEventListener("keydown", (e) => {
    const active = document.querySelector(".modal-overlay.active");
    if (!active) return;
    if (e.key === "Escape") {
      closeModal(active);
    } else if (e.key === "Tab") {
      // Keep keyboard focus inside the open modal
      const items = [...active.querySelectorAll(FOCUSABLE)].filter(
        (el) => el.offsetParent !== null,
      );
      if (!items.length) return;
      const first = items[0],
        last = items[items.length - 1];
      if (!active.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}

// Open modal by ID
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    if (modalId === "modal-howToCite") {
      const now = new Date();
      const el = document.getElementById("citeAccessedDate");
      el.dateTime = now.toLocaleDateString("en-CA");
      el.textContent = now.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
    modalTrigger = document.activeElement;
    modal.classList.add("active");
    const closeBtn = modal.querySelector(".modal-close-btn");
    if (closeBtn) closeBtn.focus();
  }
}

// ========================================
// ANNOUNCEMENT CONFIGURATION/MESSAGE OF THE DAY
// ========================================
const announcementConfig = {
  // Set to false to disable the announcement modal entirely
  enabled: true,

  // Unique ID for this announcement (change to show a different announcement)
  // Users see each unique ID only once (tracked via localStorage)
  id: "announcement-20261029",

  // Modal title
  title: "Welcome to the Safer Parks Dashboard",

  // Modal content (can include HTML)
  content: `
                <p>Explore open data for parks across England and Wales.</p>
                <p><strong>How to use:</strong></p>
                <ul>
                    <li>Select a region and authority from the left panel, or by clicking on the map.</li>
                    <li>Toggle data layers in the legend to explore different insights; the most recently toggled layer will display on top.</li>
                    <li>To save an image of the map, select the layers you wish to display, and minimise the left sidebar using the +/- symbol on the right corner, then hit the <i>Capture Screenshot</i> button in the navagation bar above.
                    </br>
                    <b>Note:</b> the required permission pop-up may not work with your browser in full-screen mode; please exit full-screen mode before clicking <i>Capture Screenshot</i>.</li>
                    <li>Large datasets may take a few seconds to load, depending on your internet speed. If the dataset does not seem to have loaded, or has only loaded partially, click the <i>Load Park</i> button again.
                </ul>
                <p>See our <i>Layer Guide</i> linked in the navigation bar above, or click on the green info icon next to each entry in the legend.
                You can re-open this modal by clicking <i>Quick Info</i> in the navigation bar above.</p>
            `,
};

// Populate and open the announcement modal (also used by the navbar Quick Info button)
function openAnnouncementModal() {
  const titleEl = document.getElementById("announcementTitle");
  const contentEl = document.getElementById("announcementContent");
  if (titleEl) titleEl.textContent = announcementConfig.title;
  if (contentEl) contentEl.innerHTML = announcementConfig.content;
  openModal("modal-announcement");
}

// Initialize announcement modal
function initAnnouncementModal() {
  const quickInfoBtn = document.getElementById("quickInfoBtn");
  if (quickInfoBtn && !announcementConfig.enabled) {
    quickInfoBtn.parentElement.style.display = "none";
  }

  if (!announcementConfig.enabled) {
    return; // Announcement is disabled
  }

  // Check if this announcement has been dismissed before
  const storageName = `safer-parks-announcement-${announcementConfig.id}`;
  const hasDismissed = localStorage.getItem(storageName);

  if (!hasDismissed) {
    // First time seeing this announcement, populate and show it
    openAnnouncementModal();

    // Mark this announcement as dismissed when closed
    const announceModal = document.getElementById("modal-announcement");
    const onDismiss = () => {
      localStorage.setItem(storageName, "true");
      announceModal.removeEventListener("click", checkDismiss);
    };

    const checkDismiss = (e) => {
      // Check if user clicked close button or outside modal
      if (e.target === announceModal || e.target.closest(".modal-close-btn")) {
        onDismiss();
      }
    };

    announceModal.addEventListener("click", checkDismiss);
  }
}

// Initialize modals after DOM is ready
document.addEventListener("DOMContentLoaded", setupModalHandlers);
document.addEventListener("DOMContentLoaded", initAnnouncementModal);

// Initialize map with zoom controls disabled (we'll add them to bottom-right)
// Remote data configuration - Load from GitHub instead of local files
let GITHUB_BASE_URL =
  "https://raw.githubusercontent.com/Safer-Parks/E12000003/refs/heads/main";
let selectedRegion = null;
const REGION_OVERVIEW_MAX_ZOOM = 8;
const REGION_DETAIL_MAX_ZOOM = 19;

// Cache of parsed GeoJSON per URL so switching parks in an authority doesn't re-download its files
const jsonCache = new Map();
function cachedFetch(url) {
  if (!jsonCache.has(url)) {
    const request = fetch(url).then(async (response) => {
      const data = response.ok ? await response.json() : null;
      return {
        ok: response.ok,
        status: response.status,
        json: async () => data,
      };
    });
    request.catch(() => jsonCache.delete(url));
    jsonCache.set(url, request);
  }
  return jsonCache.get(url);
}

const map = L.map("map", {
  zoomControl: false,
  maxZoom: REGION_OVERVIEW_MAX_ZOOM,
}).setView([54.0, -1.5], 7);

// Dedicated pane keeps the park boundary above all other vector layers
map.createPane("parkBoundaryPane");
map.getPane("parkBoundaryPane").style.zIndex = 450;

// Add zoom controls to bottom-right
L.control.zoom({ position: "bottomright" }).addTo(map);

// Add scale control
L.control
  .scale({
    position: "bottomleft",
    metric: true,
    imperial: false,
    maxWidth: 150,
  })
  .addTo(map);

// Define basemap layers
// Minimal: OSM with grayscale filter (clean, minimalist look)
// Detailed: Standard OSM (full color detail)
const minimalLayer = L.tileLayer(
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "(C) OpenStreetMap contributors",
    maxZoom: 19,
    className: "minimal-basemap",
  },
);

const osmLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "(C) OpenStreetMap contributors",
  maxZoom: 19,
});

// Add minimal layer as default
minimalLayer.addTo(map);

// Basemap toggle functionality
const detailedToggle = document.getElementById("detailedToggle");
let isDetailedMode = false;

detailedToggle.addEventListener("change", function () {
  isDetailedMode = this.checked;

  if (isDetailedMode) {
    // Switch to OSM (detailed)
    map.removeLayer(minimalLayer);
    osmLayer.addTo(map);
  } else {
    // Switch to minimal
    map.removeLayer(osmLayer);
    minimalLayer.addTo(map);
  }
});

// Cycling network toggle functionality (regional level)
const cyclingNetworkToggle = document.getElementById("cyclingNetworkToggle");
let cyclingNetworkVisible = false;

cyclingNetworkToggle.addEventListener("change", function () {
  cyclingNetworkVisible = this.checked;

  if (cyclingNetworkVisible && mapState.cyclingNetworkLayer) {
    mapState.cyclingNetworkLayer.visible = true;
    mapState.cyclingNetworkLayer.layer.addTo(map);
    updateLegend();
  } else if (
    mapState.cyclingNetworkLayer &&
    mapState.cyclingNetworkLayer.layer
  ) {
    mapState.cyclingNetworkLayer.visible = false;
    map.removeLayer(mapState.cyclingNetworkLayer.layer);
    updateLegend();
  }
});

// Pocket Parks regional toggle
const pocketParksToggle = document.getElementById("pocketParksToggle");
let pocketParksVisible = false;

pocketParksToggle.addEventListener("change", function () {
  pocketParksVisible = this.checked;

  if (pocketParksVisible && mapState.pocketParksLayer) {
    mapState.pocketParksLayer.visible = true;
    mapState.pocketParksLayer.layer.addTo(map);
    updateLegend();
  } else if (mapState.pocketParksLayer && mapState.pocketParksLayer.layer) {
    mapState.pocketParksLayer.visible = false;
    map.removeLayer(mapState.pocketParksLayer.layer);
    updateLegend();
  }
});

// State management
let mapState = {
  authorities: [],
  currentAuthority: null,
  parksLayer: null,
  allParksLayer: null,
  regionsLayer: null,
  authoritiesLayer: null,
  allParksData: [],
  sortedParks: [],
  entrancesLayer: null,
  visibilityLayer: null,
  foliageLowLayer: null,
  foliageMidLayer: null,
  foliageTallLayer: null,
  nachLayer: null,
  cyclingNetworkLayer: null,
  pocketParksLayer: null,
  featuresInParksLayer: null,
  featuresNearParksLayer: null,
  featuresInAndNearParksLayer: null,
  supplementalLightingLayer: null,
};

// Utility function to get proper path for authority
function getAuthorityPath(authorityId) {
  // Load from GitHub E12000003 repo: {GITHUB_BASE_URL}/{authorityId}/
  return `${GITHUB_BASE_URL}/${authorityId}/`;
}

// Loading notice (counter allows overlapping operations)
let loadingCount = 0;
function showLoading(message) {
  loadingCount++;
  document.getElementById("loadingNoticeText").textContent = message;
  document.getElementById("loadingNotice").classList.add("visible");
}
function hideLoading() {
  loadingCount = Math.max(0, loadingCount - 1);
  if (loadingCount === 0) {
    document.getElementById("loadingNotice").classList.remove("visible");
  }
}

// Load regions and populate the region dropdown
async function loadRegions() {
  try {
    const response = await fetch("regions.json");
    if (!response.ok) {
      throw new Error(
        `Failed to load regions: ${response.status} ${response.statusText}`,
      );
    }
    const regionsData = await response.json();
    const select = document.getElementById("regionSelect");

    // Clear existing options
    select.innerHTML = "";

    // Add default option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a region or choose on the map";
    select.appendChild(defaultOption);

    // Group regions by country (ID prefix: E = England, W = Wales)
    const englandGroup = document.createElement("optgroup");
    englandGroup.label = "England";
    const walesGroup = document.createElement("optgroup");
    walesGroup.label = "Wales / Cymru";

    regionsData.regions.forEach((region) => {
      const option = document.createElement("option");
      option.value = region.id;
      if (region.id.startsWith("W")) {
        option.textContent = `${region.name_en} / ${region.name_cy}`;
        walesGroup.appendChild(option);
      } else {
        // No Welsh translation needed for English regions
        option.textContent = region.name_en;
        englandGroup.appendChild(option);
      }
    });

    select.appendChild(englandGroup);
    select.appendChild(walesGroup);

    console.log(`Loaded ${regionsData.regions.length} regions`);
  } catch (err) {
    console.error("Error loading regions:", err);
  }
}

async function loadRegionBoundaries() {
  try {
    const response = await fetch("regions_map.geojson");
    if (!response.ok) {
      throw new Error(
        `Failed to load region boundaries: ${response.status} ${response.statusText}`,
      );
    }
    const geojson = await response.json();

    mapState.regionsLayer = L.geoJSON(geojson, {
      style: {
        color: "#6D597A",
        weight: 2,
        opacity: 0.5,
        fillColor: "#6D597A",
        fillOpacity: 0.2,
      },
      onEachFeature: (feature, layer) => {
        const properties = feature.properties || {};
        const regionName =
          properties.country === "Wales"
            ? properties.name
            : properties.placename;
        const tooltip = document.createElement("span");
        const name = document.createElement("span");
        name.textContent =
          regionName || properties.placename || "Unnamed region";
        const id = document.createElement("span");
        id.textContent = `ID: ${properties.unique_id || feature.id || "Unavailable"}`;
        tooltip.append(name, document.createElement("br"), id);
        layer.bindTooltip(tooltip, { sticky: true });

        layer.on({
          mouseover: () => layer.setStyle({ weight: 3, fillOpacity: 0.4 }),
          mouseout: () => mapState.regionsLayer.resetStyle(layer),
          click: () => {
            const regionSelect = document.getElementById("regionSelect");
            regionSelect.value = properties.unique_id;
            regionSelect.dispatchEvent(new Event("change", { bubbles: true }));
          },
        });
      },
    }).addTo(map);

    const bounds = mapState.regionsLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  } catch (error) {
    console.error("Error loading region boundaries:", error);
  }
}

// Load authorities from LUT
// THIS IS WHERE I NEED TO UPDATE FOR EACH REGION!!!
async function loadAuthorities() {
  try {
    // Determine which LUT to load based on selected region
    const lutFilename = selectedRegion
      ? `${selectedRegion}_lut.geojson`
      : "E12000003_lut.geojson";
    const response = await fetch(`${GITHUB_BASE_URL}/${lutFilename}`);
    const geojson = await response.json();

    mapState.authorities = geojson.features.map((feature) => ({
      id: feature.properties.authority_id,
      name: feature.properties.auth_name_e,
      geometry: feature.geometry, // Don't transform - just store as-is
    }));

    // Sort by name
    mapState.authorities.sort((a, b) => a.name.localeCompare(b.name));

    // Populate dropdown
    const select = document.getElementById("localAuthority");
    mapState.authorities.forEach((auth) => {
      const option = document.createElement("option");
      option.value = auth.id;
      option.textContent = auth.name;
      select.appendChild(option);
    });

    // Extract region code from LUT filename (e.g., 'E12000003_lut.geojson' -> 'E12000003')
    const regionCode = lutFilename.replace("_lut.geojson", "");
    const githubUrl = `https://github.com/Safer-Parks/${regionCode}`;

    // Remove old GitHub link if it exists
    const oldGithubContainer = document.querySelector("[data-github-link]");
    if (oldGithubContainer) {
      oldGithubContainer.remove();
    }

    // Add GitHub link to the menu
    const githubLinkContainer = document.createElement("div");
    githubLinkContainer.setAttribute("data-github-link", "true");
    githubLinkContainer.style.marginTop = "1rem";
    githubLinkContainer.style.paddingTop = "1rem";
    githubLinkContainer.style.borderTop = "1px solid #ddd";
    githubLinkContainer.style.textAlign = "center";

    const githubLink = document.createElement("a");
    githubLink.href = githubUrl;
    githubLink.textContent = "Download this data";
    githubLink.target = "_blank";
    githubLink.rel = "noopener noreferrer";
    githubLink.style.color = "#572B70";
    githubLink.style.textDecoration = "none";
    githubLink.style.fontWeight = "bold";
    githubLink.style.display = "block";

    githubLink.addEventListener("hover", function () {
      this.style.textDecoration = "underline";
    });

    githubLinkContainer.appendChild(githubLink);

    // Add the container to the controls panel
    const controlsContent = document.getElementById("controls-content");
    controlsContent.appendChild(githubLinkContainer);

    console.log(`Loaded ${mapState.authorities.length} authorities`);
    console.log(`GitHub repository: ${githubUrl}`);
  } catch (error) {
    console.error("Error loading authorities:", error);
  }
}

// Update sidebar header to the most specific selection
function updateExploreTitle() {
  const selectedText = (id) => {
    const sel = document.getElementById(id);
    return sel && sel.value !== "" && sel.selectedIndex >= 0
      ? sel.options[sel.selectedIndex].textContent
      : "";
  };
  document.getElementById("exploreTitle").textContent =
    selectedText("parks") ||
    selectedText("localAuthority") ||
    selectedText("regionSelect") ||
    "Explore Parks";
}
["regionSelect", "localAuthority", "parks"].forEach((id) =>
  document.getElementById(id).addEventListener("change", updateExploreTitle),
);

// Handle region selection
document
  .getElementById("regionSelect")
  .addEventListener("change", async (e) => {
    const regionId = e.target.value;
    if (!regionId) {
      document.getElementById("localAuthority").disabled = true;
      document.getElementById("localAuthority").innerHTML =
        '<option value="">Select a region first</option>';
      document.getElementById("parks").disabled = true;
      document.getElementById("parks").innerHTML =
        '<option value="">Select an authority first</option>';
      updateExploreTitle();
      return;
    }

    // Update global region and GITHUB_BASE_URL
    selectedRegion = regionId;
    GITHUB_BASE_URL = `https://raw.githubusercontent.com/Safer-Parks/${regionId}/refs/heads/main`;
    map.setMaxZoom(REGION_DETAIL_MAX_ZOOM);

    if (mapState.regionsLayer && map.hasLayer(mapState.regionsLayer)) {
      const selectedRegionFeature = mapState.regionsLayer
        .getLayers()
        .find((layer) => layer.feature.properties.unique_id === regionId);
      if (selectedRegionFeature) {
        map.fitBounds(selectedRegionFeature.getBounds(), { padding: [30, 30] });
      }
      map.removeLayer(mapState.regionsLayer);
    }

    // Clear existing authorities
    mapState.authorities = [];
    document.getElementById("localAuthority").disabled = false;
    document.getElementById("localAuthority").innerHTML =
      '<option value="">Select an area</option>';
    document.getElementById("parks").disabled = true;
    document.getElementById("parks").innerHTML =
      '<option value="">Select an authority first</option>';
    updateExploreTitle();

    // Load authorities for the selected region
    await loadAuthorities();

    // Reload regional layers for the new region
    // Reset toggles and their associated visibility variables
    pocketParksToggle.checked = false;
    pocketParksVisible = false;
    cyclingNetworkToggle.checked = false;
    cyclingNetworkVisible = false;

    await loadRegionalPocketParks();
    await loadRegionalCyclingNetwork();
  });

// Handle authority selection
document
  .getElementById("localAuthority")
  .addEventListener("change", async (e) => {
    const authorityId = e.target.value;
    if (!authorityId) {
      document.getElementById("parks").disabled = true;
      document.getElementById("parks").innerHTML =
        '<option value="">Select an authority first</option>';
      updateExploreTitle();
      return;
    }

    const authority = mapState.authorities.find((a) => a.id === authorityId);
    mapState.currentAuthority = authority;

    // Load parks for this authority
    showLoading(`Loading ${authority.name}...`);
    try {
      await loadParksForAuthority(authority);
    } finally {
      hideLoading();
    }
  });

// Transform coordinates from EPSG:27700 to EPSG:4326
function transformCoordinates(geometry) {
  if (!geometry || !toWGS84) {
    console.warn(
      "Cannot transform: geometry=" + !!geometry + ", toWGS84=" + !!toWGS84,
    );
    return geometry;
  }

  function transformPoint(coord) {
    if (!coord || coord.length < 2) {
      console.error("Invalid coordinate:", coord);
      return coord;
    }
    try {
      // coord is [easting, northing] in EPSG:27700
      const transformed = toWGS84.forward([coord[0], coord[1]]);

      // proj4.forward() returns an array [lon, lat]
      if (Array.isArray(transformed) && transformed.length >= 2) {
        return [transformed[0], transformed[1]]; // [lon, lat] for GeoJSON
      } else if (
        typeof transformed === "object" &&
        transformed.x !== undefined &&
        transformed.y !== undefined
      ) {
        // Handle object format in case it changes
        return [transformed.x, transformed.y];
      } else {
        console.error(
          "Invalid transformed format:",
          transformed,
          "from",
          coord,
        );
        return coord;
      }
    } catch (err) {
      console.error("Error transforming point:", coord, err);
      return coord;
    }
  }

  function transformGeometry(geom) {
    if (!geom) return null;

    try {
      if (geom.type === "Polygon") {
        return {
          type: "Polygon",
          coordinates: geom.coordinates.map((ring) => ring.map(transformPoint)),
        };
      } else if (geom.type === "LineString") {
        return {
          type: "LineString",
          coordinates: geom.coordinates.map(transformPoint),
        };
      } else if (geom.type === "MultiLineString") {
        return {
          type: "MultiLineString",
          coordinates: geom.coordinates.map((line) => line.map(transformPoint)),
        };
      } else if (geom.type === "MultiPoint") {
        return {
          type: "MultiPoint",
          coordinates: geom.coordinates.map(transformPoint),
        };
      } else if (geom.type === "MultiPolygon") {
        return {
          type: "MultiPolygon",
          coordinates: geom.coordinates.map((poly) =>
            poly.map((ring) => ring.map(transformPoint)),
          ),
        };
      } else if (geom.type === "Point") {
        return {
          type: "Point",
          coordinates: transformPoint(geom.coordinates),
        };
      }
      return geom;
    } catch (err) {
      console.error("Error transforming geometry:", err);
      return geom;
    }
  }

  return transformGeometry(geometry);
}

// Load parks GeoJSON for selected authority
function getParkSizeDetails(properties) {
  const areaValue =
    properties["Total Area (m²)"] ??
    properties.area_m2 ??
    properties["Area (m2)"] ??
    properties.total_area;
  const areaM2 =
    areaValue === null || areaValue === undefined
      ? NaN
      : Number(String(areaValue).replace(/,/g, "").trim());

  if (!Number.isFinite(areaM2) || areaM2 < 0) {
    return { areaM2: null, sizeCategory: "Area unavailable" };
  }
  if (areaM2 <= 5000) {
    return { areaM2, sizeCategory: "Pocket park" };
  }
  if (areaM2 > 100000) {
    return { areaM2, sizeCategory: "Large park" };
  }
  return { areaM2, sizeCategory: "Small/Medium park" };
}

function getParkSizeColor(sizeCategory) {
  return sizeCategory === "Large park" ? "#572B70" : "#4F6C37";
}

async function loadParksForAuthority(authority) {
  // Clear the previous area's overview, then reuse the reset handler
  // to remove any park-specific layers, toggles and legend.
  if (mapState.allParksLayer) {
    map.removeLayer(mapState.allParksLayer);
    mapState.allParksLayer = null;
  }
  document.getElementById("resetMapBtn").click();

  if (mapState.featuresInAndNearParksLayer) {
    map.removeLayer(mapState.featuresInAndNearParksLayer.layer);
    mapState.featuresInAndNearParksLayer = null;
  }
  mapState.featuresInParksLayer = null;
  mapState.featuresNearParksLayer = null;

  try {
    const authPath = getAuthorityPath(authority.id);
    const authName = authority.name;

    // Try different filenames in order of preference
    const filenames = [
      `${authName}_parks.geojson`,
      `${authName}_pocket_parks.geojson`,
      `${authName}_pp_or_g_cmb.geojson`,
    ];

    let parksData = null;
    let successFile = null;

    for (const filename of filenames) {
      try {
        const response = await fetch(`${authPath}${filename}`);
        if (response.ok) {
          parksData = await response.json();
          successFile = filename;
          console.log(`Loaded parks from ${successFile}`);
          break;
        }
      } catch (err) {
        console.log(`File not found: ${filename}`);
      }
    }

    if (!parksData || !parksData.features || parksData.features.length === 0) {
      console.warn("No parks found for this authority");
      document.getElementById("parks").disabled = true;
      document.getElementById("parks").innerHTML =
        '<option value="">No parks data</option>';
      return;
    }

    // Extract park names from features and transform coordinates
    const parks = parksData.features.map((feature) => {
      const properties = feature.properties || {};
      const sizeDetails = getParkSizeDetails(properties);
      return {
        name:
          properties["Park Name"] ||
          properties.name ||
          `Park ${properties.park_offical_id || "Unknown"}`,
        id: properties.park_offical_id,
        newParkId: properties.new_park_id,
        sourceGeometry: feature.geometry,
        geometry: transformCoordinates(feature.geometry),
        areaM2: sizeDetails.areaM2,
        sizeCategory: sizeDetails.sizeCategory,
        properties,
      };
    });

    // Sort by name
    parks.sort((a, b) => a.name.localeCompare(b.name));

    // Store sorted parks for later use and dropdown index matching
    mapState.sortedParks = parks;
    mapState.allParksData = parks;

    // Check which parks have toilet data available
    const parksWithToilets = new Set();
    try {
      // Try to fetch the toilet dataset directory listing
      // We'll check each park's toilet file existence asynchronously
      const toiletChecks = parks.map(async (park) => {
        try {
          const toiletFilename = `toilet_dataset/${park.id}_toilets.geojson`;
          const response = await fetch(`${authPath}${toiletFilename}`, {
            method: "HEAD",
          });
          if (response.ok || response.status === 200) {
            parksWithToilets.add(park.id);
          }
        } catch (error) {
          // File doesn't exist or can't be checked, skip
        }
      });

      // Wait for all toilet checks to complete
      await Promise.all(toiletChecks);
      console.log(`Parks with toilet data: ${parksWithToilets.size}`);
    } catch (error) {
      console.log("Could not check for toilet datasets");
    }

    // Store for use in tooltip generation
    mapState.parksWithToilets = parksWithToilets;

    // Check which parks have bench data available
    const parksWithBenches = new Set();
    try {
      // Try to fetch the bench dataset directory listing
      // We'll check each park's bench file existence asynchronously
      const benchChecks = parks.map(async (park) => {
        try {
          const benchFilename = `bench_dataset/${park.id}.geojson`;
          const response = await fetch(`${authPath}${benchFilename}`, {
            method: "HEAD",
          });
          if (response.ok) {
            parksWithBenches.add(park.id);
          }
        } catch (error) {
          // File doesn't exist or can't be checked, skip
        }
      });

      // Wait for all bench checks to complete
      await Promise.all(benchChecks);
      console.log(`Parks with bench data: ${parksWithBenches.size}`);
      console.log(`Park IDs with benches:`, Array.from(parksWithBenches));
    } catch (error) {
      console.log("Could not check for bench datasets");
    }

    // Store for use in tooltip generation
    mapState.parksWithBenches = parksWithBenches;

    // Remove existing all parks layer
    if (mapState.allParksLayer) {
      map.removeLayer(mapState.allParksLayer);
    }

    // Create GeoJSON layer for all parks
    const allParksGeoJSON = {
      type: "FeatureCollection",
      features: mapState.allParksData.map((park) => ({
        type: "Feature",
        geometry: park.geometry,
        properties: {
          name: park.name,
          area: park.areaM2,
          sizeCategory: park.sizeCategory,
        },
      })),
    };

    mapState.allParksLayer = L.geoJSON(allParksGeoJSON, {
      style: function (feature) {
        // Use purple for large parks (>10ha), dark green for others
        const color = getParkSizeColor(feature.properties.sizeCategory);
        return {
          color: color,
          weight: 4,
          opacity: 1,
          fillColor: color,
          fillOpacity: 0.5,
        };
      },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          `<strong>${escapeHtml(feature.properties.name || "Park")}</strong>`,
        );

        // Add hover tooltip with park name and area
        const parkName = feature.properties.name;
        const areaLabel =
          feature.properties.area === null
            ? "Area unavailable"
            : `Area: ${formatPopupNumber(feature.properties.area, 0)} m²`;
        const sizeColor = getParkSizeColor(feature.properties.sizeCategory);
        let tooltipContent = `<strong>${escapeHtml(parkName)}</strong><br/>${areaLabel}<br/><span style="display:inline-block;margin-top:0.25rem;padding:0.15rem 0.4rem;border-radius:0.25rem;background:${sizeColor};color:#fff;font-weight:600;">${escapeHtml(feature.properties.sizeCategory)}</span>`;

        // Find the park ID for this feature
        const parkData = mapState.sortedParks.find((p) => p.name === parkName);
        if (
          parkData &&
          mapState.parksWithToilets &&
          mapState.parksWithToilets.has(parkData.id)
        ) {
          tooltipContent += "<br/>Nearby toilet";
        }
        if (
          parkData &&
          mapState.parksWithBenches &&
          mapState.parksWithBenches.has(parkData.id)
        ) {
          tooltipContent += "<br/>Has benches";
        }

        layer.bindTooltip(tooltipContent, {
          permanent: false,
          direction: "top",
          className: "park-tooltip",
        });

        // Click to select park
        layer.on("click", () => {
          const parkIndex = mapState.sortedParks.findIndex(
            (p) => p.name === parkName,
          );

          if (parkIndex !== -1) {
            document.getElementById("parks").value = parkIndex;
            document.getElementById("loadPark").click();
          }
        });
      },
    }).addTo(map);

    console.log(`Rendered ${mapState.allParksData.length} parks on map`);

    // Populate parks dropdown
    const parksSelect = document.getElementById("parks");
    parksSelect.innerHTML =
      '<option value="">Select a park or choose on the map</option>';

    parks.forEach((park, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = park.name;
      parksSelect.appendChild(option);
    });

    parksSelect.disabled = false;
    document.getElementById("loadPark").disabled = false;

    // Fit map to all parks
    if (mapState.allParksLayer) {
      const bounds = mapState.allParksLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    console.log(`Loaded ${parks.length} parks from ${successFile}`);
    updateLegend();

    // Cache both feature datasets for filtering around the selected park.
    await loadFeaturesInParks(authority);
    await loadFeaturesNearParks(authority);
  } catch (error) {
    console.error("Error loading parks:", error);
  }
}

// Combine both datasets, filtering in EPSG:27700 before projecting
// selected features for display.
function createFeaturesInAndNearParkLayer(parkGeometry) {
  if (mapState.featuresInAndNearParksLayer) {
    map.removeLayer(mapState.featuresInAndNearParksLayer.layer);
  }

  const parkBounds = getFeatureCoordinateBounds(parkGeometry);
  if (!parkBounds) {
    console.warn(
      "Cannot filter nearby features: selected park bounds are invalid",
    );
    mapState.featuresInAndNearParksLayer = null;
    return;
  }

  const bufferedBounds = [
    parkBounds[0] - 800,
    parkBounds[1] - 800,
    parkBounds[2] + 800,
    parkBounds[3] + 800,
  ];
  const combinedFeatures = L.featureGroup();

  [
    [mapState.featuresInParksLayer, false],
    [mapState.featuresNearParksLayer, true],
  ].forEach(([sourceLayer, isNearPark]) => {
    if (!sourceLayer) return;

    sourceLayer.features.forEach(({ feature, bounds }) => {
      if (
        bounds[0] > bufferedBounds[2] ||
        bounds[2] < bufferedBounds[0] ||
        bounds[1] > bufferedBounds[3] ||
        bounds[3] < bufferedBounds[1]
      ) {
        return;
      }

      try {
        const featureName = isNearPark
          ? getFeatureLabelNear(feature.properties || {})
          : getFeatureLabelIn(feature.properties || {});
        const category = window.categoriseParkFeature(featureName);
        if (!category) return;

        const projectedGeometry = transformCoordinates(feature.geometry);
        if (!projectedGeometry) return;

        const featureStyle = {
          color: category.color,
          weight: 2,
          opacity: 0.9,
          fillColor: category.color,
          fillOpacity: 0.45,
          dashArray: null,
        };
        const featureLayer = L.geoJSON(
          {
            type: "Feature",
            geometry: projectedGeometry,
            properties: feature.properties || {},
          },
          {
            style: featureStyle,
            pointToLayer: (_feature, latlng) =>
              L.circleMarker(latlng, {
                radius: 5,
                color: category.color,
                weight: 2,
                opacity: 0.9,
                fillColor: category.color,
                fillOpacity: 0.5,
              }),
            onEachFeature: (_feature, layer) => {
              layer.bindTooltip(escapeHtml(featureName), {
                permanent: false,
                direction: "top",
                className: getFeatureTooltipClass(category.color),
              });
              layer._featureType = category.name;
            },
          },
        );

        featureLayer.eachLayer((layer) => {
          layer._featureType = category.name;
          combinedFeatures.addLayer(layer);
        });
      } catch (error) {
        console.warn("Error processing nearby park feature:", error);
      }
    });
  });

  mapState.featuresInAndNearParksLayer = {
    id: "features-in-and-near-parks",
    name: "Features and facilities",
    layer: combinedFeatures,
    visible: false,
  };
}

// Load selected park on map
document.getElementById("loadPark").addEventListener("click", async () => {
  const parksSelect = document.getElementById("parks");
  const selectedIndex = parksSelect.value;

  if (selectedIndex === "") {
    alert("Please select a park first");
    return;
  }

  updateExploreTitle();

  // Drop placeholders left by a previous park's unavailable catchment
  ["nachLayer", "walkingLayer", "cyclingLayer"].forEach((key) => {
    if (mapState[key] && mapState[key].unavailableMessage) mapState[key] = null;
  });
  const selectedPark = mapState.sortedParks[selectedIndex];

  if (!selectedPark || !selectedPark.geometry) {
    console.error("Park geometry not found at index", selectedIndex);
  }

  showLoading(`Loading ${selectedPark ? selectedPark.name : "park"}...`);
  try {
    // Remove existing park layer
    if (mapState.parksLayer) {
      map.removeLayer(mapState.parksLayer);
    }

    // Create GeoJSON feature for selected park
    const parkFeature = {
      type: "Feature",
      geometry: selectedPark.geometry,
      properties: {
        name: selectedPark.name,
      },
    };

    // Create layer with prominent styling
    // White casing under a green line keeps the boundary visible on any background
    const boundaryCasing = L.geoJSON(parkFeature, {
      pane: "parkBoundaryPane",
      interactive: false,
      style: { color: "#fff", weight: 5, opacity: 1, fill: false },
    });
    const boundaryLine = L.geoJSON(parkFeature, {
      pane: "parkBoundaryPane",
      style: { color: "#4F6C37", weight: 3, opacity: 1, fill: false },
      onEachFeature: (feature, layer) => {
        layer.bindPopup(
          `<strong>${escapeHtml(feature.properties.name || "Park")}</strong>`,
          { closeButton: true },
        );
        layer.openPopup();
      },
    });
    mapState.parksLayer = L.featureGroup([boundaryCasing, boundaryLine]).addTo(
      map,
    );

    // Store layer info for toggling
    mapState.parkBoundaryLayer = {
      id: "park-boundary",
      name: "Park Boundary",
      layer: mapState.parksLayer,
      visible: true,
    };

    createFeaturesInAndNearParkLayer(selectedPark.sourceGeometry);

    mapState.otherParksLayer = {
      id: "all-parks",
      name: "Nearby Parks",
      layer: mapState.allParksLayer,
      visible: false,
    };

    // Remove other parks layer from map by default
    if (map.hasLayer(mapState.allParksLayer)) {
      map.removeLayer(mapState.allParksLayer);
    }

    // Fit map to park bounds with padding
    const bounds = mapState.parksLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
      console.log("Zoomed to park:", selectedPark.name, "Bounds:", bounds);
    } else {
      console.warn("Invalid bounds for park:", selectedPark.name);
    }

    // Display park name in nav
    const navParkName = document.getElementById("navParkName");
    navParkName.textContent = "Park: " + selectedPark.name;
    navParkName.style.display = "inline";

    // Park datasets are independent, so load them concurrently
    const results = await Promise.allSettled([
      loadParkEntrances(selectedPark),
      loadDemographicsData(selectedPark),
      loadVisibilityHexagons(selectedPark),
      loadFoliageHexagons(selectedPark),
      loadNACHNetwork(selectedPark),
      loadToiletDataset(selectedPark),
      loadBenchesDataset(selectedPark),
      loadCyclingDataset(selectedPark),
      loadWalkingDataset(selectedPark),
      loadSupplementalLighting(selectedPark),
    ]);
    results.forEach((r) => {
      if (r.status === "rejected")
        console.error("Park dataset failed to load:", r.reason);
    });

    // These layers depend on the demographics catchment; grey them out if it is misplaced
    if (
      mapState.demographicsLayer &&
      mapState.demographicsLayer.unavailableMessage
    ) {
      const dependentLayers = [
        ["nachLayer", "nach-network", "Predicted Route Popularity (NACH)"],
        ["walkingLayer", "park-walking", "Walking Routes"],
        ["cyclingLayer", "park-cycling", "Cycling Routes"],
      ];
      dependentLayers.forEach(([key, id, name]) => {
        if (
          mapState[key] &&
          mapState[key].layer &&
          map.hasLayer(mapState[key].layer)
        ) {
          map.removeLayer(mapState[key].layer);
        }
        mapState[key] = {
          id,
          name,
          layer: null,
          visible: false,
          unavailableMessage: mapState.demographicsLayer.unavailableMessage,
        };
      });
    }

    // Show and populate layer toggles for both layers
    const layerToggles = [mapState.parkBoundaryLayer, mapState.otherParksLayer];
    if (mapState.entrancesLayer) {
      layerToggles.push(mapState.entrancesLayer);
    }
    if (mapState.visibilityLayer) {
      layerToggles.push(mapState.visibilityLayer);
    }
    if (mapState.nachLayer) {
      layerToggles.push(mapState.nachLayer);
    }
    if (mapState.toiletLayer) {
      layerToggles.push(mapState.toiletLayer);
    }
    if (mapState.benchesLayer) {
      layerToggles.push(mapState.benchesLayer);
    }
    if (mapState.cyclingLayer) {
      layerToggles.push(mapState.cyclingLayer);
    }
    if (mapState.walkingLayer) {
      layerToggles.push(mapState.walkingLayer);
    }
    if (mapState.supplementalLightingLayer) {
      layerToggles.push(mapState.supplementalLightingLayer);
    }
    if (mapState.foliageLowLayer) {
      layerToggles.push(mapState.foliageLowLayer);
    }
    if (mapState.foliageMidLayer) {
      layerToggles.push(mapState.foliageMidLayer);
    }
    if (mapState.foliageTallLayer) {
      layerToggles.push(mapState.foliageTallLayer);
    }
    if (mapState.featuresInAndNearParksLayer) {
      layerToggles.push(mapState.featuresInAndNearParksLayer);
    }
    if (mapState.demographicsLayer) {
      layerToggles.push(mapState.demographicsLayer);
    }
    populateLayerToggles(layerToggles);
    updateLegend();
  } finally {
    hideLoading();
  }
});

// Load park entrances for selected park
async function loadParkEntrances(park) {
  try {
    // Remove existing entrances layer
    if (mapState.entrancesLayer && mapState.entrancesLayer.layer) {
      map.removeLayer(mapState.entrancesLayer.layer);
    }

    const authPath = getAuthorityPath(mapState.currentAuthority.id);
    const authName = mapState.currentAuthority.name;

    // Try to load entrances file
    const entrancesFilename = `${authName}_park_entrances.geojson`;

    try {
      const response = await cachedFetch(`${authPath}${entrancesFilename}`);
      if (!response.ok) {
        console.log(`Entrances file not found: ${entrancesFilename}`);
        return;
      }

      const entrancesData = await response.json();

      // Filter entrances for this park
      const parkEntrances = entrancesData.features.filter(
        (feature) => feature.properties.park_offical_id === park.id,
      );

      if (parkEntrances.length === 0) {
        console.log(`No entrances found for park: ${park.name}`);
        return;
      }

      // Transform coordinates and create markers
      const entranceMarkers = L.featureGroup();

      parkEntrances.forEach((entrance, index) => {
        const transformedGeometry = transformCoordinates(entrance.geometry);

        console.log(`Entrance ${index}:`, {
          original: entrance.geometry.coordinates,
          transformed: transformedGeometry.coordinates,
          latLng: [
            transformedGeometry.coordinates[1],
            transformedGeometry.coordinates[0],
          ],
        });

        // Determine entrance type and style
        const source = entrance.properties.source;
        let entranceType, color, icon;

        if (source === "os" || source === "osm_tagged") {
          entranceType = "Primary Entrance";
          color = "#EE655F"; // Orange-Red
        } else if (source === "osm_intersection") {
          entranceType = "Secondary Entrance";
          color = "#95a5a6"; // grey
        } else {
          entranceType = "Unknown";
          color = "#95a5a6"; // Grey
        }

        // Create custom marker
        const marker = L.circleMarker(
          [
            transformedGeometry.coordinates[1],
            transformedGeometry.coordinates[0],
          ],
          {
            radius: 6,
            fillColor: color,
            color: color,
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          },
        );

        // Add popup
        marker.bindPopup(
          `<strong>${escapeHtml(entranceType)}</strong><br/>Source: ${escapeHtml(source)}`,
        );

        entranceMarkers.addLayer(marker);
      });

      // Add layer to map
      entranceMarkers.addTo(map);

      // Store layer info for toggling
      mapState.entrancesLayer = {
        id: "park-entrances",
        name: "Access and Exit Points",
        layer: entranceMarkers,
        visible: true,
      };

      console.log(`Loaded ${parkEntrances.length} entrances for ${park.name}`);
      console.log(
        "Entrances layer stored in mapState:",
        mapState.entrancesLayer,
      );
    } catch (error) {
      console.error("Error loading entrances:", error);
    }
  } catch (error) {
    console.error("Error in loadParkEntrances:", error);
  }
}

// Helper functions for hexagon calculation
function toRad(deg) {
  return (deg * Math.PI) / 180;
}

function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

// Calculate destination point given distance and bearing
function destinationPoint(lat, lon, distanceM, bearingDeg) {
  const R = 6371000; // Earth radius in meters
  const phi1 = toRad(lat);
  const lambda1 = toRad(lon);
  const theta = toRad(bearingDeg);
  const delta = distanceM / R;

  const phi2 = Math.asin(
    Math.sin(phi1) * Math.cos(delta) +
      Math.cos(phi1) * Math.sin(delta) * Math.cos(theta),
  );
  const lambda2 =
    lambda1 +
    Math.atan2(
      Math.sin(theta) * Math.sin(delta) * Math.cos(phi1),
      Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2),
    );

  return [toDeg(phi2), toDeg(lambda2)];
}

// Create hexagon from center point and radius in meters
function createHexFromCenter(lat, lon, radiusM) {
  const hexPoints = [];
  for (let i = 0; i < 6; i++) {
    const bearing = i * 60; // 6 points, 60 degrees apart
    const point = destinationPoint(lat, lon, radiusM, bearing);
    hexPoints.push([point[0], point[1]]); // [lat, lon] for Leaflet
  }
  hexPoints.push(hexPoints[0]); // Close the polygon
  return hexPoints;
}

// Hexagon radius configuration
const HEX_RADIUS_M = 8; // Fixed radius in meters for all visibility hexagons

// Load visibility hexagons for selected park
async function loadVisibilityHexagons(park) {
  try {
    // Remove existing visibility layer
    if (mapState.visibilityLayer && mapState.visibilityLayer.layer) {
      map.removeLayer(mapState.visibilityLayer.layer);
    }

    const authPath = getAuthorityPath(mapState.currentAuthority.id);
    const authName = mapState.currentAuthority.name;

    // Get the new_park_id from the park object
    if (!park.newParkId) {
      console.log(`No new_park_id found for park: ${park.name}`);
      return;
    }

    // Try to load visibility file from combined parks directory
    const visibilityFilename = `${authName}_pp_or_g_cmb/${park.newParkId}_visibility.geojson`;

    try {
      const response = await cachedFetch(`${authPath}${visibilityFilename}`);
      if (!response.ok) {
        console.log(`Visibility file not found: ${visibilityFilename}`);
        return;
      }

      const visibilityData = await response.json();

      if (!visibilityData.features || visibilityData.features.length === 0) {
        console.log(`No visibility data found for park: ${park.name}`);
        return;
      }

      // Create hexagon layer
      const hexagonLayer = L.featureGroup();

      // Get visibility range for color scaling
      const visibilityValues = visibilityData.features.map(
        (f) => f.properties.visibility_pct || 0,
      );
      const minVis = Math.min(...visibilityValues);
      const maxVis = Math.max(...visibilityValues);

      // Create color scale using a simple viridis-like interpolation
      // Define viridis color stops (since chroma may not be available)
      const viridisColors = [
        "#440154",
        "#482777",
        "#3b528b",
        "#2d708e",
        "#20908c",
        "#1fa78d",
        "#35b779",
        "#6ece58",
        "#b5de2b",
        "#fde724",
      ];

      // Simple color interpolation function
      const getColorForValue = (value, minVal, maxVal) => {
        const normalized = (value - minVal) / (maxVal - minVal);
        const index = Math.floor(normalized * (viridisColors.length - 1));
        return viridisColors[
          Math.min(Math.max(index, 0), viridisColors.length - 1)
        ];
      };

      const colorScale = getColorForValue;

      visibilityData.features.forEach((feature, index) => {
        const coords = feature.geometry.coordinates;
        const lon = coords[0];
        const lat = coords[1];
        const visibility = feature.properties.visibility_pct || 0;

        // Create hexagon using fixed radius
        const hexCorners = createHexFromCenter(lat, lon, HEX_RADIUS_M);

        // Create polygon for hexagon
        const hexagon = L.polygon(hexCorners, {
          color: colorScale(visibility, minVis, maxVis),
          weight: 1,
          opacity: 0.7,
          fillOpacity: 0.6,
          fillColor: colorScale(visibility, minVis, maxVis),
        });

        // Add popup with visibility percentage
        hexagon.bindPopup(
          `<strong>Visibility</strong><br/>${formatPopupNumber(visibility)}%`,
        );

        hexagonLayer.addLayer(hexagon);
      });

      // Store layer info for toggling (but don't add to map yet - user must enable via toggle)
      mapState.visibilityLayer = {
        id: "visibility-hexagons",
        name: "Visibility Analysis",
        layer: hexagonLayer,
        visible: false,
      };

      console.log(
        `Loaded ${visibilityData.features.length} visibility hexagons for ${park.name}`,
      );
    } catch (error) {
      console.error("Error loading visibility:", error);
    }
  } catch (error) {
    console.error("Error in loadVisibilityHexagons:", error);
  }
}

// Load foliage hexagons for selected park
async function loadFoliageHexagons(park) {
  try {
    // Remove existing foliage layers
    if (mapState.foliageLowLayer && mapState.foliageLowLayer.layer) {
      map.removeLayer(mapState.foliageLowLayer.layer);
    }
    if (mapState.foliageMidLayer && mapState.foliageMidLayer.layer) {
      map.removeLayer(mapState.foliageMidLayer.layer);
    }
    if (mapState.foliageTallLayer && mapState.foliageTallLayer.layer) {
      map.removeLayer(mapState.foliageTallLayer.layer);
    }

    const authPath = getAuthorityPath(mapState.currentAuthority.id);
    const authName = mapState.currentAuthority.name;

    // Get the new_park_id from the park object
    if (!park.newParkId) {
      console.log(`No new_park_id found for park: ${park.name}`);
      return;
    }

    // Try to load foliage file from combined parks directory
    const foliageFilename = `${authName}_pp_or_g_cmb/${park.newParkId}_foliage.geojson`;

    try {
      const response = await cachedFetch(`${authPath}${foliageFilename}`);
      if (!response.ok) {
        console.log(`Foliage file not found: ${foliageFilename}`);
        return;
      }

      const foliageData = await response.json();

      if (!foliageData.features || foliageData.features.length === 0) {
        console.log(`No foliage data found for park: ${park.name}`);
        return;
      }

      // Create three feature groups for each foliage height category
      const lowLayer = L.featureGroup();
      const midLayer = L.featureGroup();
      const tallLayer = L.featureGroup();

      // White to green color scale for all foliage layers
      const whiteToGreenColors = [
        "#ffffff",
        "#e8f5e9",
        "#c8e6c9",
        "#a5d6a7",
        "#81c784",
        "#66bb6a",
        "#4caf50",
        "#388e3c",
        "#2e7d32",
        "#1b5e20",
      ];

      const getColorForValue = (value, minVal, maxVal) => {
        if (maxVal === minVal) return whiteToGreenColors[0];
        const normalized = (value - minVal) / (maxVal - minVal);
        const index = Math.floor(normalized * (whiteToGreenColors.length - 1));
        return whiteToGreenColors[
          Math.min(Math.max(index, 0), whiteToGreenColors.length - 1)
        ];
      };

      // Get ranges for each category - use correct property names with special characters
      // Filter to only include values >= 10%
      const lowValues = foliageData.features
        .map((f) => f.properties["low_level_<0.5"] || 0)
        .filter((v) => v >= 10);
      const midValues = foliageData.features
        .map((f) => f.properties["mid_level_0.5-2"] || 0)
        .filter((v) => v >= 10);
      const tallValues = foliageData.features
        .map((f) => f.properties["tall_2+"] || 0)
        .filter((v) => v >= 10);

      const lowMin = lowValues.length > 0 ? Math.min(...lowValues) : 10;
      const lowMax = lowValues.length > 0 ? Math.max(...lowValues) : 100;
      const midMin = midValues.length > 0 ? Math.min(...midValues) : 10;
      const midMax = midValues.length > 0 ? Math.max(...midValues) : 100;
      const tallMin = tallValues.length > 0 ? Math.min(...tallValues) : 10;
      const tallMax = tallValues.length > 0 ? Math.max(...tallValues) : 100;

      // Process each feature for all three categories
      foliageData.features.forEach((feature, index) => {
        const coords = feature.geometry.coordinates;
        const lon = coords[0];
        const lat = coords[1];

        // Extract property values - handle both underscores and angle brackets
        const lowVal =
          feature.properties["low_level_<0.5"] !== undefined
            ? feature.properties["low_level_<0.5"]
            : feature.properties.low_level_lt_0_5 || 0;
        const midVal =
          feature.properties["mid_level_0.5-2"] !== undefined
            ? feature.properties["mid_level_0.5-2"]
            : feature.properties.mid_level_0_5_2 || 0;
        const tallVal =
          feature.properties["tall_2+"] !== undefined
            ? feature.properties["tall_2+"]
            : feature.properties.tall_2_plus || 0;

        // Skip hexagons with values < 10%
        if (lowVal < 10 && midVal < 10 && tallVal < 10) {
          return;
        }

        // Create hexagon using fixed radius
        const hexCorners = createHexFromCenter(lat, lon, HEX_RADIUS_M);

        // Low foliage hexagon - only if value >= 10%
        if (lowVal >= 10) {
          const lowColor = getColorForValue(lowVal, lowMin, lowMax);
          const lowHexagon = L.polygon(hexCorners, {
            color: lowColor,
            weight: 1,
            opacity: 0.7,
            fillOpacity: 0.6,
            fillColor: lowColor,
          });
          lowHexagon.bindPopup(
            `<strong>Low Foliage (&lt;0.5m)</strong><br/>${formatPopupNumber(lowVal)}%`,
          );
          lowLayer.addLayer(lowHexagon);
        }

        // Mid foliage hexagon - only if value >= 10%
        if (midVal >= 10) {
          const midColor = getColorForValue(midVal, midMin, midMax);
          const midHexagon = L.polygon(hexCorners, {
            color: midColor,
            weight: 1,
            opacity: 0.7,
            fillOpacity: 0.6,
            fillColor: midColor,
          });
          midHexagon.bindPopup(
            `<strong>Mid Foliage (0.5-2m)</strong><br/>${formatPopupNumber(midVal)}%`,
          );
          midLayer.addLayer(midHexagon);
        }

        // Tall foliage hexagon - only if value >= 10%
        if (tallVal >= 10) {
          const tallColor = getColorForValue(tallVal, tallMin, tallMax);
          const tallHexagon = L.polygon(hexCorners, {
            color: tallColor,
            weight: 1,
            opacity: 0.7,
            fillOpacity: 0.6,
            fillColor: tallColor,
          });

          // Extract height properties
          const maxHeight = feature.properties.max_height || 0;
          const meanHeight = feature.properties.mean_height || 0;

          // Bind popup with foliage percentage
          tallHexagon.bindPopup(
            `<strong>Tall Foliage (2m+)</strong><br/>${formatPopupNumber(tallVal)}%`,
          );

          // Bind tooltip with height information (shown on hover)
          tallHexagon.bindTooltip(
            `<strong>Heights:</strong><br/>Max: ${formatPopupNumber(maxHeight, 2)}m<br/>Mean: ${formatPopupNumber(meanHeight, 2)}m`,
            {
              permanent: false,
              direction: "top",
              className: "foliage-tooltip",
            },
          );

          tallLayer.addLayer(tallHexagon);
        }
      });

      // Store layer info for toggling
      mapState.foliageLowLayer = {
        id: "foliage-low-hexagons",
        name: "Low Foliage or Structures (<0.5m)",
        layer: lowLayer,
        visible: false,
      };

      mapState.foliageMidLayer = {
        id: "foliage-mid-hexagons",
        name: "Mid Foliage or Structures (0.5-2m)",
        layer: midLayer,
        visible: false,
      };

      mapState.foliageTallLayer = {
        id: "foliage-tall-hexagons",
        name: "Tall Foliage or Structures (2m+)",
        layer: tallLayer,
        visible: false,
      };

      console.log(
        `Loaded ${foliageData.features.length} foliage hexagons for ${park.name}`,
      );
    } catch (error) {
      console.error("Error loading foliage:", error);
    }
  } catch (error) {
    console.error("Error in loadFoliageHexagons:", error);
  }
}

// Google Turbo colormap (polynomial approximation by Anton Mikhailov), t in [0,1]: blue = low, red = high
function turboColor(t) {
  t = Math.min(Math.max(t, 0), 1);
  const c = [
    [
      0.13572138, 4.6153926, -42.66032258, 132.13108234, -152.94239396,
      59.28637943,
    ],
    [0.09140261, 2.19418839, 4.84296658, -14.18503333, 4.27729857, 2.82956604],
    [
      0.1066733, 12.64194608, -60.58204836, 110.36276771, -89.90310912,
      27.34824973,
    ],
  ];
  const rgb = c.map((k) => {
    let v = 0;
    for (let n = k.length - 1; n >= 0; n--) v = v * t + k[n];
    return Math.round(Math.min(Math.max(v, 0), 1) * 255);
  });
  return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}

// Shared by the legend gradient bar
const NACH_LEGEND_GRADIENT = `linear-gradient(to right, ${Array.from({ length: 11 }, (_, i) => turboColor(i / 10)).join(", ")})`;

// Total extra width (px) of the white outline around NACH lines
const NACH_CASING_WIDTH = 2;

// Width multiplier for NACH lines: 1x at zoom 14, doubling every 3 zoom levels, clamped
function getNachZoomScale() {
  const z = map.getZoom();
  return Math.min(Math.max(Math.pow(2, (z - 14) / 3), 0.7), 2.5);
}

// Load NACH (Predicted Route Popularity) network
async function loadNACHNetwork(park) {
  try {
    // Remove existing NACH layer
    if (mapState.nachLayer && mapState.nachLayer.layer) {
      map.removeLayer(mapState.nachLayer.layer);
    }

    const authPath = getAuthorityPath(mapState.currentAuthority.id);

    // Get the official park ID from the park object
    if (!park.id) {
      console.log(`No official park id found for park: ${park.name}`);
      return;
    }

    // Load NACH file from NACH_dataset directory
    // Path format: {authorityId}/NACH_dataset/{parkId}_NACH.geojson
    const nachFilename = `NACH_dataset/${park.id}_NACH.geojson`;

    try {
      const response = await cachedFetch(`${authPath}${nachFilename}`);
      if (!response.ok) {
        console.log(
          `NACH file not found: ${nachFilename} (this is OK - not all areas have NACH data)`,
        );
        return;
      }

      const nachData = await response.json();

      if (!nachData.features || nachData.features.length === 0) {
        console.log(`No NACH data found for park: ${park.name}`);
        return;
      }

      // Create feature group for NACH network
      const nachGroup = L.featureGroup();

      // Get NACH value range for color scaling
      const nachValues = nachData.features.map((f) => f.properties.nach || 0);
      const minNACH = Math.min(...nachValues);
      const maxNACH = Math.max(...nachValues);

      const getNachColor = (value, minVal, maxVal) =>
        turboColor(maxVal > minVal ? (value - minVal) / (maxVal - minVal) : 0);

      const casings = [];
      const lines = [];
      nachData.features.forEach((feature) => {
        const geoJsonCoords = feature.geometry.coordinates; // GeoJSON: [lng, lat]
        // Convert to Leaflet format: [lat, lng]
        const leafletCoords = geoJsonCoords.map((coord) => [
          coord[1],
          coord[0],
        ]);
        const nachValue = feature.properties.nach || 0;
        const color = getNachColor(nachValue, minNACH, maxNACH);

        // Base weight strongly dependent on NACH (power curve emphasises high values)
        const normalizedValue =
          maxNACH > minNACH ? (nachValue - minNACH) / (maxNACH - minNACH) : 0;
        const baseWeight = 0.8 + Math.pow(normalizedValue, 1.5) * 5; // 0.8 to 5.8
        const weight = baseWeight * getNachZoomScale();

        // Create line for each network segment
        const line = L.polyline(leafletCoords, {
          color: color,
          weight: weight,
          opacity: 1.0,
          fillOpacity: 1.0,
          lineCap: "round",
          lineJoin: "round",
        });

        // Add popup with NACH value
        line.bindPopup(
          `<strong>Predicted Route Popularity</strong><br/>Choice: ${formatPopupNumber(nachValue, 3)}`,
        );

        // Add tooltip showing value on hover
        line.bindTooltip(`Choice: ${formatPopupNumber(nachValue, 3)}`, {
          permanent: false,
          direction: "top",
          className: "nach-tooltip",
        });

        line._nachBaseWeight = baseWeight;
        const casing = L.polyline(leafletCoords, {
          color: "#ffffff",
          weight: weight + NACH_CASING_WIDTH,
          opacity: 1.0,
          lineCap: "round",
          lineJoin: "round",
          interactive: false,
        });
        line._nachCasing = casing;
        casings.push(casing);
        lines.push(line);
      });
      // Add all casings first so every white outline sits beneath every line
      casings.forEach((c) => nachGroup.addLayer(c));
      lines.forEach((l) => nachGroup.addLayer(l));

      // Rescale line widths with zoom so lines thicken as the user zooms in
      // Restyling thousands of segments is expensive, so skip it when the
      // clamped scale hasn't changed and batch it into the next frame
      let appliedScale = getNachZoomScale();
      let pendingFrame = null;
      const updateNachWeights = () => {
        pendingFrame = null;
        const scale = getNachZoomScale();
        if (scale === appliedScale) return;
        appliedScale = scale;
        lines.forEach((l) => {
          const w = l._nachBaseWeight * scale;
          l.setStyle({ weight: w });
          l._nachCasing.setStyle({ weight: w + NACH_CASING_WIDTH });
        });
      };
      const scheduleNachWeights = () => {
        if (pendingFrame === null) {
          pendingFrame = requestAnimationFrame(updateNachWeights);
        }
      };
      nachGroup.on("add", () => {
        updateNachWeights();
        map.on("zoomend", scheduleNachWeights);
      });
      nachGroup.on("remove", () => {
        map.off("zoomend", scheduleNachWeights);
        if (pendingFrame !== null) {
          cancelAnimationFrame(pendingFrame);
          pendingFrame = null;
        }
      });

      // Store layer info for toggling (but don't add to map yet - user must enable via toggle)
      mapState.nachLayer = {
        id: "nach-network",
        name: "Predicted Route Popularity (NACH)",
        layer: nachGroup,
        visible: false,
        minValue: minNACH,
        maxValue: maxNACH,
      };

      console.log(
        `Loaded ${nachData.features.length} NACH segments for ${park.name}`,
      );
    } catch (error) {
      console.error("Error loading NACH:", error);
    }
  } catch (error) {
    console.error("Error in loadNACHNetwork:", error);
  }
}

// Load Pocket Parks dataset
async function loadRegionalPocketParks() {
  try {
    // Remove existing pocket parks layer if present
    if (mapState.pocketParksLayer && mapState.pocketParksLayer.layer) {
      map.removeLayer(mapState.pocketParksLayer.layer);
    }

    // Create feature group for all pocket parks
    const pocketParksGroup = L.featureGroup();
    let totalPocketParks = 0;

    // Collect all features from all authorities
    const allFeatures = [];

    // Load pocket parks for each authority
    for (const authority of mapState.authorities) {
      try {
        const authPath = getAuthorityPath(authority.id);
        const authName = authority.name;
        const pocketParksFilename = `${authName}_pocket_parks.geojson`;

        const response = await fetch(`${authPath}${pocketParksFilename}`);
        if (!response.ok) {
          console.log(`Pocket parks file not found for ${authName}`);
          continue;
        }

        const pocketParksData = await response.json();

        if (
          !pocketParksData.features ||
          pocketParksData.features.length === 0
        ) {
          console.log(`No pocket parks data for ${authName}`);
          continue;
        }

        // Transform coordinates from EPSG:27700 to WGS84
        pocketParksData.features.forEach((feature) => {
          const transformedFeature = {
            ...feature,
            geometry: transformCoordinates(feature.geometry),
          };
          allFeatures.push(transformedFeature);
        });

        totalPocketParks += pocketParksData.features.length;
      } catch (error) {
        console.error(
          `Error loading pocket parks for ${authority.name}:`,
          error,
        );
      }
    }

    // Create a single GeoJSON layer with all features
    if (allFeatures.length > 0) {
      const geoJsonLayer = L.geoJSON(
        {
          type: "FeatureCollection",
          features: allFeatures,
        },
        {
          style: function (feature) {
            return {
              color: "#FF6B35",
              weight: 2,
              opacity: 0.9,
              fillColor: "#FF6B35",
              fillOpacity: 0.2,
            };
          },
          onEachFeature: function (feature, layer) {
            // Add popup with pocket park info if available
            let popupContent = "<strong>Pocket Park</strong>";
            if (feature.properties && feature.properties.name) {
              popupContent = `<strong>${escapeHtml(feature.properties.name)}</strong>`;
            }
            layer.bindPopup(popupContent);

            // Add tooltip
            layer.bindTooltip("Pocket Park", {
              permanent: false,
              direction: "top",
              className: "pocket-park-tooltip",
            });
          },
        },
      );

      pocketParksGroup.addLayer(geoJsonLayer);
    }

    // Store layer info for toggling
    mapState.pocketParksLayer = {
      id: "pocket-parks",
      name: "Pocket Parks & Small Greenspaces",
      layer: pocketParksGroup,
      visible: false,
    };

    console.log(
      `Loaded regional pocket parks: ${totalPocketParks} parks across all authorities`,
    );
  } catch (error) {
    console.error("Error in loadRegionalPocketParks:", error);
  }
}

// Load Toilet dataset
async function loadToiletDataset(park) {
  try {
    // Remove existing toilet layer
    if (mapState.toiletLayer && mapState.toiletLayer.layer) {
      map.removeLayer(mapState.toiletLayer.layer);
    }

    const authPath = getAuthorityPath(mapState.currentAuthority.id);

    // Get the official park ID from the park object
    if (!park.id) {
      console.log(`No official park id found for park: ${park.name}`);
      return;
    }

    // Load toilet file from toilet_dataset directory
    // Path format: {authorityId}/toilet_dataset/{parkId}_toilets.geojson
    const toiletFilename = `toilet_dataset/${park.id}_toilets.geojson`;

    try {
      const response = await fetch(`${authPath}${toiletFilename}`);
      if (!response.ok) {
        console.log(
          `Toilet file not found: ${toiletFilename} (this is OK - not all parks have toilet data)`,
        );
        return;
      }

      const toiletData = await response.json();

      if (!toiletData.features || toiletData.features.length === 0) {
        console.log(`No toilet data found for park: ${park.name}`);
        return;
      }

      // Create feature group for toilet markers
      const toiletGroup = L.featureGroup();

      // Create blue square icon
      const blueSquareIcon = L.icon({
        iconUrl:
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHJ4PSIyIiBmaWxsPSIjMDA3QkZGIi8+PC9zdmc+",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });

      toiletData.features.forEach((feature) => {
        const coords = feature.geometry.coordinates; // GeoJSON: [lng, lat]
        const toiletCoords = [coords[1], coords[0]]; // Convert to [lat, lng]
        const props = feature.properties;

        // Build popup content
        let popupContent = `<strong>${escapeHtml(props.name || "Toilet Facility")}</strong><br/>`;
        popupContent += `<strong>Access:</strong> ${escapeHtml(props.accessible === "True" ? "Accessible" : "Not accessible")}<br/>`;
        popupContent += `<strong>Payment:</strong> ${escapeHtml(props.payment_info || "Unknown")}<br/>`;

        // Add facility info
        const facilities = [];
        if (props.women === "True") facilities.push("Women");
        if (props.men === "True") facilities.push("Men");
        if (props.baby_change === "True") facilities.push("Baby Change");
        if (facilities.length > 0) {
          popupContent += `<strong>Facilities:</strong> ${facilities.join(", ")}<br/>`;
        }

        // Create marker
        const marker = L.marker(toiletCoords, { icon: blueSquareIcon });
        marker.bindPopup(popupContent);
        marker.bindTooltip(escapeHtml(props.name || "Toilet"), {
          permanent: false,
          direction: "top",
          className: "toilet-tooltip",
        });

        toiletGroup.addLayer(marker);
      });

      // Store layer info for toggling
      mapState.toiletLayer = {
        id: "toilet-facilities",
        name: "Toilet Facilities",
        layer: toiletGroup,
        visible: false,
      };

      console.log(
        `Loaded ${toiletData.features.length} toilet facilities for ${park.name}`,
      );
    } catch (error) {
      console.error("Error loading toilet data:", error);
    }
  } catch (error) {
    console.error("Error in loadToiletDataset:", error);
  }
}

// Load Benches dataset for selected park
async function loadBenchesDataset(park) {
  try {
    console.log(
      `loadBenchesDataset called for park: ${park.name} (ID: ${park.id})`,
    );

    if (!park.id) {
      console.log(`No park ID found for bench loading`);
      return;
    }

    // Remove existing benches layer
    if (mapState.benchesLayer && mapState.benchesLayer.layer) {
      map.removeLayer(mapState.benchesLayer.layer);
    }

    const authPath = getAuthorityPath(mapState.currentAuthority.id);
    console.log(`Auth path for bench loading: ${authPath}`);

    // Load bench file from bench_dataset directory
    // Path format: {authorityId}/bench_dataset/{parkId}.geojson
    const benchFilename = `bench_dataset/${park.id}.geojson`;
    const fullBenchPath = `${authPath}${benchFilename}`;
    console.log(`Attempting to load benches from: ${fullBenchPath}`);

    try {
      const response = await cachedFetch(fullBenchPath);
      console.log(`Bench file fetch response status: ${response.status}`);

      if (!response.ok) {
        console.log(
          `Bench file not found: ${benchFilename} (this is OK - not all parks have bench data)`,
        );
        return;
      }

      const benchData = await response.json();
      console.log(
        `Bench data loaded, features count: ${benchData.features ? benchData.features.length : 0}`,
      );

      if (!benchData.features || benchData.features.length === 0) {
        console.log(`No bench data found for park: ${park.name}`);
        return;
      }

      // Create feature group for bench markers
      const benchGroup = L.featureGroup();

      // Create icon for benches
      const brownSquareIcon = L.icon({
        iconUrl:
          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHJ4PSIyIiBmaWxsPSIjOEI2RjQ3Ii8+PC9zdmc+",
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });

      benchData.features.forEach((feature) => {
        const coords = feature.geometry.coordinates; // GeoJSON: [lng, lat]
        const benchCoords = [coords[1], coords[0]]; // Convert to [lat, lng]
        const props = feature.properties;

        // Build popup content
        let popupContent = `<strong>Bench</strong><br/>`;
        if (props.name) {
          popupContent = `<strong>${escapeHtml(props.name)}</strong><br/>`;
        }
        popupContent += `<strong>Type:</strong> Bench<br/>`;

        // Create marker
        const marker = L.marker(benchCoords, { icon: brownSquareIcon });
        marker.bindPopup(popupContent);
        marker.bindTooltip("Bench", {
          permanent: false,
          direction: "top",
          className: "bench-tooltip",
        });

        benchGroup.addLayer(marker);
      });

      // Store layer info for toggling
      mapState.benchesLayer = {
        id: "benches",
        name: "Benches & Picnic Tables",
        layer: benchGroup,
        visible: false,
      };

      console.log(
        `Successfully loaded and stored ${benchData.features.length} benches for ${park.name}`,
      );
      console.log(`Benches layer stored in mapState:`, mapState.benchesLayer);
    } catch (error) {
      console.error("Error loading bench data:", error);
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
  } catch (error) {
    console.error("Error in loadBenchesDataset:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
  }
}

// Load Cycling dataset for selected park
async function loadCyclingDataset(park) {
  try {
    console.log(
      `loadCyclingDataset called for park: ${park.name} (ID: ${park.id})`,
    );

    // Remove existing cycling layer
    if (mapState.cyclingLayer && mapState.cyclingLayer.layer) {
      map.removeLayer(mapState.cyclingLayer.layer);
    }

    const authPath = getAuthorityPath(mapState.currentAuthority.id);

    // Get the official park ID from the park object
    if (!park.id) {
      console.log(`No official park id found for park: ${park.name}`);
      return;
    }

    // Load cycling file from cycling_dataset directory
    const cyclingFilename = `cycling_dataset/${park.id}_cycling.geojson`;
    console.log(`Attempting to load: ${authPath}${cyclingFilename}`);

    try {
      const response = await cachedFetch(`${authPath}${cyclingFilename}`);
      if (!response.ok) {
        console.log(
          `Cycling file not found: ${cyclingFilename} (this is OK - not all parks have cycling data)`,
        );
        return;
      }

      const cyclingData = await response.json();

      if (!cyclingData.features || cyclingData.features.length === 0) {
        console.log(`No cycling data found for park: ${park.name}`);
        return;
      }

      // Create feature group for cycling routes
      const cyclingGroup = L.featureGroup();

      cyclingData.features.forEach((feature) => {
        if (feature.geometry.type === "LineString") {
          const coords = feature.geometry.coordinates.map((c) => [c[1], c[0]]);

          const line = L.polyline(coords, {
            color: "#2196F3",
            weight: 3,
            opacity: 0.7,
            lineCap: "round",
            lineJoin: "round",
            dashArray: "5, 5",
          });

          // Add popup with cycling route info if available
          const popupContent = feature.properties.name
            ? `<strong>${escapeHtml(feature.properties.name)}</strong>`
            : "<strong>Cycling Route</strong>";
          line.bindPopup(popupContent);

          cyclingGroup.addLayer(line);
        } else if (feature.geometry.type === "MultiLineString") {
          // Handle MultiLineString: each coordinate array is a separate line
          feature.geometry.coordinates.forEach((lineCoords) => {
            const coords = lineCoords.map((c) => [c[1], c[0]]);

            const line = L.polyline(coords, {
              color: "#2196F3",
              weight: 3,
              opacity: 0.7,
              lineCap: "round",
              lineJoin: "round",
              dashArray: "5, 5",
            });

            // Add popup with cycling route info if available
            const popupContent = feature.properties.name
              ? `<strong>${escapeHtml(feature.properties.name)}</strong>`
              : "<strong>Cycling Route</strong>";
            line.bindPopup(popupContent);

            cyclingGroup.addLayer(line);
          });
        }
      });

      // Store layer info for toggling
      mapState.cyclingLayer = {
        id: "park-cycling",
        name: "Cycling Routes",
        layer: cyclingGroup,
        visible: false,
      };

      console.log(
        `Loaded ${cyclingData.features.length} cycling routes for ${park.name}`,
      );
    } catch (error) {
      console.error("Error loading cycling data:", error);
    }
  } catch (error) {
    console.error("Error in loadCyclingDataset:", error);
  }
}

// Load Walking dataset for selected park
async function loadWalkingDataset(park) {
  try {
    // Remove existing walking layer
    if (mapState.walkingLayer && mapState.walkingLayer.layer) {
      map.removeLayer(mapState.walkingLayer.layer);
    }

    const authPath = getAuthorityPath(mapState.currentAuthority.id);

    // Get the official park ID from the park object
    if (!park.id) {
      console.log(`No official park id found for park: ${park.name}`);
      return;
    }

    // Load walking file from walking_dataset directory
    const walkingFilename = `walking_dataset/${park.id}_walking.geojson`;

    try {
      const response = await cachedFetch(`${authPath}${walkingFilename}`);
      if (!response.ok) {
        console.log(
          `Walking file not found: ${walkingFilename} (this is OK - not all parks have walking data)`,
        );
        return;
      }

      const walkingData = await response.json();

      if (!walkingData.features || walkingData.features.length === 0) {
        console.log(`No walking data found for park: ${park.name}`);
        return;
      }

      // Create feature group for walking routes
      const walkingGroup = L.featureGroup();

      walkingData.features.forEach((feature) => {
        if (feature.geometry.type === "LineString") {
          const coords = feature.geometry.coordinates.map((c) => [c[1], c[0]]);

          const line = L.polyline(coords, {
            color: "#FF6F00",
            weight: 3,
            opacity: 0.7,
            lineCap: "round",
            lineJoin: "round",
          });

          // Add popup with walking route info if available
          const popupContent = feature.properties.name
            ? `<strong>${escapeHtml(feature.properties.name)}</strong>`
            : "<strong>Walking Route</strong>";
          line.bindPopup(popupContent);

          walkingGroup.addLayer(line);
        } else if (feature.geometry.type === "MultiLineString") {
          // Handle MultiLineString: each coordinate array is a separate line
          feature.geometry.coordinates.forEach((lineCoords) => {
            const coords = lineCoords.map((c) => [c[1], c[0]]);

            const line = L.polyline(coords, {
              color: "#FF6F00",
              weight: 3,
              opacity: 0.7,
              lineCap: "round",
              lineJoin: "round",
            });

            // Add popup with walking route info if available
            const popupContent = feature.properties.name
              ? `<strong>${escapeHtml(feature.properties.name)}</strong>`
              : "<strong>Walking Route</strong>";
            line.bindPopup(popupContent);

            walkingGroup.addLayer(line);
          });
        }
      });

      // Store layer info for toggling
      mapState.walkingLayer = {
        id: "park-walking",
        name: "Walking Routes",
        layer: walkingGroup,
        visible: false,
      };

      console.log(
        `Loaded ${walkingData.features.length} walking routes for ${park.name}`,
      );
    } catch (error) {
      console.error("Error loading walking data:", error);
    }
  } catch (error) {
    console.error("Error in loadWalkingDataset:", error);
  }
}

// Load Supplemental Lighting dataset for selected park (points)
async function loadSupplementalLighting(park) {
  try {
    console.log(`loadSupplementalLighting called for park:`, park);
    console.log(`Park object keys:`, Object.keys(park));

    // Remove existing supplemental lighting layer
    if (
      mapState.supplementalLightingLayer &&
      mapState.supplementalLightingLayer.layer
    ) {
      map.removeLayer(mapState.supplementalLightingLayer.layer);
    }

    const authPath = getAuthorityPath(mapState.currentAuthority.id);
    console.log(`Auth path: ${authPath}`);

    // Try multiple possible ID fields
    let parkId =
      park.id || park.properties?.park_offical_id || park.park_offical_id;

    if (!parkId) {
      console.log(`No park ID found in:`, park);
      return;
    }

    console.log(`Using park ID: ${parkId}`);

    // Load the authority lighting file
    const lightingFilename = `street_lights_200m/${mapState.currentAuthority.name}_street_lights_200m.geojson`;

    console.log(`Trying to load: ${authPath}${lightingFilename}`);

    const lightingGroup = L.featureGroup();
    let filesLoaded = 0;
    let lightsAdded = 0;
    let authorityFileFound = false;

    // Load lighting points
    try {
      const lightingResponse = await cachedFetch(
        `${authPath}${lightingFilename}`,
      );
      if (lightingResponse.ok) {
        authorityFileFound = true;
        const lightingData = await lightingResponse.json();
        console.log(`Lighting data loaded:`, lightingData);

        if (lightingData.features && lightingData.features.length > 0) {
          // File covers the whole authority: keep this park's lights only.
          // Geometry was written in EPSG:2770 (mislabelled 27700), so reproject it back to WGS84.
          lightingData.features.forEach((feature) => {
            const props = feature.properties || {};
            if (props.park_offical_id !== parkId || !fromEPSG2770) return;
            const c = feature.geometry && feature.geometry.coordinates;
            if (!c || !isFinite(c[0]) || !isFinite(c[1])) return;
            const [lng, lat] = fromEPSG2770.forward([
              Number(c[0]),
              Number(c[1]),
            ]);
            if (!isFinite(lat) || !isFinite(lng)) return;
            const circle = L.circleMarker([lat, lng], {
              radius: 4,
              fillColor: "#FFB300",
              color: "#FF8C00",
              weight: 1.5,
              opacity: 0.8,
              fillOpacity: 0.7,
            });
            const oglText =
              props.OGL_text != null ? String(props.OGL_text).trim() : "";
            circle.bindPopup(
              oglText
                ? `<strong>Street Light</strong><br/>${escapeHtml(oglText)}`
                : "<strong>Street Light</strong>",
            );
            circle.bindTooltip(oglText ? escapeHtml(oglText) : "Street Light", {
              sticky: true,
            });
            lightingGroup.addLayer(circle);
            lightsAdded++;
          });
          if (lightsAdded > 0) filesLoaded++;
        }
      } else {
        console.log(
          `Lighting not found (${lightingResponse.status}): ${authPath}${lightingFilename}`,
        );
      }
    } catch (error) {
      console.log(`Error loading lighting: ${error.message}`);
    }

    // Only create layer if we loaded at least one file
    if (filesLoaded > 0) {
      console.log(
        `Creating supplemental lighting layer with ${filesLoaded} file(s)`,
      );
      mapState.supplementalLightingLayer = {
        id: "supplemental-lighting",
        name: "Street Lighting (local data)",
        layer: lightingGroup,
        visible: false,
      };

      console.log(`Supplemental lighting layer created successfully`);
    } else {
      console.log(`No supplemental lighting files loaded for park: ${parkId}`);
      // Placeholder renders a greyed-out toggle with an explanation
      mapState.supplementalLightingLayer = {
        id: "supplemental-lighting",
        name: "Street Lighting (local data)",
        layer: null,
        visible: false,
        unavailableMessage: authorityFileFound
          ? "Lighting data not available for this park"
          : `Lighting data not available for ${mapState.currentAuthority.name}`,
      };
    }
  } catch (error) {
    console.error("Error in loadSupplementalLighting:", error);
  }
}

// Helper function to generate feature label with intelligent filtering and sentence case
function toSentenceCase(str) {
  if (!str) return "";
  return (
    str.replace(/_/g, " ").charAt(0).toUpperCase() +
    str.replace(/_/g, " ").slice(1).toLowerCase()
  );
}

function getFeatureLabelIn(props) {
  const primaryName = props["Primary Name_feature"];
  const typeOS = props["Type (OS)_feature"];
  const typeOSM = props["Type (OSM)_feature"];

  let label = "";

  // Prioritize Type (OS) first
  if (typeOS) {
    label = toSentenceCase(typeOS);
  }
  // Then try Type (OSM)
  else if (typeOSM) {
    label = toSentenceCase(typeOSM);
  }
  // Finally try Primary Name
  else if (primaryName) {
    label = toSentenceCase(primaryName);
  }

  // Default to 'Feature'
  return label || "Feature";
}

// Pick black or white text for readable contrast on a hex background
function getContrastTextColour(hex) {
  const n = parseInt(hex.slice(1), 16);
  const lin = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const L =
    0.2126 * lin(n >> 16) +
    0.7152 * lin((n >> 8) & 255) +
    0.0722 * lin(n & 255);
  return L > 0.4 ? "#000000" : "#ffffff";
}

// Tooltip class per feature colour; CSS rules are injected once per colour
const injectedTooltipClasses = new Set();
function getFeatureTooltipClass(colour) {
  const cls = "fip-tooltip-" + colour.slice(1).toLowerCase();
  if (!injectedTooltipClasses.has(cls)) {
    injectedTooltipClasses.add(cls);
    const style = document.createElement("style");
    style.textContent =
      ".leaflet-tooltip." +
      cls +
      " { background: " +
      colour +
      " !important; " +
      "border-color: " +
      colour +
      " !important; color: " +
      getContrastTextColour(colour) +
      " !important; } " +
      ".leaflet-tooltip-top." +
      cls +
      "::before { border-top-color: " +
      colour +
      " !important; }";
    document.head.appendChild(style);
  }
  return "features-in-parks-tooltip " + cls;
}

function getFeatureCoordinateBounds(geometry) {
  const bounds = [Infinity, Infinity, -Infinity, -Infinity];
  const visit = (coordinates) => {
    if (!Array.isArray(coordinates)) return;
    if (
      typeof coordinates[0] === "number" &&
      typeof coordinates[1] === "number"
    ) {
      bounds[0] = Math.min(bounds[0], coordinates[0]);
      bounds[1] = Math.min(bounds[1], coordinates[1]);
      bounds[2] = Math.max(bounds[2], coordinates[0]);
      bounds[3] = Math.max(bounds[3], coordinates[1]);
      return;
    }
    coordinates.forEach(visit);
  };

  visit(geometry && geometry.coordinates);
  return bounds[0] === Infinity ? null : bounds;
}

function indexFeatureDataset(features) {
  return features
    .map((feature) => ({
      feature: feature,
      bounds: getFeatureCoordinateBounds(feature.geometry),
    }))
    .filter((item) => item.bounds);
}

// Load Features In Parks dataset and cache source-coordinate bounds for fast per-park filtering.
async function loadFeaturesInParks(authority) {
  const authPath = getAuthorityPath(authority.id);
  const featuresFilename = `${authority.name}_features_within_pp_or_g.geojson`;
  try {
    const response = await fetch(`${authPath}${featuresFilename}`);
    if (!response.ok) {
      console.log(`Features in parks file not found: ${featuresFilename}`);
      mapState.featuresInParksLayer = null;
      return;
    }

    const featuresData = await response.json();
    mapState.featuresInParksLayer = {
      features: indexFeatureDataset(featuresData.features || []),
    };
    console.log(
      `Cached ${featuresData.features?.length || 0} features in parks for ${authority.name}`,
    );
  } catch (error) {
    console.error("Error loading features in parks:", error);
    mapState.featuresInParksLayer = null;
  }
}

// Helper function to generate feature label with intelligent filtering and sentence case
function getFeatureLabelNear(props) {
  const primaryName = props["Primary Name"];
  const typeOS = props["Type (OS)"];
  const typeOSM = props["Type (OSM)"];

  let label = "";

  // Use Primary Name if available
  if (primaryName) {
    label = toSentenceCase(primaryName);
  }

  // Add Type (OS) if available
  if (typeOS) {
    const typeOSFormatted = toSentenceCase(typeOS);
    if (label) {
      label += ", " + typeOSFormatted;
    } else {
      label = typeOSFormatted;
    }
  }

  // If both Primary Name and Type (OS) are null, try Type (OSM) with formatting
  if (!label && typeOSM) {
    label = toSentenceCase(typeOSM);
  }

  // Default to 'Feature'
  return label || "Feature";
}

// Load Features Near Parks dataset and cache source-coordinate bounds.
async function loadFeaturesNearParks(authority) {
  const authPath = getAuthorityPath(authority.id);
  const featuresFilename = `${authority.name}_features_not_in_pp_or_g.geojson`;
  try {
    const response = await fetch(`${authPath}${featuresFilename}`);
    if (!response.ok) {
      console.log(`Features near parks file not found: ${featuresFilename}`);
      mapState.featuresNearParksLayer = null;
      return;
    }

    const featuresData = await response.json();
    mapState.featuresNearParksLayer = {
      features: indexFeatureDataset(featuresData.features || []),
    };
    console.log(
      `Cached ${featuresData.features?.length || 0} features near parks for ${authority.name}`,
    );
  } catch (error) {
    console.error("Error loading features near parks:", error);
    mapState.featuresNearParksLayer = null;
  }
}

// Load Demographics data for selected authority
// Outer rings of a Polygon/MultiPolygon geometry
function getOuterRings(geometry) {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return [geometry.coordinates[0]];
  if (geometry.type === "MultiPolygon")
    return geometry.coordinates.map((poly) => poly[0]);
  return [];
}

function pointInRing(pt, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i],
      [xj, yj] = ring[j];
    if (
      yi > pt[1] !== yj > pt[1] &&
      pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function segmentsIntersect(p1, p2, p3, p4) {
  const cross = (a, b, c) =>
    (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  const d1 = cross(p3, p4, p1),
    d2 = cross(p3, p4, p2);
  const d3 = cross(p1, p2, p3),
    d4 = cross(p1, p2, p4);
  return d1 > 0 !== d2 > 0 && d3 > 0 !== d4 > 0;
}

function ringsOverlap(a, b) {
  if (a.length < 3 || b.length < 3) return false;
  if (pointInRing(a[0], b) || pointInRing(b[0], a)) return true;
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < b.length - 1; j++) {
      if (segmentsIntersect(a[i], a[i + 1], b[j], b[j + 1])) return true;
    }
  }
  return false;
}

// True if two geometries in the same CRS share any area (outer rings only)
function geometriesOverlap(geomA, geomB) {
  const ringsA = getOuterRings(geomA);
  const ringsB = getOuterRings(geomB);
  return ringsA.some((a) => ringsB.some((b) => ringsOverlap(a, b)));
}

async function loadDemographicsData(park) {
  try {
    // Remove existing demographics layer
    if (mapState.demographicsLayer && mapState.demographicsLayer.layer) {
      map.removeLayer(mapState.demographicsLayer.layer);
    }
    mapState.demographicsLayer = null;

    const authPath = getAuthorityPath(mapState.currentAuthority.id);
    const authName = mapState.currentAuthority.name;
    const demographicsPath = `${authPath}demo/`;

    // Get the park's official ID
    if (!park.id) {
      console.log(`No official park id found for park: ${park.name}`);
      return;
    }

    try {
      const response = await cachedFetch(
        `${demographicsPath}${authName}_15_min.geojson`,
      );
      if (!response.ok) {
        console.log(`Demographics file not found for authority: ${authName}`);
        return;
      }

      const demographicsData = await response.json();
      if (
        !demographicsData.features ||
        demographicsData.features.length === 0
      ) {
        console.log(`No demographics data found for authority: ${authName}`);
        return;
      }

      // Filter features to only those matching this park's ID
      const matchedDemographics = demographicsData.features.filter(
        (feature) => feature.properties.park_offical_id === park.id,
      );

      if (matchedDemographics.length === 0) {
        console.log(`No demographics data found for park: ${park.name}`);
        return;
      }

      // Catchments incorrectly provisioned away from the park are not shown
      const parkDemographics = matchedDemographics.filter((feature) =>
        geometriesOverlap(feature.geometry, park.sourceGeometry),
      );

      if (parkDemographics.length === 0) {
        console.log(
          `Demographics catchment does not overlap park: ${park.name}`,
        );
        mapState.demographicsLayer = {
          id: "demographics",
          name: "Demographics Data",
          layer: null,
          visible: false,
          unavailableMessage:
            "Data not yet available for this park, coming soon",
        };
        return;
      }

      // Create feature group for demographics
      const demographicsGroup = L.featureGroup();

      // Use proj4.js for coordinate transformation (CRS: EPSG:27700)
      parkDemographics.forEach((feature) => {
        try {
          // Transform geometry from EPSG:27700 to EPSG:4326
          const transformedGeometry = transformCoordinates(feature.geometry);

          if (!transformedGeometry || feature.geometry.type !== "Polygon") {
            return;
          }

          const coords = transformedGeometry.coordinates[0].map((c) => [
            c[1],
            c[0],
          ]);
          const polygon = L.polygon(coords, {
            color: "#9C27B0",
            weight: 1.5,
            opacity: 0.6,
            fill: true,
            fillColor: "#9C27B0",
            fillOpacity: 0.08,
            lineCap: "round",
          });

          // Build popup content with LQ values and symbols
          const props = feature.properties;

          // Create a table with demographic variables and their LQ values
          let tableRows = "";
          for (const [key, value] of Object.entries(props)) {
            if (
              key.toLowerCase().includes("lq") &&
              typeof value === "number" &&
              Number.isFinite(value)
            ) {
              // Extract the demographic variable name (remove _lq suffix)
              const varName = key.replace(/_lq$/i, "").replace(/_/g, " ");
              const displayName =
                varName.charAt(0).toUpperCase() + varName.slice(1);

              // Determine symbol based on LQ value
              let symbol = "";
              if (value > 1.2)
                symbol = "↑"; // Significantly higher
              else if (value < 0.8) symbol = "↓"; // Significantly lower

              tableRows += `
                                        <tr style="border-bottom: 1px solid #e0e0e0;">
                                            <td style="padding: 6px 8px; text-align: left;">${escapeHtml(displayName)}</td>
                                            <td style="padding: 6px 8px; text-align: center; font-weight: bold;">${formatPopupNumber(value, 2)}</td>
                                            <td style="padding: 6px 8px; text-align: center;">${symbol}</td>
                                        </tr>
                                    `;
            }
          }

          const popupContent = `
                                <div style="font-family: Arial, sans-serif; font-size: 12px; max-width: 400px; max-height: 400px; overflow-y: auto;">
                                    <div style="margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #ddd;">
                                        <h4 style="margin: 0 0 8px 0; color: #572B70; font-weight: bold;">Significance indicators:</h4>
                                        <p style="margin: 4px 0;"><strong>↑</strong> = Significantly higher than the Local Authority average</p>
                                        <p style="margin: 4px 0;"><strong>↓</strong> = Significantly lower than the Local Authority average</p>
                                        <p style="margin: 4px 0;">No symbol = Not significantly different from the Local Authority average</p>
                                    </div>
                                    <table style="width: 100%; border-collapse: collapse;">
                                        <thead>
                                            <tr style="border-bottom: 2px solid #572B70;">
                                                <th style="padding: 8px 8px; text-align: left; color: #572B70; font-weight: bold;">Demographic</th>
                                                <th style="padding: 8px 8px; text-align: center; color: #572B70; font-weight: bold;">LQ</th>
                                                <th style="padding: 8px 8px; text-align: center; color: #572B70; font-weight: bold;">Sig</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${tableRows}
                                        </tbody>
                                    </table>
                                </div>
                            `;

          polygon.bindPopup(popupContent);
          demographicsGroup.addLayer(polygon);
        } catch (e) {
          console.warn("Error processing demographics feature:", e);
        }
      });

      // Only store layer if it has data
      if (demographicsGroup.getLayers().length > 0) {
        mapState.demographicsLayer = {
          id: "demographics",
          name: "Demographics Data",
          layer: demographicsGroup,
          visible: false,
        };
        console.log(`Loaded demographics data for ${park.name}`);
      } else {
        mapState.demographicsLayer = null;
        console.log(`No demographics polygons created for park: ${park.name}`);
      }
    } catch (error) {
      mapState.demographicsLayer = null;
      console.log(
        `Demographics data not available for this authority (${authName})`,
      );
    }
  } catch (error) {
    console.error("Error in loadDemographicsData:", error);
  }
}

// Load Regional Cycling Network for all authorities
async function loadRegionalCyclingNetwork() {
  try {
    // Remove existing cycling network layer if present
    if (mapState.cyclingNetworkLayer && mapState.cyclingNetworkLayer.layer) {
      map.removeLayer(mapState.cyclingNetworkLayer.layer);
    }

    // Create feature group for all cycling networks
    const cyclingGroup = L.featureGroup();
    let totalSegments = 0;

    // Load cycling network for each authority
    for (const authority of mapState.authorities) {
      try {
        const authPath = getAuthorityPath(authority.id);
        const authName = authority.name;
        const cyclingFilename = `${authName}_national_cycle_network.geojson`;

        const response = await cachedFetch(`${authPath}${cyclingFilename}`);
        if (!response.ok) {
          console.log(`Cycling network file not found for ${authName}`);
          continue;
        }

        const cyclingData = await response.json();

        if (!cyclingData.features || cyclingData.features.length === 0) {
          console.log(`No cycling network data for ${authName}`);
          continue;
        }

        cyclingData.features.forEach((feature) => {
          // Handle both LineString and MultiLineString geometries
          const geometries = [];
          if (feature.geometry.type === "LineString") {
            geometries.push(feature.geometry.coordinates);
          } else if (feature.geometry.type === "MultiLineString") {
            geometries.push(...feature.geometry.coordinates);
          }

          geometries.forEach((geoJsonCoords) => {
            // Convert from GeoJSON [lng, lat] to Leaflet [lat, lng]
            const leafletCoords = geoJsonCoords.map((coord) => [
              coord[1],
              coord[0],
            ]);

            // Create line for cycling network segment
            const line = L.polyline(leafletCoords, {
              color: "#FF6B35",
              weight: 2.5,
              opacity: 0.8,
              lineCap: "round",
              lineJoin: "round",
            });

            // Add popup with cycling route info if available
            if (feature.properties && feature.properties.name) {
              line.bindPopup(
                `<strong>${escapeHtml(feature.properties.name)}</strong>`,
              );
            }

            // Add tooltip
            line.bindTooltip("National Cycle Network", {
              permanent: false,
              direction: "top",
              className: "cycling-tooltip",
            });

            cyclingGroup.addLayer(line);
            totalSegments++;
          });
        });
      } catch (error) {
        console.error(
          `Error loading cycling network for ${authority.name}:`,
          error,
        );
      }
    }

    // Store layer info for toggling
    mapState.cyclingNetworkLayer = {
      id: "cycling-network",
      name: "National Cycling Network",
      layer: cyclingGroup,
      visible: false,
    };

    console.log(
      `Loaded regional cycling network: ${totalSegments} segments across all authorities`,
    );
  } catch (error) {
    console.error("Error in loadRegionalCyclingNetwork:", error);
  }
}

// Populate layer toggles
function populateLayerToggles(layers) {
  const container = document.getElementById("dataLayerToggles");
  const hr = document.getElementById("layerHR");
  const hint = document.getElementById("layerHint");

  // Mapping of layer IDs to modal IDs
  const layerModalMap = {
    "park-boundary": "modal-parkBoundary",
    "all-parks": "modal-nearbyParks",
    "park-entrances": "modal-parkEntrances",
    "features-in-and-near-parks": "modal-parkFeatures",
    "visibility-hexagons": "modal-visibilityAnalysis",
    "foliage-low-hexagons": "modal-foliageLow",
    "foliage-mid-hexagons": "modal-foliageMid",
    "foliage-tall-hexagons": "modal-foliageTall",
    "nach-network": "modal-nachNetwork",
    "toilet-facilities": "modal-toiletFacilities",
    benches: "modal-benchFacilities",
    "park-cycling": "modal-cyclingRoutes",
    "park-walking": "modal-walkingRoutes",
    "supplemental-lighting": "modal-supplementalLighting",
    demographics: "modal-demographics",
  };

  container.innerHTML = "";

  layers.forEach((layerInfo) => {
    const unavailable = !!layerInfo.unavailableMessage;
    const label = document.createElement("label");
    label.className = "toggle-label";
    if (unavailable) {
      label.style.opacity = "0.5";
      label.style.cursor = "not-allowed";
    }

    const input = document.createElement("input");
    input.type = "checkbox";
    input.id = `toggle-${layerInfo.id}`;
    input.checked = layerInfo.visible;
    input.setAttribute("role", "switch");
    input.setAttribute("aria-label", `Toggle ${layerInfo.name} layer`);
    input.disabled = unavailable;

    // Create info icon button
    const infoBtn = document.createElement("button");
    infoBtn.type = "button";
    infoBtn.className = "info-icon-btn";
    infoBtn.setAttribute("aria-label", `Information about ${layerInfo.name}`);

    const modalId = layerModalMap[layerInfo.id];
    if (modalId) {
      infoBtn.onclick = () => openModal(modalId);

      const img = document.createElement("img");
      img.src = "css/icon.svg";
      img.alt = "Info";
      img.style.width = "100%";
      img.style.height = "100%";
      infoBtn.appendChild(img);
    }

    const span = document.createElement("span");
    span.textContent = layerInfo.name;

    input.addEventListener("change", function () {
      toggleDataLayer(layerInfo.id, this.checked);
    });

    label.appendChild(input);
    label.appendChild(span);
    if (modalId) {
      label.appendChild(infoBtn);
    }
    container.appendChild(label);

    if (unavailable) {
      const note = document.createElement("div");
      note.style.cssText =
        "font-size: 0.85rem; color: #666; margin-top: -0.25rem; line-height: 1.4;";
      note.textContent = layerInfo.unavailableMessage;
      container.appendChild(note);
    }
  });

  // Show the toggles, hint, and separator line
  container.style.display = "flex";
  hint.style.display = "block";
  hr.style.display = "block";
}

// Toggle data layer visibility
function toggleDataLayer(layerId, visible) {
  console.log("toggleDataLayer called:", layerId, visible);

  if (layerId === "park-boundary" && mapState.parkBoundaryLayer) {
    const layerObj = mapState.parkBoundaryLayer;
    console.log("Park boundary layer found, toggling visibility:", visible);

    try {
      if (visible) {
        layerObj.layer.addTo(map);
        console.log("Park boundary layer added to map");
      } else {
        map.removeLayer(layerObj.layer);
        console.log("Park boundary layer removed from map");
      }
      layerObj.visible = visible;
    } catch (error) {
      console.error("Error toggling park boundary layer:", error);
    }
  } else if (layerId === "all-parks" && mapState.otherParksLayer) {
    const layerObj = mapState.otherParksLayer;
    console.log("Other parks layer found, toggling visibility:", visible);

    try {
      if (visible) {
        layerObj.layer.addTo(map);
        console.log("Other parks layer added to map");
      } else {
        map.removeLayer(layerObj.layer);
        console.log("Other parks layer removed from map");
      }
      layerObj.visible = visible;
    } catch (error) {
      console.error("Error toggling other parks layer:", error);
    }
  } else if (layerId === "park-entrances" && mapState.entrancesLayer) {
    const layerObj = mapState.entrancesLayer;
    console.log("Park entrances layer found, toggling visibility:", visible);

    try {
      if (visible) {
        layerObj.layer.addTo(map);
        console.log("Park entrances layer added to map");
      } else {
        map.removeLayer(layerObj.layer);
        console.log("Park entrances layer removed from map");
      }
      layerObj.visible = visible;
    } catch (error) {
      console.error("Error toggling park entrances layer:", error);
    }
  } else if (layerId === "visibility-hexagons" && mapState.visibilityLayer) {
    const layerObj = mapState.visibilityLayer;
    console.log("Visibility layer found, toggling visibility:", visible);

    try {
      if (visible) {
        layerObj.layer.addTo(map);
        console.log("Visibility layer added to map");
      } else {
        map.removeLayer(layerObj.layer);
        console.log("Visibility layer removed from map");
      }
      layerObj.visible = visible;
    } catch (error) {
      console.error("Error toggling visibility layer:", error);
    }
  } else if (layerId === "foliage-low-hexagons" && mapState.foliageLowLayer) {
    const layerObj = mapState.foliageLowLayer;
    console.log("Foliage low layer found, toggling visibility:", visible);

    try {
      if (visible) {
        layerObj.layer.addTo(map);
        console.log("Foliage low layer added to map");
      } else {
        map.removeLayer(layerObj.layer);
        console.log("Foliage low layer removed from map");
      }
      layerObj.visible = visible;
    } catch (error) {
      console.error("Error toggling foliage low layer:", error);
    }
  } else if (layerId === "foliage-mid-hexagons" && mapState.foliageMidLayer) {
    const layerObj = mapState.foliageMidLayer;
    console.log("Foliage mid layer found, toggling visibility:", visible);

    try {
      if (visible) {
        layerObj.layer.addTo(map);
        console.log("Foliage mid layer added to map");
      } else {
        map.removeLayer(layerObj.layer);
        console.log("Foliage mid layer removed from map");
      }
      layerObj.visible = visible;
    } catch (error) {
      console.error("Error toggling foliage mid layer:", error);
    }
  } else if (layerId === "foliage-tall-hexagons" && mapState.foliageTallLayer) {
    const layerObj = mapState.foliageTallLayer;
    console.log("Foliage tall layer found, toggling visibility:", visible);

    try {
      if (visible) {
        layerObj.layer.addTo(map);
        console.log("Foliage tall layer added to map");
      } else {
        map.removeLayer(layerObj.layer);
        console.log("Foliage tall layer removed from map");
      }
      layerObj.visible = visible;
    } catch (error) {
      console.error("Error toggling foliage tall layer:", error);
    }
  } else if (layerId === "nach-network" && mapState.nachLayer) {
    const layerObj = mapState.nachLayer;
    console.log("NACH layer found, toggling visibility:", visible);

    try {
      if (visible) {
        layerObj.layer.addTo(map);
        console.log("NACH layer added to map");
      } else {
        map.removeLayer(layerObj.layer);
        console.log("NACH layer removed from map");
      }
      layerObj.visible = visible;
    } catch (error) {
      console.error("Error toggling NACH layer:", error);
    }
  } else if (layerId === "toilet-facilities" && mapState.toiletLayer) {
    const layerObj = mapState.toiletLayer;
    console.log("Toilet layer found, toggling visibility:", visible);

    try {
      if (visible) {
        layerObj.layer.addTo(map);
        console.log("Toilet layer added to map");
      } else {
        map.removeLayer(layerObj.layer);
        console.log("Toilet layer removed from map");
      }
      layerObj.visible = visible;
    } catch (error) {
      console.error("Error toggling toilet layer:", error);
    }
  } else if (layerId === "benches" && mapState.benchesLayer) {
    const layerObj = mapState.benchesLayer;
    console.log("Benches layer found, toggling visibility:", visible);

    try {
      if (visible) {
        layerObj.layer.addTo(map);
        console.log("Benches layer added to map");
      } else {
        map.removeLayer(layerObj.layer);
        console.log("Benches layer removed from map");
      }
      layerObj.visible = visible;
    } catch (error) {
      console.error("Error toggling benches layer:", error);
    }
  } else if (layerId === "cycling-network" && mapState.cyclingNetworkLayer) {
    const layerObj = mapState.cyclingNetworkLayer;
    console.log("Cycling network layer found, toggling visibility:", visible);

    try {
      if (visible) {
        layerObj.layer.addTo(map);
        console.log("Cycling network layer added to map");
      } else {
        map.removeLayer(layerObj.layer);
        console.log("Cycling network layer removed from map");
      }
      layerObj.visible = visible;
    } catch (error) {
      console.error("Error toggling cycling network layer:", error);
    }
  } else if (
    layerId === "features-in-and-near-parks" &&
    mapState.featuresInAndNearParksLayer
  ) {
    const layerObj = mapState.featuresInAndNearParksLayer;
    try {
      if (visible) {
        layerObj.layer.addTo(map);
      } else {
        map.removeLayer(layerObj.layer);
      }
      layerObj.visible = visible;
    } catch (error) {
      console.error("Error toggling Features and facilities layer:", error);
    }
  } else if (layerId === "demographics" && mapState.demographicsLayer) {
    const layerObj = mapState.demographicsLayer;
    try {
      if (visible) {
        layerObj.layer.addTo(map);
      } else {
        map.removeLayer(layerObj.layer);
      }
      layerObj.visible = visible;
    } catch (error) {
      console.error("Error toggling demographics layer:", error);
    }
  } else if (layerId === "park-cycling" && mapState.cyclingLayer) {
    const layerObj = mapState.cyclingLayer;
    console.log("Cycling layer found, toggling visibility:", visible);
    try {
      if (visible) {
        layerObj.layer.addTo(map);
        console.log("Cycling layer added to map");
      } else {
        map.removeLayer(layerObj.layer);
        console.log("Cycling layer removed from map");
      }
      layerObj.visible = visible;
    } catch (error) {
      console.error("Error toggling cycling dataset layer:", error);
    }
  } else if (layerId === "park-walking" && mapState.walkingLayer) {
    const layerObj = mapState.walkingLayer;
    console.log("Walking layer found, toggling visibility:", visible);
    try {
      if (visible) {
        layerObj.layer.addTo(map);
        console.log("Walking layer added to map");
      } else {
        map.removeLayer(layerObj.layer);
        console.log("Walking layer removed from map");
      }
      layerObj.visible = visible;
    } catch (error) {
      console.error("Error toggling walking dataset layer:", error);
    }
  } else if (
    layerId === "supplemental-lighting" &&
    mapState.supplementalLightingLayer &&
    mapState.supplementalLightingLayer.layer
  ) {
    const layerObj = mapState.supplementalLightingLayer;
    console.log(
      "Supplemental lighting layer found, toggling visibility:",
      visible,
    );
    try {
      if (visible) {
        layerObj.layer.addTo(map);
        console.log("Supplemental lighting layer added to map");
      } else {
        map.removeLayer(layerObj.layer);
        console.log("Supplemental lighting layer removed from map");
      }
      layerObj.visible = visible;
    } catch (error) {
      console.error("Error toggling supplemental lighting layer:", error);
    }
  } else {
    console.warn("toggleDataLayer: layer not found or condition not met", {
      layerId,
      cyclingLayer: !!mapState.cyclingLayer,
      walkingLayer: !!mapState.walkingLayer,
    });
  }

  // Update legend after toggle
  updateLegend();
}

// Build and update legend based on visible layers
function updateLegend() {
  const legendItems = document.getElementById("legendItems");
  const legendPanel = document.getElementById("legendPanel");
  const visibleLayers = [];

  // Collect visible layers
  if (mapState.parkBoundaryLayer && mapState.parkBoundaryLayer.visible) {
    visibleLayers.push({
      id: "park-boundary",
      name: "Park Boundary",
      type: "outline",
    });
  }

  if (mapState.otherParksLayer && mapState.otherParksLayer.visible) {
    visibleLayers.push(
      {
        id: "all-parks-large",
        name: "Nearby Parks: Large (>10ha)",
        type: "filled-large",
      },
      { id: "all-parks-medium", name: "Nearby Parks: Medium", type: "filled" },
    );
  }

  if (mapState.entrancesLayer && mapState.entrancesLayer.visible) {
    visibleLayers.push({
      id: "park-entrances",
      name: "Park Entrances",
      type: "entrances",
    });
  }

  if (mapState.visibilityLayer && mapState.visibilityLayer.visible) {
    visibleLayers.push({
      id: "visibility-hexagons",
      name: "Visibility Analysis",
      type: "visibility",
    });
  }

  if (mapState.foliageLowLayer && mapState.foliageLowLayer.visible) {
    visibleLayers.push({
      id: "foliage-low-hexagons",
      name: "Low Foliage (<0.5m)",
      type: "foliage-low",
    });
  }

  if (mapState.foliageMidLayer && mapState.foliageMidLayer.visible) {
    visibleLayers.push({
      id: "foliage-mid-hexagons",
      name: "Mid Foliage (0.5-2m)",
      type: "foliage-mid",
    });
  }

  if (mapState.foliageTallLayer && mapState.foliageTallLayer.visible) {
    visibleLayers.push({
      id: "foliage-tall-hexagons",
      name: "Tall Foliage (2m+)",
      type: "foliage-tall",
    });
  }

  if (mapState.nachLayer && mapState.nachLayer.visible) {
    visibleLayers.push({
      id: "nach-network",
      name: "Predicted Route Popularity (NACH)",
      type: "nach",
    });
  }

  if (mapState.toiletLayer && mapState.toiletLayer.visible) {
    visibleLayers.push({
      id: "toilet-facilities",
      name: "Toilet Facilities",
      type: "toilet",
    });
  }

  if (mapState.benchesLayer && mapState.benchesLayer.visible) {
    visibleLayers.push({
      id: "benches",
      name: "Benches",
      type: "bench",
    });
  }

  if (mapState.cyclingLayer && mapState.cyclingLayer.visible) {
    visibleLayers.push({
      id: "park-cycling",
      name: "Cycling Routes",
      type: "park-cycling",
    });
  }

  if (mapState.walkingLayer && mapState.walkingLayer.visible) {
    visibleLayers.push({
      id: "park-walking",
      name: "Walking Routes",
      type: "park-walking",
    });
  }

  if (
    mapState.supplementalLightingLayer &&
    mapState.supplementalLightingLayer.visible
  ) {
    visibleLayers.push({
      id: "supplemental-lighting",
      name: "Supplemental Lighting",
      type: "supplemental-lighting",
    });
  }

  if (mapState.pocketParksLayer && mapState.pocketParksLayer.visible) {
    visibleLayers.push({
      id: "pocket-parks",
      name: "Pocket Parks & Small Greenspaces",
      type: "pocket-parks",
    });
  }

  if (mapState.cyclingNetworkLayer && mapState.cyclingNetworkLayer.visible) {
    visibleLayers.push({
      id: "cycling-network",
      name: "National Cycling Network",
      type: "cycling",
    });
  }

  if (
    mapState.featuresInAndNearParksLayer &&
    mapState.featuresInAndNearParksLayer.visible
  ) {
    visibleLayers.push({
      id: "features-in-and-near-parks",
      name: "Features and facilities",
      type: "features-in-and-near-parks",
    });
  }

  if (mapState.demographicsLayer && mapState.demographicsLayer.visible) {
    visibleLayers.push({
      id: "demographics",
      name: "Demographics (15 min catchment)",
      type: "demographics",
    });
  }

  // Area-level view (no park selected): describe the parks shown on the map
  if (
    mapState.allParksLayer &&
    map.hasLayer(mapState.allParksLayer) &&
    !(mapState.parkBoundaryLayer && mapState.parkBoundaryLayer.visible)
  ) {
    visibleLayers.push(
      {
        id: "area-parks-large",
        name: "Large park (>10ha)",
        type: "filled-large",
      },
      { id: "area-parks-medium", name: "Small/Medium park", type: "filled" },
    );
  }

  // Clear existing items
  legendItems.innerHTML = "";

  // Show legend if there are visible layers
  if (visibleLayers.length > 0) {
    legendPanel.style.display = "block";
  } else {
    legendPanel.style.display = "none";
    return;
  }

  // Build legend items
  visibleLayers.forEach((layer) => {
    const item = document.createElement("div");
    item.className = "legend-item";

    const marker = document.createElement("div");
    marker.className = "legend-marker";

    if (layer.type === "outline") {
      marker.className += " outline";
    } else if (layer.type === "filled") {
      marker.className += " filled";
    } else if (layer.type === "pocket-parks") {
      marker.style.border = "2px solid #FF6B35";
      marker.style.background = "rgba(255, 107, 53, 0.2)";
    } else if (layer.type === "filled-large") {
      marker.className += " filled-large";
    } else if (layer.type === "entrances") {
      // Show both primary and secondary entrance examples
      const label = document.createElement("span");
      label.textContent = layer.name;

      const entranceGroup = document.createElement("div");
      entranceGroup.style.marginBottom = "0.75rem";

      const entranceLabel = document.createElement("span");
      entranceLabel.style.fontSize = "0.85rem";
      entranceLabel.style.fontWeight = "500";
      entranceLabel.style.marginBottom = "0.25rem";
      entranceLabel.style.display = "block";
      entranceLabel.textContent = layer.name;
      entranceGroup.appendChild(entranceLabel);

      // Primary entrance
      const primaryItem = document.createElement("div");
      primaryItem.style.display = "flex";
      primaryItem.style.alignItems = "center";
      primaryItem.style.gap = "0.5rem";
      primaryItem.style.marginBottom = "0.25rem";
      primaryItem.style.fontSize = "0.85rem";

      const primaryMarker = document.createElement("div");
      primaryMarker.className = "legend-marker circle primary";
      primaryItem.appendChild(primaryMarker);

      const primaryLabel = document.createElement("span");
      primaryLabel.textContent = "Primary";
      primaryItem.appendChild(primaryLabel);

      entranceGroup.appendChild(primaryItem);

      // Secondary entrance
      const secondaryItem = document.createElement("div");
      secondaryItem.style.display = "flex";
      secondaryItem.style.alignItems = "center";
      secondaryItem.style.gap = "0.5rem";
      secondaryItem.style.fontSize = "0.85rem";

      const secondaryMarker = document.createElement("div");
      secondaryMarker.className = "legend-marker circle secondary";
      secondaryItem.appendChild(secondaryMarker);

      const secondaryLabel = document.createElement("span");
      secondaryLabel.textContent = "Secondary";
      secondaryItem.appendChild(secondaryLabel);

      entranceGroup.appendChild(secondaryItem);
      legendItems.appendChild(entranceGroup);
      return;
    } else if (layer.type === "visibility") {
      // Create visibility gradient legend
      const label = document.createElement("span");
      label.style.fontSize = "0.85rem";
      label.style.fontWeight = "500";
      label.style.marginBottom = "0.25rem";
      label.style.display = "block";
      label.textContent = layer.name;

      const visibilityGroup = document.createElement("div");
      visibilityGroup.style.marginBottom = "0.75rem";
      visibilityGroup.appendChild(label);

      // Create gradient bar using full viridis palette with opacity matching hex display (0.6)
      const gradientBar = document.createElement("div");
      gradientBar.style.width = "100%";
      gradientBar.style.height = "20px";
      gradientBar.style.background =
        "linear-gradient(to right, rgba(68, 1, 84, 0.6), rgba(72, 39, 119, 0.6), rgba(59, 82, 139, 0.6), rgba(45, 112, 142, 0.6), rgba(32, 144, 140, 0.6), rgba(31, 167, 141, 0.6), rgba(53, 183, 121, 0.6), rgba(110, 206, 88, 0.6), rgba(181, 222, 43, 0.6), rgba(253, 231, 36, 0.6))";
      gradientBar.style.borderRadius = "4px";
      gradientBar.style.marginBottom = "0.25rem";
      visibilityGroup.appendChild(gradientBar);

      // Add labels
      const labelContainer = document.createElement("div");
      labelContainer.style.display = "flex";
      labelContainer.style.justifyContent = "space-between";
      labelContainer.style.fontSize = "0.75rem";
      labelContainer.style.color = "#666";
      labelContainer.innerHTML = "<span>Low</span><span>High</span>";
      visibilityGroup.appendChild(labelContainer);

      legendItems.appendChild(visibilityGroup);
      return;
    } else if (layer.type === "foliage-low") {
      // Create low foliage gradient legend (white to green)
      const label = document.createElement("span");
      label.style.fontSize = "0.85rem";
      label.style.fontWeight = "500";
      label.style.marginBottom = "0.25rem";
      label.style.display = "block";
      label.textContent = layer.name;

      const foliageGroup = document.createElement("div");
      foliageGroup.style.marginBottom = "0.75rem";
      foliageGroup.appendChild(label);

      // Create gradient bar (white to green)
      const gradientBar = document.createElement("div");
      gradientBar.style.width = "100%";
      gradientBar.style.height = "20px";
      gradientBar.style.background =
        "linear-gradient(to right, #ffffff, #e8f5e9, #c8e6c9, #81c784, #4caf50, #2e7d32, #1b5e20)";
      gradientBar.style.borderRadius = "4px";
      gradientBar.style.marginBottom = "0.25rem";
      foliageGroup.appendChild(gradientBar);

      // Add labels
      const labelContainer = document.createElement("div");
      labelContainer.style.display = "flex";
      labelContainer.style.justifyContent = "space-between";
      labelContainer.style.fontSize = "0.75rem";
      labelContainer.style.color = "#666";
      labelContainer.innerHTML = "<span>10%</span><span>100%</span>";
      foliageGroup.appendChild(labelContainer);

      legendItems.appendChild(foliageGroup);
      return;
    } else if (layer.type === "foliage-mid") {
      // Create mid foliage gradient legend (white to green)
      const label = document.createElement("span");
      label.style.fontSize = "0.85rem";
      label.style.fontWeight = "500";
      label.style.marginBottom = "0.25rem";
      label.style.display = "block";
      label.textContent = layer.name;

      const foliageGroup = document.createElement("div");
      foliageGroup.style.marginBottom = "0.75rem";
      foliageGroup.appendChild(label);

      // Create gradient bar (white to green)
      const gradientBar = document.createElement("div");
      gradientBar.style.width = "100%";
      gradientBar.style.height = "20px";
      gradientBar.style.background =
        "linear-gradient(to right, #ffffff, #e8f5e9, #c8e6c9, #81c784, #4caf50, #2e7d32, #1b5e20)";
      gradientBar.style.borderRadius = "4px";
      gradientBar.style.marginBottom = "0.25rem";
      foliageGroup.appendChild(gradientBar);

      // Add labels
      const labelContainer = document.createElement("div");
      labelContainer.style.display = "flex";
      labelContainer.style.justifyContent = "space-between";
      labelContainer.style.fontSize = "0.75rem";
      labelContainer.style.color = "#666";
      labelContainer.innerHTML = "<span>10%</span><span>100%</span>";
      foliageGroup.appendChild(labelContainer);

      legendItems.appendChild(foliageGroup);
      return;
    } else if (layer.type === "foliage-tall") {
      // Create tall foliage gradient legend (white to green)
      const label = document.createElement("span");
      label.style.fontSize = "0.85rem";
      label.style.fontWeight = "500";
      label.style.marginBottom = "0.25rem";
      label.style.display = "block";
      label.textContent = layer.name;

      const foliageGroup = document.createElement("div");
      foliageGroup.style.marginBottom = "0.75rem";
      foliageGroup.appendChild(label);

      // Create gradient bar (white to green)
      const gradientBar = document.createElement("div");
      gradientBar.style.width = "100%";
      gradientBar.style.height = "20px";
      gradientBar.style.background =
        "linear-gradient(to right, #ffffff, #e8f5e9, #c8e6c9, #81c784, #4caf50, #2e7d32, #1b5e20)";
      gradientBar.style.borderRadius = "4px";
      gradientBar.style.marginBottom = "0.25rem";
      foliageGroup.appendChild(gradientBar);

      // Add labels
      const labelContainer = document.createElement("div");
      labelContainer.style.display = "flex";
      labelContainer.style.justifyContent = "space-between";
      labelContainer.style.fontSize = "0.75rem";
      labelContainer.style.color = "#666";
      labelContainer.innerHTML = "<span>10%</span><span>100%</span>";
      foliageGroup.appendChild(labelContainer);

      legendItems.appendChild(foliageGroup);
      return;
    } else if (layer.type === "nach") {
      // Create NACH (Predicted Route Popularity) Turbo gradient legend
      const label = document.createElement("span");
      label.style.fontSize = "0.85rem";
      label.style.fontWeight = "500";
      label.style.marginBottom = "0.25rem";
      label.style.display = "block";
      label.textContent = layer.name;

      const nachGroup = document.createElement("div");
      nachGroup.style.marginBottom = "0.75rem";
      nachGroup.appendChild(label);

      // Create gradient bar (Turbo colormap)
      const gradientBar = document.createElement("div");
      gradientBar.style.width = "100%";
      gradientBar.style.height = "20px";
      gradientBar.style.background = NACH_LEGEND_GRADIENT;
      gradientBar.style.borderRadius = "4px";
      gradientBar.style.marginBottom = "0.25rem";
      nachGroup.appendChild(gradientBar);

      // Add labels
      const labelContainer = document.createElement("div");
      labelContainer.style.display = "flex";
      labelContainer.style.justifyContent = "space-between";
      labelContainer.style.fontSize = "0.75rem";
      labelContainer.style.color = "#666";
      labelContainer.innerHTML = "<span>Low</span><span>High</span>";
      nachGroup.appendChild(labelContainer);

      legendItems.appendChild(nachGroup);
      return;
    } else if (layer.type === "toilet") {
      // Create toilet facilities legend
      const toiletGroup = document.createElement("div");
      toiletGroup.style.marginBottom = "0.75rem";

      // Create marker
      const toiletMarker = document.createElement("div");
      toiletMarker.style.display = "flex";
      toiletMarker.style.alignItems = "center";
      toiletMarker.style.gap = "0.5rem";

      const square = document.createElement("div");
      square.style.width = "16px";
      square.style.height = "16px";
      square.style.backgroundColor = "#007BFF";
      square.style.borderRadius = "2px";

      toiletMarker.appendChild(square);
      toiletMarker.appendChild(document.createTextNode("Toilet Facilities"));

      toiletGroup.appendChild(toiletMarker);
      legendItems.appendChild(toiletGroup);
      return;
    } else if (layer.type === "bench") {
      // Create benches legend
      const benchGroup = document.createElement("div");
      benchGroup.style.marginBottom = "0.75rem";

      // Create marker
      const benchMarker = document.createElement("div");
      benchMarker.style.display = "flex";
      benchMarker.style.alignItems = "center";
      benchMarker.style.gap = "0.5rem";

      const square = document.createElement("div");
      square.style.width = "16px";
      square.style.height = "16px";
      square.style.backgroundColor = "#8B6F47";
      // circle.style.borderRadius = '50%';

      benchMarker.appendChild(square);
      benchMarker.appendChild(
        document.createTextNode("Benches & Picnic Tables"),
      );

      benchGroup.appendChild(benchMarker);
      legendItems.appendChild(benchGroup);
      return;
    } else if (layer.type === "park-cycling") {
      // Create cycling routes legend
      const cyclingGroup = document.createElement("div");
      cyclingGroup.style.marginBottom = "0.75rem";
      cyclingGroup.style.display = "flex";
      cyclingGroup.style.alignItems = "center";
      cyclingGroup.style.gap = "0.5rem";

      const line = document.createElement("div");
      line.style.width = "24px";
      line.style.height = "0px";
      line.style.borderTop = "3px dashed #2196F3";
      line.style.flexShrink = "0";

      cyclingGroup.appendChild(line);
      cyclingGroup.appendChild(document.createTextNode("Cycling Routes"));

      legendItems.appendChild(cyclingGroup);
      return;
    } else if (layer.type === "park-walking") {
      // Create walking routes legend
      const walkingGroup = document.createElement("div");
      walkingGroup.style.marginBottom = "0.75rem";
      walkingGroup.style.display = "flex";
      walkingGroup.style.alignItems = "center";
      walkingGroup.style.gap = "0.5rem";

      const line = document.createElement("div");
      line.style.width = "24px";
      line.style.height = "3px";
      line.style.backgroundColor = "#FF6F00";
      line.style.borderRadius = "2px";
      line.style.flexShrink = "0";

      walkingGroup.appendChild(line);
      walkingGroup.appendChild(document.createTextNode("Walking Routes"));

      legendItems.appendChild(walkingGroup);
      return;
    } else if (layer.type === "supplemental-lighting") {
      // Create supplemental lighting legend
      const lightingGroup = document.createElement("div");
      lightingGroup.style.marginBottom = "0.75rem";

      // Points (circle markers)
      const pointsDiv = document.createElement("div");
      pointsDiv.style.display = "flex";
      pointsDiv.style.alignItems = "center";
      pointsDiv.style.gap = "0.5rem";
      pointsDiv.style.fontSize = "0.9rem";

      const circle = document.createElement("div");
      circle.style.width = "12px";
      circle.style.height = "12px";
      circle.style.backgroundColor = "#FFB300";
      circle.style.border = "1.5px solid #FF8C00";
      circle.style.borderRadius = "50%";
      circle.style.flexShrink = "0";

      pointsDiv.appendChild(circle);
      pointsDiv.appendChild(
        document.createTextNode("Street Lights (within 200m)"),
      );
      lightingGroup.appendChild(pointsDiv);

      legendItems.appendChild(lightingGroup);
      return;
    } else if (layer.type === "cycling") {
      // Create cycling network legend
      const cyclingGroup = document.createElement("div");
      cyclingGroup.style.marginBottom = "0.75rem";

      // Create marker
      const cyclingMarker = document.createElement("div");
      cyclingMarker.style.display = "flex";
      cyclingMarker.style.alignItems = "center";
      cyclingMarker.style.gap = "0.5rem";

      const line = document.createElement("div");
      line.style.width = "24px";
      line.style.height = "3px";
      line.style.backgroundColor = "#FF6B35";
      line.style.borderRadius = "2px";

      cyclingMarker.appendChild(line);
      cyclingMarker.appendChild(
        document.createTextNode("National Cycling Network"),
      );

      cyclingGroup.appendChild(cyclingMarker);
      legendItems.appendChild(cyclingGroup);
      return;
    } else if (layer.type === "features-in-and-near-parks") {
      const featuresGroup = document.createElement("div");
      featuresGroup.style.marginBottom = "0.75rem";

      const heading = document.createElement("span");
      heading.style.fontSize = "0.85rem";
      heading.style.fontWeight = "500";
      heading.style.marginBottom = "0.25rem";
      heading.style.display = "block";
      heading.textContent = layer.name;
      featuresGroup.appendChild(heading);

      const featureLayer = mapState.featuresInAndNearParksLayer;
      const categoriesInLayer = new Set();
      featureLayer.layer.eachLayer((l) => {
        categoriesInLayer.add(l._featureType);
      });
      const categoryOrder = [
        ...window.PARK_FEATURE_CATEGORY_ORDER,
        "User specific green space",
        "Other / unclassified",
      ];
      categoryOrder
        .filter((categoryName) => categoriesInLayer.has(categoryName))
        .forEach((categoryName) => {
          const row = document.createElement("div");
          row.style.display = "flex";
          row.style.alignItems = "center";
          row.style.gap = "0.5rem";
          row.style.marginBottom = "0.25rem";
          row.style.fontSize = "0.85rem";

          const swatch = document.createElement("div");
          swatch.style.width = "16px";
          swatch.style.height = "16px";
          swatch.style.flexShrink = "0";
          swatch.style.borderRadius = "2px";
          swatch.style.backgroundColor =
            window.PARK_FEATURE_CATEGORY_COLORS[categoryName];
          swatch.style.border = "1px solid rgba(0,0,0,0.4)";

          row.appendChild(swatch);
          row.appendChild(document.createTextNode(categoryName));
          featuresGroup.appendChild(row);
        });

      legendItems.appendChild(featuresGroup);
      return;
    } else if (layer.type === "demographics") {
      // Create demographics legend
      const demographicsGroup = document.createElement("div");
      demographicsGroup.style.marginBottom = "0.75rem";

      // Create marker
      const demographicsMarker = document.createElement("div");
      demographicsMarker.style.display = "flex";
      demographicsMarker.style.alignItems = "center";
      demographicsMarker.style.gap = "0.5rem";

      const square = document.createElement("div");
      square.style.width = "16px";
      square.style.height = "16px";
      square.style.backgroundColor = "#9C27B0";
      square.style.opacity = "0.6";
      square.style.borderRadius = "2px";

      demographicsMarker.appendChild(square);
      demographicsMarker.appendChild(
        document.createTextNode("Demographics (15 min catchment)"),
      );

      demographicsGroup.appendChild(demographicsMarker);
      legendItems.appendChild(demographicsGroup);
      return;
    }

    item.appendChild(marker);

    const label = document.createElement("span");
    label.textContent = layer.name;
    item.appendChild(label);

    legendItems.appendChild(item);
  });
}

// Reset map view
// Screenshot: grabs a single frame of the current tab's pixels (no re-rendering of map layers)
document.getElementById("screenshotBtn").addEventListener("click", async () => {
  let stream;
  // Create overlay to block all mouse events during screenshot
  const overlay = document.createElement("div");
  overlay.style.cssText =
    "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:all;z-index:999999;";
  document.body.appendChild(overlay);

  try {
    stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      preferCurrentTab: true,
      selfBrowserSurface: "include",
    });
    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    await video.play();
    await new Promise((r) => setTimeout(r, 500)); // let the picker UI disappear and rendering complete
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `safer-parks-${new Date().toISOString().slice(0, 10)}.png`; // browser auto-numbers repeats: (1), (2)...
      a.click();
      URL.revokeObjectURL(a.href);
    }, "image/png");
    // Keep overlay for 2 more seconds after capture to prevent click interference
    await new Promise((r) => setTimeout(r, 2000));
  } catch (err) {
    if (err.name !== "NotAllowedError") {
      console.error("Screenshot failed:", err);
      alert("Screenshot failed: " + err.message);
    }
  } finally {
    if (stream) stream.getTracks().forEach((t) => t.stop());
    overlay.remove();
  }
});

document.getElementById("resetMapBtn").addEventListener("click", () => {
  map.setView([54.0, -1.5], 7);
  if (mapState.featuresInAndNearParksLayer) {
    map.removeLayer(mapState.featuresInAndNearParksLayer.layer);
    mapState.featuresInAndNearParksLayer = null;
  }
  if (mapState.parksLayer) {
    map.removeLayer(mapState.parksLayer);
    mapState.parksLayer = null;
  }
  if (mapState.entrancesLayer && mapState.entrancesLayer.layer) {
    map.removeLayer(mapState.entrancesLayer.layer);
    mapState.entrancesLayer = null;
  }
  if (mapState.visibilityLayer && mapState.visibilityLayer.layer) {
    map.removeLayer(mapState.visibilityLayer.layer);
    mapState.visibilityLayer = null;
  }
  if (mapState.nachLayer && mapState.nachLayer.layer) {
    map.removeLayer(mapState.nachLayer.layer);
    mapState.nachLayer = null;
  }
  if (mapState.foliageLowLayer && mapState.foliageLowLayer.layer) {
    map.removeLayer(mapState.foliageLowLayer.layer);
    mapState.foliageLowLayer = null;
  }
  if (mapState.foliageMidLayer && mapState.foliageMidLayer.layer) {
    map.removeLayer(mapState.foliageMidLayer.layer);
    mapState.foliageMidLayer = null;
  }
  if (mapState.foliageTallLayer && mapState.foliageTallLayer.layer) {
    map.removeLayer(mapState.foliageTallLayer.layer);
    mapState.foliageTallLayer = null;
  }
  if (mapState.allParksLayer) {
    // Make sure all parks layer is visible
    if (!map.hasLayer(mapState.allParksLayer)) {
      mapState.allParksLayer.addTo(map);
    }
    // Fit to all parks if they exist
    const bounds = mapState.allParksLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }

  // Reset layer visibility states
  if (mapState.parkBoundaryLayer) {
    mapState.parkBoundaryLayer.visible = true;
  }
  if (mapState.otherParksLayer) {
    mapState.otherParksLayer.visible = true;
  }
  if (mapState.entrancesLayer) {
    mapState.entrancesLayer.visible = true;
  }

  // Park-level legend entries are gone; show the area legend if an area is loaded
  [
    "toiletLayer",
    "benchesLayer",
    "cyclingLayer",
    "walkingLayer",
    "supplementalLightingLayer",
    "demographicsLayer",
  ].forEach((key) => {
    if (
      mapState[key] &&
      mapState[key].layer &&
      map.hasLayer(mapState[key].layer)
    ) {
      map.removeLayer(mapState[key].layer);
    }
    mapState[key] = null;
  });
  mapState.parkBoundaryLayer = null;
  mapState.otherParksLayer = null;
  updateLegend();

  // Hide layer toggles when resetting
  document.getElementById("dataLayerToggles").style.display = "none";
  document.getElementById("layerHint").style.display = "none";
  document.getElementById("layerHR").style.display = "none";
  document.getElementById("parks").value = "";
  updateExploreTitle();

  // Hide park name in nav
  const navParkName = document.getElementById("navParkName");
  navParkName.style.display = "none";
});

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  console.log("Page loaded, initializing dashboard...");

  // Handle controls accordion toggle
  const accordionTrigger = document.getElementById("controls-heading");
  const accordionPanel = document.getElementById("controls-content");

  if (accordionTrigger && accordionPanel) {
    accordionTrigger.addEventListener("click", () => {
      const isExpanded =
        accordionTrigger.getAttribute("aria-expanded") === "true";
      accordionTrigger.setAttribute("aria-expanded", !isExpanded);

      if (isExpanded) {
        accordionPanel.style.display = "none";
      } else {
        accordionPanel.style.display = "block";
      }
    });
  }

  // Handle legend accordion toggle
  const legendTrigger = document.getElementById("legend-heading");
  const legendPanel = document.getElementById("legend-content");

  if (legendTrigger && legendPanel) {
    legendTrigger.addEventListener("click", () => {
      const isExpanded = legendTrigger.getAttribute("aria-expanded") === "true";
      legendTrigger.setAttribute("aria-expanded", !isExpanded);

      if (isExpanded) {
        legendPanel.style.display = "none";
      } else {
        legendPanel.style.display = "block";
      }
    });
  }

  // Initialize data on page load
  (async () => {
    await Promise.all([loadRegions(), loadRegionBoundaries()]);
    // loadAuthorities() and regional layers are called automatically when a region is selected
  })();
});
