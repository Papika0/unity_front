export interface Icon {
  name: string
  emoji: string
  category: string
  keywords: string[]
  color?: string
}

export const POPULAR_ICONS: Icon[] = [
  {
    name: 'location',
    emoji: '📍',
    category: 'მდებარეობა',
    keywords: ['location', 'place', 'pin'],
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  },
  {
    name: 'building',
    emoji: '🏢',
    category: 'მდებარეობა',
    keywords: ['building', 'office', 'structure'],
    color: 'bg-gradient-to-r from-slate-500 to-gray-600',
  },
  {
    name: 'security',
    emoji: '🔒',
    category: 'უსაფრთხოება',
    keywords: ['security', 'lock', 'safety'],
    color: 'bg-gradient-to-r from-red-500 to-rose-500',
  },
  {
    name: 'quality',
    emoji: '⭐',
    category: 'ხარისხი',
    keywords: ['quality', 'star', 'excellent'],
    color: 'bg-gradient-to-r from-amber-500 to-orange-500',
  },
  {
    name: 'parking',
    emoji: '🅿️',
    category: 'ტრანსპორტი',
    keywords: ['parking', 'car', 'vehicle'],
    color: 'bg-gradient-to-r from-gray-500 to-slate-500',
  },
  {
    name: 'wifi',
    emoji: '📶',
    category: 'ტექნოლოგია',
    keywords: ['wifi', 'internet', 'connection'],
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
  },
  {
    name: 'money',
    emoji: '💰',
    category: 'კომერცია',
    keywords: ['money', 'finance', 'business'],
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
  },
  {
    name: 'heart',
    emoji: '❤️',
    category: 'ხარისხი',
    keywords: ['heart', 'love', 'quality'],
    color: 'bg-gradient-to-r from-red-500 to-pink-500',
  },
  {
    name: 'fire',
    emoji: '🔥',
    category: 'ხარისხი',
    keywords: ['fire', 'hot', 'trending'],
    color: 'bg-gradient-to-r from-orange-500 to-red-500',
  },
  {
    name: 'diamond',
    emoji: '💎',
    category: 'ხარისხი',
    keywords: ['diamond', 'luxury', 'premium'],
    color: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  },
  {
    name: 'crown',
    emoji: '👑',
    category: 'ხარისხი',
    keywords: ['crown', 'royal', 'luxury'],
    color: 'bg-gradient-to-r from-yellow-500 to-amber-500',
  },
  {
    name: 'trophy',
    emoji: '🏆',
    category: 'ხარისხი',
    keywords: ['trophy', 'award', 'achievement'],
    color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
  },
  {
    name: 'shield',
    emoji: '🛡️',
    category: 'უსაფრთხოება',
    keywords: ['shield', 'protection', 'security'],
    color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
  },
  {
    name: 'camera',
    emoji: '📹',
    category: 'უსაფრთხოება',
    keywords: ['camera', 'surveillance', 'monitoring'],
    color: 'bg-gradient-to-r from-gray-600 to-slate-700',
  },
  {
    name: 'alarm',
    emoji: '🚨',
    category: 'უსაფრთხოება',
    keywords: ['alarm', 'alert', 'warning'],
    color: 'bg-gradient-to-r from-red-500 to-red-600',
  },
  {
    name: 'car',
    emoji: '🚗',
    category: 'ტრანსპორტი',
    keywords: ['car', 'vehicle', 'transport'],
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  },
  {
    name: 'bus',
    emoji: '🚌',
    category: 'ტრანსპორტი',
    keywords: ['bus', 'public', 'transport'],
    color: 'bg-gradient-to-r from-green-500 to-teal-500',
  },
  {
    name: 'metro',
    emoji: '🚇',
    category: 'ტრანსპორტი',
    keywords: ['metro', 'subway', 'underground'],
    color: 'bg-gradient-to-r from-slate-600 to-gray-700',
  },
  {
    name: 'bike',
    emoji: '🚲',
    category: 'ტრანსპორტი',
    keywords: ['bike', 'bicycle', 'cycling'],
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
  },
  {
    name: 'hospital',
    emoji: '🏥',
    category: 'ინფრასტრუქტურა',
    keywords: ['hospital', 'medical', 'health'],
    color: 'bg-gradient-to-r from-red-500 to-pink-500',
  },
  {
    name: 'school',
    emoji: '🏫',
    category: 'ინფრასტრუქტურა',
    keywords: ['school', 'education', 'learning'],
    color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
  },
  {
    name: 'bank',
    emoji: '🏦',
    category: 'ინფრასტრუქტურა',
    keywords: ['bank', 'finance', 'money'],
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
  },
  {
    name: 'shopping',
    emoji: '🛒',
    category: 'ინფრასტრუქტურა',
    keywords: ['shopping', 'store', 'retail'],
    color: 'bg-gradient-to-r from-orange-500 to-amber-500',
  },
  {
    name: 'restaurant',
    emoji: '🍽️',
    category: 'ინფრასტრუქტურა',
    keywords: ['restaurant', 'food', 'dining'],
    color: 'bg-gradient-to-r from-amber-500 to-orange-500',
  },
]

