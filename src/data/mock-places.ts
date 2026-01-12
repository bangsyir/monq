import type { Place, PlaceReview } from "@/types/place"

export const mockPlaces: Array<Place> = [
  {
    id: "1",
    name: "Mystic Falls",
    description:
      "A breathtaking 150-foot waterfall hidden deep within an ancient forest. The trail winds through towering redwoods before revealing this stunning cascade. Best visited in spring when the water flow is at its peak.",
    categories: ["waterfall", "hiking"],
    location: {
      latitude: 37.8651,
      longitude: -119.5383,
      address: "Mystic Falls Trail",
      city: "Yosemite Valley",
      state: "California",
      country: "USA",
    },
    images: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?w=800",
        alt: "Mystic Falls",
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1546514355-7fdc90ccbd03?w=800",
        alt: "Trail view",
      },
    ],
    rating: 4.9,
    reviewCount: 324,
    amenities: [
      { id: "1", name: "Parking", icon: "car" },
      { id: "2", name: "Restrooms", icon: "toilet" },
      { id: "3", name: "Swimming", icon: "waves" },
    ],
    difficulty: "moderate",
    duration: "3-4 hours",
    distance: "5.2 miles",
    elevation: "1,200 ft",
    bestSeason: ["Spring", "Summer"],
    isFeatured: true,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Starlight Camp",
    description:
      "An exclusive campsite perched on a cliff overlooking the Pacific Ocean. Wake up to stunning sunrises and fall asleep under a blanket of stars. Perfect for those seeking solitude and natural beauty.",
    categories: ["campsite"],
    location: {
      latitude: 36.2704,
      longitude: -121.8081,
      address: "Big Sur Coast",
      city: "Big Sur",
      state: "California",
      country: "USA",
    },
    images: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
        alt: "Starlight Camp",
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1517824806704-9040b037703b?w=800",
        alt: "Ocean view",
      },
    ],
    rating: 4.8,
    reviewCount: 189,
    amenities: [
      { id: "1", name: "Fire Pit", icon: "flame" },
      { id: "2", name: "Picnic Table", icon: "table" },
      { id: "3", name: "Ocean View", icon: "sunrise" },
    ],
    difficulty: "easy",
    bestSeason: ["Summer", "Fall"],
    isFeatured: true,
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Eagle Peak Trail",
    description:
      "A challenging summit hike offering panoramic 360-degree views of the surrounding mountain ranges. The trail features alpine meadows, rock scrambles, and potential wildlife sightings.",
    categories: ["hiking", "mountain", "trail"],
    location: {
      latitude: 40.3428,
      longitude: -105.6836,
      address: "Rocky Mountain National Park",
      city: "Estes Park",
      state: "Colorado",
      country: "USA",
    },
    images: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
        alt: "Eagle Peak",
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=800",
        alt: "Summit view",
      },
    ],
    rating: 4.7,
    reviewCount: 456,
    amenities: [
      { id: "1", name: "Trail Markers", icon: "signpost" },
      { id: "2", name: "Scenic Overlook", icon: "mountain" },
    ],
    difficulty: "hard",
    duration: "6-8 hours",
    distance: "12.4 miles",
    elevation: "3,500 ft",
    bestSeason: ["Summer", "Fall"],
    isFeatured: true,
    createdAt: "2024-01-05",
  },
  {
    id: "4",
    name: "Whispering Pines Trail",
    description:
      "A peaceful forest trail winding through ancient pine groves. The soft forest floor and gentle elevation make this perfect for nature walks and bird watching.",
    categories: ["trail"],
    location: {
      latitude: 35.1983,
      longitude: -111.6513,
      address: "Coconino National Forest",
      city: "Flagstaff",
      state: "Arizona",
      country: "USA",
    },
    images: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800",
        alt: "Pine Forest",
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800",
        alt: "Trail path",
      },
    ],
    rating: 4.6,
    reviewCount: 278,
    amenities: [
      { id: "1", name: "Dog Friendly", icon: "dog" },
      { id: "2", name: "Bike Allowed", icon: "bike" },
      { id: "3", name: "Parking", icon: "car" },
    ],
    difficulty: "easy",
    duration: "1-2 hours",
    distance: "3.1 miles",
    elevation: "400 ft",
    bestSeason: ["Spring", "Summer", "Fall"],
    createdAt: "2024-03-10",
  },
  {
    id: "5",
    name: "Crystal Lake",
    description:
      "A pristine alpine lake surrounded by snow-capped peaks. The crystal-clear waters reflect the surrounding mountains, creating a photographer's paradise.",
    categories: ["lake", "hiking", "campsite"],
    location: {
      latitude: 43.7904,
      longitude: -110.6818,
      address: "Grand Teton National Park",
      city: "Moose",
      state: "Wyoming",
      country: "USA",
    },
    images: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800",
        alt: "Crystal Lake",
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        alt: "Mountain reflection",
      },
    ],
    rating: 4.9,
    reviewCount: 512,
    amenities: [
      { id: "1", name: "Kayaking", icon: "sailboat" },
      { id: "2", name: "Fishing", icon: "fish" },
      { id: "3", name: "Camping", icon: "tent" },
    ],
    difficulty: "moderate",
    duration: "4-5 hours",
    distance: "7.8 miles",
    bestSeason: ["Summer"],
    isFeatured: true,
    createdAt: "2024-02-01",
  },
  {
    id: "6",
    name: "Thunder Peak",
    description:
      "A majestic mountain summit known for dramatic afternoon thunderstorms. The exposed ridge walk offers unparalleled views but requires careful weather planning.",
    categories: ["mountain", "hiking"],
    location: {
      latitude: 39.1178,
      longitude: -106.4453,
      address: "White River National Forest",
      city: "Aspen",
      state: "Colorado",
      country: "USA",
    },
    images: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800",
        alt: "Thunder Peak",
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800",
        alt: "Mountain sunset",
      },
    ],
    rating: 4.8,
    reviewCount: 167,
    amenities: [
      { id: "1", name: "Technical Climb", icon: "mountain-snow" },
      { id: "2", name: "Camping", icon: "tent" },
    ],
    difficulty: "expert",
    duration: "8-10 hours",
    distance: "14.2 miles",
    elevation: "4,800 ft",
    bestSeason: ["Summer"],
    createdAt: "2024-01-20",
  },
  {
    id: "7",
    name: "Cascade Falls & Camp",
    description:
      "A stunning waterfall with a scenic campsite nearby. Perfect for a weekend getaway combining hiking to the falls and camping under the stars.",
    categories: ["waterfall", "campsite", "trail"],
    location: {
      latitude: 45.3311,
      longitude: -121.7113,
      address: "Columbia River Gorge",
      city: "Hood River",
      state: "Oregon",
      country: "USA",
    },
    images: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
        alt: "Cascade Falls",
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?w=800",
        alt: "Camp view",
      },
    ],
    rating: 4.7,
    reviewCount: 203,
    amenities: [
      { id: "1", name: "Camping", icon: "tent" },
      { id: "2", name: "Fire Pit", icon: "flame" },
      { id: "3", name: "Swimming", icon: "waves" },
    ],
    difficulty: "moderate",
    duration: "2-3 hours",
    distance: "4.5 miles",
    elevation: "800 ft",
    bestSeason: ["Spring", "Summer", "Fall"],
    createdAt: "2024-03-05",
  },
  {
    id: "8",
    name: "Mirror Lake Summit",
    description:
      "An alpine lake nestled at the base of a dramatic mountain peak. The challenging hike rewards with pristine waters and panoramic mountain views.",
    categories: ["lake", "mountain", "hiking"],
    location: {
      latitude: 44.5705,
      longitude: -110.8281,
      address: "Yellowstone National Park",
      city: "West Yellowstone",
      state: "Montana",
      country: "USA",
    },
    images: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800",
        alt: "Mirror Lake",
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=800",
        alt: "Mountain peak",
      },
    ],
    rating: 4.9,
    reviewCount: 387,
    amenities: [
      { id: "1", name: "Scenic Overlook", icon: "mountain" },
      { id: "2", name: "Photography Spot", icon: "sunrise" },
    ],
    difficulty: "hard",
    duration: "5-6 hours",
    distance: "9.2 miles",
    elevation: "2,800 ft",
    bestSeason: ["Summer"],
    isFeatured: true,
    createdAt: "2024-02-15",
  },
  {
    id: "9",
    name: "Wildflower Meadow Trail",
    description:
      "A gentle trail through vibrant wildflower meadows, perfect for families and photographers. The trail connects to a peaceful lake where you can set up camp.",
    categories: ["trail", "lake", "campsite"],
    location: {
      latitude: 46.8523,
      longitude: -121.7603,
      address: "Mount Rainier National Park",
      city: "Ashford",
      state: "Washington",
      country: "USA",
    },
    images: [
      {
        id: "1",
        url: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800",
        alt: "Wildflower Meadow",
      },
      {
        id: "2",
        url: "https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800",
        alt: "Meadow view",
      },
    ],
    rating: 4.6,
    reviewCount: 234,
    amenities: [
      { id: "1", name: "Dog Friendly", icon: "dog" },
      { id: "2", name: "Parking", icon: "car" },
      { id: "3", name: "Camping", icon: "tent" },
    ],
    difficulty: "easy",
    duration: "2-3 hours",
    distance: "4.0 miles",
    elevation: "500 ft",
    bestSeason: ["Spring", "Summer"],
    createdAt: "2024-03-20",
  },
]

