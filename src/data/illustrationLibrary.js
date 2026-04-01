// ──────────────────────────────────────────────────────────────────────────────
// illustrationLibrary.js — Bibliothèque d'illustrations pour l'éditeur
// ──────────────────────────────────────────────────────────────────────────────
//
// Combine deux sources Iconify (chargement on-demand, zéro impact bundle) :
//   • logos:*    — Logos officiels des marques, réseaux sociaux, apps, tech
//   • openmoji:* — Stickers/emojis OpenMoji colorés (open-source)
//
// Chaque élément utilise un `iconId` Iconify. Le rendu se fait via
// <IconifyIcon :icon="item.iconId" /> dans EditorLeftSidebar.vue.
// Cliquer sur un élément appelle `editorStore.addIconElement()` avec
// `colorful: true` (tous sont multi-couleurs).
//
// ──────────────────────────────────────────────────────────────────────────────

// ═══════════════════════════════════════════════════════════════════════════════
// LOGOS — Marques, Réseaux Sociaux, Apps, Tech
// ═══════════════════════════════════════════════════════════════════════════════

export const ILLUSTRATION_CATEGORIES = [
  // ── Réseaux sociaux ─────────────────────────────────────────────────────
  {
    id: 'social',
    name: 'Réseaux sociaux',
    icons: [
      { id: 'logos:facebook', label: 'Facebook' },
      { id: 'skill-icons:instagram', label: 'Instagram' },
      { id: 'logos:twitter', label: 'Twitter' },
      { id: 'simple-icons:x', label: 'X', color: '#000000' },
      { id: 'logos:tiktok-icon', label: 'TikTok' },
      { id: 'logos:linkedin-icon', label: 'LinkedIn' },
      { id: 'logos:youtube-icon', label: 'YouTube' },
      { id: 'logos:pinterest', label: 'Pinterest' },
      { id: 'logos:reddit-icon', label: 'Reddit' },
      { id: 'logos:twitch', label: 'Twitch' },
      { id: 'logos:discord-icon', label: 'Discord' },
      { id: 'logos:mastodon-icon', label: 'Mastodon' },
      // Jeunes & tendances
      { id: 'simple-icons:snapchat', label: 'Snapchat', color: '#FFFC00' },
      { id: 'simple-icons:threads', label: 'Threads', color: '#000000' },
      { id: 'logos:bluesky', label: 'Bluesky' },
      { id: 'simple-icons:bereal', label: 'BeReal', color: '#313131' },
      // Professionnels
      { id: 'simple-icons:xing', label: 'Xing', color: '#006567' },
      { id: 'simple-icons:glassdoor', label: 'Glassdoor', color: '#0CAA41' },
      { id: 'simple-icons:indeed', label: 'Indeed', color: '#003A9B' },
      { id: 'simple-icons:angellist', label: 'AngelList', color: '#000000' },
      // Contenu & Médias
      { id: 'logos:medium-icon', label: 'Medium' },
      { id: 'logos:vimeo-icon', label: 'Vimeo' },
      { id: 'logos:patreon', label: 'Patreon' },
      { id: 'logos:soundcloud', label: 'SoundCloud' },
    ],
  },

  // ── Messagerie & Communication ──────────────────────────────────────────
  {
    id: 'messaging',
    name: 'Messagerie',
    icons: [
      { id: 'logos:whatsapp-icon', label: 'WhatsApp' },
      { id: 'logos:telegram', label: 'Telegram' },
      { id: 'logos:messenger', label: 'Messenger' },
      { id: 'logos:signal', label: 'Signal' },
      { id: 'logos:skype', label: 'Skype' },
      { id: 'logos:slack-icon', label: 'Slack' },
      { id: 'logos:microsoft-teams', label: 'Teams' },
      { id: 'logos:zoom-icon', label: 'Zoom' },
      { id: 'logos:google-meet', label: 'Google Meet' },
    ],
  },

  // ── Tech & Développement ────────────────────────────────────────────────
  {
    id: 'tech',
    name: 'Tech & Dev',
    icons: [
      { id: 'logos:javascript', label: 'JavaScript' },
      { id: 'logos:typescript-icon', label: 'TypeScript' },
      { id: 'logos:python', label: 'Python' },
      { id: 'logos:java', label: 'Java' },
      { id: 'logos:php', label: 'PHP' },
      { id: 'logos:c-plusplus', label: 'C++' },
      { id: 'logos:swift', label: 'Swift' },
      { id: 'logos:rust', label: 'Rust' },
      { id: 'logos:go', label: 'Go' },
      { id: 'logos:ruby', label: 'Ruby' },
      { id: 'logos:html-5', label: 'HTML5' },
      { id: 'logos:css-3', label: 'CSS3' },
      { id: 'logos:react', label: 'React' },
      { id: 'logos:vue', label: 'Vue.js' },
      { id: 'logos:angular-icon', label: 'Angular' },
      { id: 'logos:svelte-icon', label: 'Svelte' },
      { id: 'logos:nodejs-icon', label: 'Node.js' },
      { id: 'logos:deno', label: 'Deno' },
      { id: 'logos:docker-icon', label: 'Docker' },
      { id: 'logos:kubernetes', label: 'Kubernetes' },
      { id: 'logos:git-icon', label: 'Git' },
      { id: 'logos:github-icon', label: 'GitHub' },
      { id: 'logos:gitlab', label: 'GitLab' },
      { id: 'logos:visual-studio-code', label: 'VS Code' },
      { id: 'logos:figma', label: 'Figma' },
      { id: 'logos:npm-icon', label: 'NPM' },
      { id: 'logos:yarn', label: 'Yarn' },
      { id: 'logos:vitejs', label: 'Vite' },
      { id: 'logos:tailwindcss-icon', label: 'Tailwind CSS' },
      { id: 'logos:firebase', label: 'Firebase' },
    ],
  },

  // ── Apps & Services ─────────────────────────────────────────────────────
  {
    id: 'apps',
    name: 'Apps & Services',
    icons: [
      { id: 'logos:google-icon', label: 'Google' },
      { id: 'logos:google-gmail', label: 'Gmail' },
      { id: 'logos:google-drive', label: 'Google Drive' },
      { id: 'logos:google-maps', label: 'Google Maps' },
      { id: 'logos:google-calendar', label: 'Google Agenda' },
      { id: 'logos:google-photos', label: 'Google Photos' },
      { id: 'logos:apple', label: 'Apple' },
      { id: 'logos:microsoft-icon', label: 'Microsoft' },
      { id: 'logos:netflix-icon', label: 'Netflix' },
      { id: 'logos:spotify-icon', label: 'Spotify' },
      { id: 'logos:airbnb', label: 'Airbnb' },
      { id: 'simple-icons:uber', label: 'Uber' },
      { id: 'logos:paypal', label: 'PayPal' },
      { id: 'logos:stripe', label: 'Stripe' },
      { id: 'logos:shopify', label: 'Shopify' },
      { id: 'logos:wordpress-icon', label: 'WordPress' },
      { id: 'logos:notion-icon', label: 'Notion' },
      { id: 'logos:trello', label: 'Trello' },
      { id: 'logos:dropbox', label: 'Dropbox' },
    ],
  },

  // ── Design & Créativité ─────────────────────────────────────────────────
  {
    id: 'design',
    name: 'Design & Créativité',
    icons: [
      { id: 'logos:adobe-photoshop', label: 'Photoshop' },
      { id: 'logos:adobe-illustrator', label: 'Illustrator' },
      { id: 'logos:adobe-xd', label: 'Adobe XD' },
      { id: 'logos:adobe-premiere', label: 'Premiere Pro' },
      { id: 'logos:adobe-after-effects', label: 'After Effects' },
      { id: 'logos:adobe-indesign', label: 'InDesign' },
      { id: 'logos:adobe-lightroom', label: 'Lightroom' },
      { id: 'logos:sketch', label: 'Sketch' },
      { id: 'logos:invision-icon', label: 'InVision' },
      { id: 'logos:blender', label: 'Blender' },
      { id: 'logos:dribbble-icon', label: 'Dribbble' },
      { id: 'logos:behance', label: 'Behance' },
    ],
  },

  // ── Navigateurs & OS ────────────────────────────────────────────────────
  {
    id: 'browsers',
    name: 'Navigateurs & OS',
    icons: [
      { id: 'logos:chrome', label: 'Chrome' },
      { id: 'logos:firefox', label: 'Firefox' },
      { id: 'logos:safari', label: 'Safari' },
      { id: 'logos:microsoft-edge', label: 'Edge' },
      { id: 'logos:opera', label: 'Opera' },
      { id: 'logos:brave', label: 'Brave' },
      { id: 'logos:linux-tux', label: 'Linux' },
      { id: 'logos:ubuntu', label: 'Ubuntu' },
      { id: 'logos:android-icon', label: 'Android' },
      { id: 'logos:apple', label: 'iOS / macOS' },
      { id: 'logos:microsoft-windows', label: 'Windows' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STICKERS OPENMOJI — Emojis & Illustrations colorés
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Visages & Émotions ──────────────────────────────────────────────────
  {
    id: 'emoji-faces',
    name: 'Visages & Émotions',
    icons: [
      { id: 'openmoji:grinning-face', label: 'Sourire' },
      { id: 'openmoji:beaming-face-with-smiling-eyes', label: 'Rayonnant' },
      { id: 'openmoji:face-with-tears-of-joy', label: 'Larmes de joie' },
      { id: 'openmoji:smiling-face-with-heart-eyes', label: 'Yeux cœurs' },
      { id: 'openmoji:star-struck', label: 'Étoiles' },
      { id: 'openmoji:winking-face', label: 'Clin d\'œil' },
      { id: 'openmoji:thinking-face', label: 'Réflexion' },
      { id: 'openmoji:face-with-monocle', label: 'Monocle' },
      { id: 'openmoji:nerd-face', label: 'Nerd' },
      { id: 'openmoji:smiling-face-with-sunglasses', label: 'Lunettes' },
      { id: 'openmoji:partying-face', label: 'Fête' },
      { id: 'openmoji:exploding-head', label: 'Tête explose' },
      { id: 'openmoji:fire', label: 'Feu' },
      { id: 'openmoji:hundred-points', label: '100' },
      { id: 'openmoji:clapping-hands', label: 'Applaudir' },
      { id: 'openmoji:thumbs-up', label: 'Pouce levé' },
      { id: 'openmoji:victory-hand', label: 'Victoire' },
      { id: 'openmoji:raising-hands', label: 'Mains levées' },
      { id: 'openmoji:folded-hands', label: 'Prière' },
      { id: 'openmoji:handshake', label: 'Poignée de main' },
    ],
  },

  // ── Business & Travail ──────────────────────────────────────────────────
  {
    id: 'emoji-business',
    name: 'Business & Travail',
    icons: [
      { id: 'openmoji:briefcase', label: 'Mallette' },
      { id: 'openmoji:laptop', label: 'Portable' },
      { id: 'openmoji:desktop-computer', label: 'Ordinateur' },
      { id: 'openmoji:mobile-phone', label: 'Smartphone' },
      { id: 'openmoji:telephone-receiver', label: 'Récepteur' },
      { id: 'openmoji:envelope', label: 'Enveloppe' },
      { id: 'openmoji:incoming-envelope', label: 'Courrier entrant' },
      { id: 'openmoji:memo', label: 'Mémo' },
      { id: 'openmoji:clipboard', label: 'Presse-papier' },
      { id: 'openmoji:bar-chart', label: 'Graphique' },
      { id: 'openmoji:chart-increasing', label: 'Croissance' },
      { id: 'openmoji:money-bag', label: 'Sac d\'argent' },
      { id: 'openmoji:dollar-banknote', label: 'Billet' },
      { id: 'openmoji:gem-stone', label: 'Diamant' },
      { id: 'openmoji:trophy', label: 'Trophée' },
      { id: 'openmoji:sports-medal', label: 'Médaille' },
      { id: 'openmoji:rocket', label: 'Fusée' },
      { id: 'openmoji:light-bulb', label: 'Ampoule' },
      { id: 'openmoji:gear', label: 'Engrenage' },
      { id: 'openmoji:magnifying-glass-tilted-left', label: 'Recherche' },
    ],
  },

  // ── Nature & Météo ──────────────────────────────────────────────────────
  {
    id: 'emoji-nature',
    name: 'Nature & Météo',
    icons: [
      { id: 'openmoji:sun', label: 'Soleil' },
      { id: 'openmoji:cloud', label: 'Nuage' },
      { id: 'openmoji:rainbow', label: 'Arc-en-ciel' },
      { id: 'openmoji:snowflake', label: 'Flocon' },
      { id: 'openmoji:high-voltage', label: 'Éclair' },
      { id: 'openmoji:star', label: 'Étoile' },
      { id: 'openmoji:glowing-star', label: 'Étoile brillante' },
      { id: 'openmoji:sparkles', label: 'Étincelles' },
      { id: 'openmoji:four-leaf-clover', label: 'Trèfle' },
      { id: 'openmoji:deciduous-tree', label: 'Arbre' },
      { id: 'openmoji:palm-tree', label: 'Palmier' },
      { id: 'openmoji:herb', label: 'Herbe' },
      { id: 'openmoji:cherry-blossom', label: 'Cerisier' },
      { id: 'openmoji:rose', label: 'Rose' },
      { id: 'openmoji:sunflower', label: 'Tournesol' },
      { id: 'openmoji:tulip', label: 'Tulipe' },
      { id: 'openmoji:bouquet', label: 'Bouquet' },
      { id: 'openmoji:butterfly', label: 'Papillon' },
      { id: 'openmoji:globe-showing-europe-africa', label: 'Globe' },
      { id: 'openmoji:water-wave', label: 'Vague' },
    ],
  },

  // ── Nourriture & Boissons ───────────────────────────────────────────────
  {
    id: 'emoji-food',
    name: 'Nourriture',
    icons: [
      { id: 'openmoji:hot-beverage', label: 'Café' },
      { id: 'openmoji:teacup-without-handle', label: 'Thé' },
      { id: 'openmoji:tropical-drink', label: 'Cocktail' },
      { id: 'openmoji:wine-glass', label: 'Vin' },
      { id: 'openmoji:beer-mug', label: 'Bière' },
      { id: 'openmoji:pizza', label: 'Pizza' },
      { id: 'openmoji:hamburger', label: 'Hamburger' },
      { id: 'openmoji:french-fries', label: 'Frites' },
      { id: 'openmoji:taco', label: 'Taco' },
      { id: 'openmoji:sushi', label: 'Sushi' },
      { id: 'openmoji:birthday-cake', label: 'Gâteau' },
      { id: 'openmoji:ice-cream', label: 'Glace' },
      { id: 'openmoji:red-apple', label: 'Pomme' },
      { id: 'openmoji:avocado', label: 'Avocat' },
      { id: 'openmoji:croissant', label: 'Croissant' },
    ],
  },

  // ── Voyage & Lieux ──────────────────────────────────────────────────────
  {
    id: 'emoji-travel',
    name: 'Voyage & Lieux',
    icons: [
      { id: 'openmoji:airplane', label: 'Avion' },
      { id: 'openmoji:automobile', label: 'Voiture' },
      { id: 'openmoji:high-speed-train', label: 'Train' },
      { id: 'openmoji:ship', label: 'Navire' },
      { id: 'openmoji:bicycle', label: 'Vélo' },
      { id: 'openmoji:world-map', label: 'Carte monde' },
      { id: 'openmoji:compass', label: 'Boussole' },
      { id: 'openmoji:luggage', label: 'Valise' },
      { id: 'openmoji:camping', label: 'Camping' },
      { id: 'openmoji:house', label: 'Maison' },
      { id: 'openmoji:office-building', label: 'Immeuble' },
      { id: 'openmoji:hospital', label: 'Hôpital' },
      { id: 'openmoji:school', label: 'École' },
      { id: 'openmoji:church', label: 'Église' },
      { id: 'openmoji:statue-of-liberty', label: 'Statue liberté' },
    ],
  },

  // ── Sport & Activités ───────────────────────────────────────────────────
  {
    id: 'emoji-sport',
    name: 'Sport & Activités',
    icons: [
      { id: 'openmoji:soccer-ball', label: 'Football' },
      { id: 'openmoji:basketball', label: 'Basketball' },
      { id: 'openmoji:american-football', label: 'Football US' },
      { id: 'openmoji:tennis', label: 'Tennis' },
      { id: 'openmoji:volleyball', label: 'Volleyball' },
      { id: 'openmoji:pool-8-ball', label: 'Billard' },
      { id: 'openmoji:ping-pong', label: 'Ping-pong' },
      { id: 'openmoji:guitar', label: 'Guitare' },
      { id: 'openmoji:microphone', label: 'Micro' },
      { id: 'openmoji:headphone', label: 'Casque' },
      { id: 'openmoji:video-game', label: 'Jeu vidéo' },
      { id: 'openmoji:game-die', label: 'Dé' },
      { id: 'openmoji:artist-palette', label: 'Palette' },
      { id: 'openmoji:camera', label: 'Appareil photo' },
      { id: 'openmoji:movie-camera', label: 'Caméra' },
    ],
  },

  // ── Symboles & Divers ───────────────────────────────────────────────────
  {
    id: 'emoji-symbols',
    name: 'Symboles & Divers',
    icons: [
      { id: 'openmoji:red-heart', label: 'Cœur rouge' },
      { id: 'openmoji:orange-heart', label: 'Cœur orange' },
      { id: 'openmoji:yellow-heart', label: 'Cœur jaune' },
      { id: 'openmoji:green-heart', label: 'Cœur vert' },
      { id: 'openmoji:blue-heart', label: 'Cœur bleu' },
      { id: 'openmoji:purple-heart', label: 'Cœur violet' },
      { id: 'openmoji:check-mark-button', label: 'Validé' },
      { id: 'openmoji:cross-mark', label: 'Croix' },
      { id: 'openmoji:warning', label: 'Attention' },
      { id: 'openmoji:no-entry', label: 'Interdit' },
      { id: 'openmoji:recycling-symbol', label: 'Recyclage' },
      { id: 'openmoji:infinity', label: 'Infini' },
      { id: 'openmoji:peace-symbol', label: 'Paix' },
      { id: 'openmoji:musical-note', label: 'Note musique' },
      { id: 'openmoji:crown', label: 'Couronne' },
      { id: 'openmoji:wrapped-gift', label: 'Cadeau' },
      { id: 'openmoji:balloon', label: 'Ballon' },
      { id: 'openmoji:confetti-ball', label: 'Confettis' },
      { id: 'openmoji:party-popper', label: 'Fête' },
      { id: 'openmoji:ribbon', label: 'Ruban' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // SCÈNES — Illustrations SVG vectorielles (style unDraw)
  // Fichiers stockés dans /public/illustrations/undraw/
  // Ajoutées au canvas comme éléments image (type: 'image')
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Business & Professionnel ────────────────────────────────────────────
  {
    id: 'scene-business',
    name: 'Business',
    isSvgScene: true,
    icons: [
      { id: 'scene-business-deal', label: 'Business Deal', src: '/illustrations/undraw/business-deal.svg' },
      { id: 'scene-team-work', label: 'Travail d\'équipe', src: '/illustrations/undraw/team-work.svg' },
      { id: 'scene-growth-chart', label: 'Croissance', src: '/illustrations/undraw/growth-chart.svg' },
      { id: 'scene-presentation', label: 'Présentation', src: '/illustrations/undraw/presentation.svg' },
      { id: 'scene-coffee-meeting', label: 'Rendez-vous café', src: '/illustrations/undraw/coffee-meeting.svg' },
      { id: 'scene-building-office', label: 'Bureau', src: '/illustrations/undraw/building-office.svg' },
    ],
  },

  // ── Tech & Digital ─────────────────────────────────────────────────────
  {
    id: 'scene-tech',
    name: 'Tech & Digital',
    isSvgScene: true,
    icons: [
      { id: 'scene-laptop-work', label: 'Travail laptop', src: '/illustrations/undraw/laptop-work.svg' },
      { id: 'scene-mobile-app', label: 'App mobile', src: '/illustrations/undraw/mobile-app.svg' },
      { id: 'scene-cloud-hosting', label: 'Cloud', src: '/illustrations/undraw/cloud-hosting.svg' },
      { id: 'scene-data-analytics', label: 'Analytique', src: '/illustrations/undraw/data-analytics.svg' },
      { id: 'scene-globe-network', label: 'Réseau global', src: '/illustrations/undraw/globe-network.svg' },
      { id: 'scene-security-shield', label: 'Sécurité', src: '/illustrations/undraw/security-shield.svg' },
    ],
  },

  // ── Créativité & Lifestyle ─────────────────────────────────────────────
  {
    id: 'scene-creative',
    name: 'Créativité',
    isSvgScene: true,
    icons: [
      { id: 'scene-creative-idea', label: 'Idée créative', src: '/illustrations/undraw/creative-idea.svg' },
      { id: 'scene-rocket-launch', label: 'Lancement', src: '/illustrations/undraw/rocket-launch.svg' },
      { id: 'scene-target-goal', label: 'Objectif', src: '/illustrations/undraw/target-goal.svg' },
      { id: 'scene-email-sent', label: 'Email envoyé', src: '/illustrations/undraw/email-sent.svg' },
      { id: 'scene-photo-camera', label: 'Photographie', src: '/illustrations/undraw/photo-camera.svg' },
      { id: 'scene-music-headphones', label: 'Musique', src: '/illustrations/undraw/music-headphones.svg' },
      { id: 'scene-education-book', label: 'Éducation', src: '/illustrations/undraw/education-book.svg' },
      { id: 'scene-calendar-schedule', label: 'Planning', src: '/illustrations/undraw/calendar-schedule.svg' },
    ],
  },
]

// ── Flat array pour la recherche globale ──────────────────────────────────
export const ALL_ILLUSTRATIONS = ILLUSTRATION_CATEGORIES.flatMap((cat) =>
  cat.icons.map((icon) => ({
    ...icon,
    categoryId: cat.id,
    categoryName: cat.name,
    isSvgScene: cat.isSvgScene || false,
  })),
)