export const EMOJI_DATABASE: Icon[] = [
  // Location & Navigation
  {
    name: 'location',
    emoji: '📍',
    category: 'მდებარეობა',
    keywords: ['location', 'place', 'pin', 'map', 'address', 'მდებარეობა'],
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  },
  {
    name: 'map',
    emoji: '🗺️',
    category: 'მდებარეობა',
    keywords: ['map', 'navigation', 'route', 'direction', 'რუკა'],
    color: 'bg-gradient-to-r from-green-500 to-teal-500',
  },
  {
    name: 'compass',
    emoji: '🧭',
    category: 'მდებარეობა',
    keywords: ['compass', 'direction', 'navigation', 'bearing', 'კომპასი'],
    color: 'bg-gradient-to-r from-amber-500 to-orange-500',
  },
  {
    name: 'globe',
    emoji: '🌍',
    category: 'მდებარეობა',
    keywords: ['globe', 'world', 'global', 'earth', 'მსოფლიო'],
    color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
  },
  {
    name: 'building',
    emoji: '🏢',
    category: 'მდებარეობა',
    keywords: ['building', 'office', 'structure', 'architecture', 'შენობა'],
    color: 'bg-gradient-to-r from-slate-500 to-gray-600',
  },
  {
    name: 'home',
    emoji: '🏠',
    category: 'მდებარეობა',
    keywords: ['home', 'house', 'residence', 'dwelling', 'სახლი'],
    color: 'bg-gradient-to-r from-amber-500 to-orange-500',
  },
  {
    name: 'city',
    emoji: '🏙️',
    category: 'მდებარეობა',
    keywords: ['city', 'urban', 'metropolis', 'skyline', 'ქალაქი'],
    color: 'bg-gradient-to-r from-slate-600 to-gray-700',
  },
  {
    name: 'mountain',
    emoji: '🏔️',
    category: 'მდებარეობა',
    keywords: ['mountain', 'hill', 'peak', 'altitude', 'მთა'],
    color: 'bg-gradient-to-r from-gray-500 to-slate-600',
  },
  {
    name: 'beach',
    emoji: '🏖️',
    category: 'მდებარეობა',
    keywords: ['beach', 'coast', 'shore', 'sea', 'ზღვა'],
    color: 'bg-gradient-to-r from-cyan-500 to-blue-500',
  },

  // Security & Safety
  {
    name: 'security',
    emoji: '🔒',
    category: 'უსაფრთხოება',
    keywords: ['security', 'lock', 'safety', 'protection', 'უსაფრთხოება'],
  },
  {
    name: 'shield',
    emoji: '🛡️',
    category: 'უსაფრთხოება',
    keywords: ['shield', 'protection', 'defense', 'security', 'დაცვა'],
  },
  {
    name: 'camera',
    emoji: '📹',
    category: 'უსაფრთხოება',
    keywords: ['camera', 'surveillance', 'monitoring', 'security', 'კამერა'],
  },
  {
    name: 'alarm',
    emoji: '🚨',
    category: 'უსაფრთხოება',
    keywords: ['alarm', 'alert', 'warning', 'emergency', 'განგაში'],
  },
  {
    name: 'fire',
    emoji: '🔥',
    category: 'უსაფრთხოება',
    keywords: ['fire', 'safety', 'emergency', 'protection', 'ცეცხლი'],
  },
  {
    name: 'police',
    emoji: '👮',
    category: 'უსაფრთხოება',
    keywords: ['police', 'law', 'enforcement', 'security', 'პოლიცია'],
  },
  {
    name: 'key',
    emoji: '🗝️',
    category: 'უსაფრთხოება',
    keywords: ['key', 'access', 'security', 'lock', 'გასაღები'],
  },
  {
    name: 'guard',
    emoji: '🛡️',
    category: 'უსაფრთხოება',
    keywords: ['guard', 'security', 'protection', 'watch', 'დაცვა'],
  },

  // Quality & Luxury
  {
    name: 'quality',
    emoji: '⭐',
    category: 'ხარისხი',
    keywords: ['quality', 'star', 'excellent', 'premium', 'ხარისხი'],
  },
  {
    name: 'diamond',
    emoji: '💎',
    category: 'ხარისხი',
    keywords: ['diamond', 'luxury', 'premium', 'quality', 'ბრილიანტი'],
  },
  {
    name: 'crown',
    emoji: '👑',
    category: 'ხარისხი',
    keywords: ['crown', 'royal', 'luxury', 'premium', 'გვირგვინი'],
  },
  {
    name: 'trophy',
    emoji: '🏆',
    category: 'ხარისხი',
    keywords: ['trophy', 'award', 'achievement', 'excellence', 'ტროფეი'],
  },
  {
    name: 'medal',
    emoji: '🏅',
    category: 'ხარისხი',
    keywords: ['medal', 'award', 'recognition', 'achievement', 'მედალი'],
  },
  {
    name: 'gem',
    emoji: '💠',
    category: 'ხარისხი',
    keywords: ['gem', 'jewel', 'precious', 'luxury', 'ძვირფასი'],
  },
  {
    name: 'heart',
    emoji: '❤️',
    category: 'ხარისხი',
    keywords: ['heart', 'love', 'quality', 'care', 'სიყვარული'],
  },
  {
    name: 'sparkles',
    emoji: '✨',
    category: 'ხარისხი',
    keywords: ['sparkles', 'shine', 'quality', 'excellent', 'ბრწყინვალება'],
  },

  // Transportation
  {
    name: 'parking',
    emoji: '🅿️',
    category: 'ტრანსპორტი',
    keywords: ['parking', 'car', 'vehicle', 'space', 'პარკინგი'],
  },
  {
    name: 'car',
    emoji: '🚗',
    category: 'ტრანსპორტი',
    keywords: ['car', 'vehicle', 'automobile', 'transport', 'მანქანა'],
  },
  {
    name: 'bus',
    emoji: '🚌',
    category: 'ტრანსპორტი',
    keywords: ['bus', 'public', 'transport', 'transit', 'ავტობუსი'],
  },
  {
    name: 'metro',
    emoji: '🚇',
    category: 'ტრანსპორტი',
    keywords: ['metro', 'subway', 'underground', 'train', 'მეტრო', 'მეტროპოლიტენი'],
    color: 'bg-gradient-to-r from-slate-600 to-gray-700',
  },
  {
    name: 'train',
    emoji: '🚆',
    category: 'ტრანსპორტი',
    keywords: ['train', 'railway', 'metro', 'subway', 'მატარებელი', 'მეტრო'],
    color: 'bg-gradient-to-r from-blue-600 to-indigo-600',
  },
  {
    name: 'railway',
    emoji: '🚊',
    category: 'ტრანსპორტი',
    keywords: ['railway', 'tram', 'metro', 'transport', 'რელსები', 'მეტრო'],
    color: 'bg-gradient-to-r from-green-600 to-emerald-600',
  },
  {
    name: 'bike',
    emoji: '🚲',
    category: 'ტრანსპორტი',
    keywords: ['bike', 'bicycle', 'cycling', 'transport', 'ველოსიპედი'],
    color: 'bg-gradient-to-r from-green-500 to-emerald-500',
  },
  {
    name: 'walking',
    emoji: '🚶',
    category: 'ტრანსპორტი',
    keywords: ['walking', 'pedestrian', 'foot', 'walk', 'ფეხით'],
    color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
  },
  {
    name: 'taxi',
    emoji: '🚕',
    category: 'ტრანსპორტი',
    keywords: ['taxi', 'cab', 'transport', 'ride', 'ტაქსი'],
    color: 'bg-gradient-to-r from-yellow-500 to-amber-500',
  },
  {
    name: 'airplane',
    emoji: '✈️',
    category: 'ტრანსპორტი',
    keywords: ['airplane', 'flight', 'travel', 'airport', 'თვითმფრინავი'],
    color: 'bg-gradient-to-r from-sky-500 to-blue-500',
  },

  // Infrastructure
  {
    name: 'infrastructure',
    emoji: '🏗️',
    category: 'ინფრასტრუქტურა',
    keywords: ['infrastructure', 'construction', 'development', 'building', 'ინფრასტრუქტურა'],
  },
  {
    name: 'hospital',
    emoji: '🏥',
    category: 'ინფრასტრუქტურა',
    keywords: ['hospital', 'medical', 'health', 'clinic', 'საავადმყოფო'],
  },
  {
    name: 'school',
    emoji: '🏫',
    category: 'ინფრასტრუქტურა',
    keywords: ['school', 'education', 'learning', 'academy', 'სკოლა'],
  },
  {
    name: 'bank',
    emoji: '🏦',
    category: 'ინფრასტრუქტურა',
    keywords: ['bank', 'finance', 'money', 'financial', 'ბანკი'],
  },
  {
    name: 'shopping',
    emoji: '🛒',
    category: 'ინფრასტრუქტურა',
    keywords: ['shopping', 'store', 'retail', 'commerce', 'შოპინგი'],
  },
  {
    name: 'restaurant',
    emoji: '🍽️',
    category: 'ინფრასტრუქტურა',
    keywords: ['restaurant', 'food', 'dining', 'cafe', 'რესტორანი'],
  },
  {
    name: 'gas_station',
    emoji: '⛽',
    category: 'ინფრასტრუქტურა',
    keywords: ['gas', 'fuel', 'station', 'energy', 'ბენზინგასამართი'],
  },
  {
    name: 'wifi',
    emoji: '📶',
    category: 'ინფრასტრუქტურა',
    keywords: ['wifi', 'internet', 'connection', 'network', 'ვაიფაი'],
  },

  // Commercial & Business
  {
    name: 'commercial',
    emoji: '🏪',
    category: 'კომერცია',
    keywords: ['commercial', 'shop', 'store', 'business', 'კომერცია'],
  },
  {
    name: 'office',
    emoji: '💼',
    category: 'კომერცია',
    keywords: ['office', 'business', 'work', 'professional', 'ოფისი'],
  },
  {
    name: 'briefcase',
    emoji: '💼',
    category: 'კომერცია',
    keywords: ['briefcase', 'business', 'work', 'office', 'პორტფელი'],
  },
  {
    name: 'money',
    emoji: '💰',
    category: 'კომერცია',
    keywords: ['money', 'finance', 'wealth', 'business', 'ფული'],
  },
  {
    name: 'chart',
    emoji: '📊',
    category: 'კომერცია',
    keywords: ['chart', 'graph', 'analytics', 'business', 'დიაგრამა'],
  },
  {
    name: 'handshake',
    emoji: '🤝',
    category: 'კომერცია',
    keywords: ['handshake', 'deal', 'agreement', 'business', 'ხელის ჩამორთმევა'],
  },

  // Technology
  {
    name: 'technology',
    emoji: '💻',
    category: 'ტექნოლოგია',
    keywords: ['technology', 'computer', 'digital', 'modern', 'ტექნოლოგია'],
  },
  {
    name: 'smartphone',
    emoji: '📱',
    category: 'ტექნოლოგია',
    keywords: ['smartphone', 'phone', 'mobile', 'device', 'ტელეფონი'],
  },
  {
    name: 'robot',
    emoji: '🤖',
    category: 'ტექნოლოგია',
    keywords: ['robot', 'ai', 'automation', 'technology', 'რობოტი'],
  },
  {
    name: 'satellite',
    emoji: '🛰️',
    category: 'ტექნოლოგია',
    keywords: ['satellite', 'space', 'technology', 'communication', 'თანამგზავრი'],
  },
  {
    name: 'chip',
    emoji: '🔧',
    category: 'ტექნოლოგია',
    keywords: ['chip', 'processor', 'technology', 'hardware', 'ჩიპი'],
  },

  // Environment
  {
    name: 'environment',
    emoji: '🌱',
    category: 'გარემო',
    keywords: ['environment', 'green', 'eco', 'nature', 'გარემო'],
  },
  {
    name: 'tree',
    emoji: '🌳',
    category: 'გარემო',
    keywords: ['tree', 'nature', 'green', 'environment', 'ხე'],
  },
  {
    name: 'leaf',
    emoji: '🍃',
    category: 'გარემო',
    keywords: ['leaf', 'nature', 'green', 'eco', 'ფოთოლი'],
  },
  {
    name: 'sun',
    emoji: '☀️',
    category: 'გარემო',
    keywords: ['sun', 'solar', 'energy', 'bright', 'მზე'],
  },
  {
    name: 'water',
    emoji: '💧',
    category: 'გარემო',
    keywords: ['water', 'liquid', 'clean', 'resource', 'წყალი'],
  },
  {
    name: 'recycle',
    emoji: '♻️',
    category: 'გარემო',
    keywords: ['recycle', 'eco', 'green', 'sustainable', 'რეციკლინგი'],
  },

  // Recreation
  {
    name: 'recreation',
    emoji: '🎯',
    category: 'დასვენება',
    keywords: ['recreation', 'leisure', 'fun', 'entertainment', 'დასვენება'],
  },
  {
    name: 'gym',
    emoji: '🏋️',
    category: 'დასვენება',
    keywords: ['gym', 'fitness', 'exercise', 'health', 'სპორტდარბაზი'],
  },
  {
    name: 'pool',
    emoji: '🏊',
    category: 'დასვენება',
    keywords: ['pool', 'swimming', 'water', 'recreation', 'აუზი'],
  },
  {
    name: 'garden',
    emoji: '🌻',
    category: 'დასვენება',
    keywords: ['garden', 'park', 'nature', 'green', 'ბაღი'],
  },
  {
    name: 'playground',
    emoji: '🎪',
    category: 'დასვენება',
    keywords: ['playground', 'kids', 'children', 'fun', 'სათამაშო'],
  },
  {
    name: 'theater',
    emoji: '🎭',
    category: 'დასვენება',
    keywords: ['theater', 'entertainment', 'culture', 'arts', 'თეატრი'],
  },

  // Utilities
  {
    name: 'utilities',
    emoji: '⚡',
    category: 'კომუნალური',
    keywords: ['utilities', 'electricity', 'power', 'energy', 'კომუნალური'],
  },
  {
    name: 'water_drop',
    emoji: '💧',
    category: 'კომუნალური',
    keywords: ['water', 'utility', 'service', 'resource', 'წყალი'],
  },
  {
    name: 'trash',
    emoji: '🗑️',
    category: 'კომუნალური',
    keywords: ['trash', 'waste', 'garbage', 'disposal', 'ნაგავი'],
  },
  {
    name: 'wrench',
    emoji: '🔧',
    category: 'კომუნალური',
    keywords: ['wrench', 'maintenance', 'repair', 'service', 'საკრავი'],
  },
  {
    name: 'tools',
    emoji: '🛠️',
    category: 'კომუნალური',
    keywords: ['tools', 'maintenance', 'repair', 'service', 'ხელსაწყოები'],
  },

  // Communication
  {
    name: 'communication',
    emoji: '📞',
    category: 'კომუნიკაცია',
    keywords: ['communication', 'phone', 'contact', 'connect', 'კომუნიკაცია'],
  },
  {
    name: 'mail',
    emoji: '📧',
    category: 'კომუნიკაცია',
    keywords: ['mail', 'email', 'message', 'communication', 'ელფოსტა'],
  },
  {
    name: 'chat',
    emoji: '💬',
    category: 'კომუნიკაცია',
    keywords: ['chat', 'message', 'communication', 'talk', 'ჩეთი'],
  },
  {
    name: 'megaphone',
    emoji: '📢',
    category: 'კომუნიკაცია',
    keywords: ['megaphone', 'announcement', 'broadcast', 'communication', 'მეგაფონი'],
  },

  // Time
  {
    name: 'time',
    emoji: '⏰',
    category: 'დრო',
    keywords: ['time', 'clock', 'schedule', 'timing', 'დრო'],
  },
  {
    name: 'calendar',
    emoji: '📅',
    category: 'დრო',
    keywords: ['calendar', 'date', 'schedule', 'planning', 'კალენდარი'],
  },
  {
    name: 'clock',
    emoji: '🕐',
    category: 'დრო',
    keywords: ['clock', 'time', 'hour', 'schedule', 'საათი'],
  },
  {
    name: 'stopwatch',
    emoji: '⏱️',
    category: 'დრო',
    keywords: ['stopwatch', 'timer', 'time', 'measurement', 'ქრონომეტრი'],
  },
]