export const mockReviews: Record<string, Array<PlaceReview>> = {
  "1": [
    {
      id: "r1",
      userId: "u1",
      userName: "Sarah Mitchell",
      userAvatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100",
      rating: 5,
      comment:
        "Absolutely stunning waterfall! The hike was challenging but so worth it. Arrived early morning and had the place to ourselves. Truly a hidden gem!",
      createdAt: "2024-12-15",
    },
    {
      id: "r2",
      userId: "u2",
      userName: "James Chen",
      userAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
      rating: 5,
      comment:
        "The trail through the redwoods is magical. Bring waterproof gear as the mist from the falls can reach quite far. Perfect spot for photography enthusiasts.",
      createdAt: "2024-12-10",
    },
    {
      id: "r3",
      userId: "u3",
      userName: "Emily Rodriguez",
      rating: 4,
      comment:
        "Beautiful waterfall but it can get crowded on weekends. I recommend visiting on a weekday if possible. The parking lot fills up quickly.",
      createdAt: "2024-12-05",
    },
  ],
  "2": [
    {
      id: "r4",
      userId: "u4",
      userName: "Michael Brown",
      userAvatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
      rating: 5,
      comment:
        "Best camping experience of my life! Watching the sunset over the Pacific from our tent was unforgettable. Book well in advance!",
      createdAt: "2024-11-28",
    },
  ],
}

export const categories = [
  { id: "all", name: "All Places", icon: "compass" },
  { id: "waterfall", name: "Waterfalls", icon: "droplets" },
  { id: "campsite", name: "Campsites", icon: "tent" },
  { id: "hiking", name: "Hiking", icon: "mountain" },
  { id: "trail", name: "Trails", icon: "footprints" },
  { id: "lake", name: "Lakes", icon: "waves" },
  { id: "mountain", name: "Mountains", icon: "mountain-snow" },
]
