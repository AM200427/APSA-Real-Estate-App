// backend/server.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// ============================================
// PATHS, PERSISTENCE, UPLOAD
// ============================================
const DATA_DIR = path.join(__dirname, 'data');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
for (const dir of [DATA_DIR, UPLOAD_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadJSON(name, fallback) {
  const file = path.join(DATA_DIR, name);
  try {
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    console.error(`⚠️  Could not read ${name}, using fallback:`, err.message);
    return fallback;
  }
}

function saveJSON(name, data) {
  const file = path.join(DATA_DIR, name);
  const tmp = `${file}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, file); // atomic
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpe?g|png|webp)$/.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPG, PNG, or WEBP images are allowed'));
  },
});
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d' }));

// ============================================
// PROPERTIES DATA (21 properties)
// ============================================
const SEED_PROPERTIES = [
  {
    id: "1", title: "Luxury Apartment in Lusaka CBD", userId: "agent_mock_id", type: "Apartment", price: 8500, location: "Lusaka, Zambia", latitude: -15.4167, longitude: 28.2833,
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"],
    bedrooms: 3, bathrooms: 2, area: 1200, description: "Beautiful luxury apartment in the heart of Lusaka CBD with modern amenities and stunning city views.",
    amenities: ["Swimming Pool", "Gym", "Security", "Parking", "Elevator"], host: "Sarah Mwamba", hostPhone: "+260 971 234 567", hostId: "host1"
  },
  {
    id: "2", title: "Cozy Boarding House Near UNZA", userId: "agent_mock_id", type: "Boarding House", price: 3500, location: "Lusaka, Zambia", latitude: -15.3925, longitude: 28.3322,
    images: ["https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500"],
    bedrooms: 1, bathrooms: 1, area: 400, description: "Cozy boarding house near UNZA, perfect for students. Walking distance to campus and shopping centers.",
    amenities: ["WiFi", "Study Area", "Kitchen", "Laundry"], host: "Peter Banda", hostPhone: "+260 976 543 210", hostId: "host2"
  },
  {
    id: "3", title: "Modern Family House in Roma", type: "House", price: 12000, location: "Lusaka, Zambia", latitude: -15.3714, longitude: 28.3345,
    images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500", "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500", "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=500"],
    bedrooms: 4, bathrooms: 3, area: 2500, description: "Spacious modern family home in the exclusive Roma area. Large garden, swimming pool, and secure compound.",
    amenities: ["Swimming Pool", "Garden", "Garage", "Security", "Air Conditioning"], host: "Michael Phiri", hostPhone: "+260 955 678 901", hostId: "host3"
  },
  {
    id: "4", title: "Studio Apartment in Olympia", type: "Apartment", price: 5500, location: "Lusaka, Zambia", latitude: -15.3989, longitude: 28.3481,
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"],
    bedrooms: 1, bathrooms: 1, area: 500, description: "Modern studio apartment in Olympia, ideal for young professionals. Close to shopping malls and restaurants.",
    amenities: ["WiFi", "Parking", "Security", "Water Included"], host: "Grace Tembo", hostPhone: "+260 989 012 345", hostId: "host4"
  },
  {
    id: "5", title: "Executive House in Ibex Hill", type: "House", price: 18000, location: "Lusaka, Zambia", latitude: -15.3615, longitude: 28.3457,
    images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500", "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500", "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500"],
    bedrooms: 5, bathrooms: 4, area: 3500, description: "Executive luxury home in the prestigious Ibex Hill area. Panoramic city views and premium finishes throughout.",
    amenities: ["Swimming Pool", "Gym", "Cinema Room", "Garden", "Garage", "Staff Quarters"], host: "David Mulenga", hostPhone: "+260 977 123 456", hostId: "host5"
  },
  {
    id: "6", title: "Cozy Cottage in Avondale", type: "House", price: 7500, location: "Lusaka, Zambia", latitude: -15.3850, longitude: 28.3150,
    images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"],
    bedrooms: 2, bathrooms: 2, area: 800, description: "Charming cottage in Avondale with a beautiful garden. Perfect for small families or couples.",
    amenities: ["Garden", "Parking", "Security", "Pet Friendly"], host: "Mary Chibale", hostPhone: "+260 966 789 012", hostId: "host6"
  },
  {
    id: "7", title: "Modern Apartment in Chalala", type: "Apartment", price: 6500, location: "Lusaka, Zambia", latitude: -15.4100, longitude: 28.3350,
    images: ["https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=500", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"],
    bedrooms: 2, bathrooms: 2, area: 900, description: "Modern apartment in Chalala with contemporary finishes. Close to schools, shops, and hospitals.",
    amenities: ["WiFi", "Parking", "Security", "Elevator", "Water Included"], host: "Joseph Mwape", hostPhone: "+260 978 901 234", hostId: "host7"
  },
  {
    id: "8", title: "Student Boarding House in Kanyama", type: "Boarding House", price: 2500, location: "Lusaka, Zambia", latitude: -15.4050, longitude: 28.2650,
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500", "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"],
    bedrooms: 1, bathrooms: 2, area: 300, description: "Affordable boarding house for students in Kanyama. Basic amenities and close to public transport.",
    amenities: ["WiFi", "Kitchen", "Study Area"], host: "Esther Katongo", hostPhone: "+260 987 654 321", hostId: "host8"
  },
  {
    id: "9", title: "Modern Apartment in Ndola CBD", type: "Apartment", price: 4500, location: "Ndola, Zambia", latitude: -12.9683, longitude: 28.6366,
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500", "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600"], bedrooms: 2, bathrooms: 1, area: 700,
    description: "Bright apartment in Ndola's business district.", amenities: ["WiFi", "Parking"], host: "Grace Banda", hostPhone: "+260 966 123 456", hostId: "host9"
  },
  {
    id: "10", title: "Student Room in Ndola", type: "Boarding House", price: 1500, location: "Ndola, Zambia", latitude: -12.9800, longitude: 28.6500,
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"], bedrooms: 1, bathrooms: 2, area: 250,
    description: "Affordable student accommodation.", amenities: ["WiFi", "Study Area"], host: "Ndola Hostels", hostPhone: "+260 966 321 654", hostId: "host10"
  },
  {
    id: "11", title: "Family House in Ndola", type: "House", price: 6000, location: "Ndola, Zambia", latitude: -12.9500, longitude: 28.6200,
    images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500"], bedrooms: 3, bathrooms: 2, area: 1500,
    description: "Spacious house with a garden in a quiet neighbourhood.", amenities: ["Garden", "Parking", "Security"], host: "Ndola Properties", hostPhone: "+260 977 555 123", hostId: "host11"
  },
  {
    id: "12", title: "Spacious Family House in Kitwe", type: "House", price: 8000, location: "Kitwe, Zambia", latitude: -12.8024, longitude: 28.2132,
    images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500"], bedrooms: 4, bathrooms: 3, area: 2000,
    description: "Large family home with a garden.", amenities: ["Garden", "Garage", "Security"], host: "John Chisanga", hostPhone: "+260 977 789 012", hostId: "host12"
  },
  {
    id: "13", title: "Executive Suite in Kitwe", type: "Apartment", price: 7000, location: "Kitwe, Zambia", latitude: -12.8150, longitude: 28.2250,
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500"], bedrooms: 3, bathrooms: 2, area: 1100,
    description: "High-end apartment in Kitwe's business area.", amenities: ["Gym", "Pool", "Parking"], host: "Kitwe Homes", hostPhone: "+260 977 456 789", hostId: "host13"
  },
  {
    id: "14", title: "Cozy Bungalow in Kitwe", type: "House", price: 5000, location: "Kitwe, Zambia", latitude: -12.7800, longitude: 28.1900,
    images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500"], bedrooms: 2, bathrooms: 1, area: 600,
    description: "Charming bungalow with a small garden.", amenities: ["Garden", "Parking"], host: "Kitwe Realty", hostPhone: "+260 978 901 234", hostId: "host14"
  },
  {
    id: "15", title: "Cozy Studio in Livingstone", type: "Apartment", price: 3000, location: "Livingstone, Zambia", latitude: -17.8419, longitude: 25.8541,
    images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500"], bedrooms: 1, bathrooms: 1, area: 400,
    description: "Studio near Victoria Falls.", amenities: ["WiFi", "Kitchen"], host: "Victoria Mwansa", hostPhone: "+260 978 345 678", hostId: "host15"
  },
  {
    id: "16", title: "Guest House in Livingstone", type: "Boarding House", price: 2500, location: "Livingstone, Zambia", latitude: -17.8500, longitude: 25.8600,
    images: ["https://images.unsplash.com/photo-1554995207-c18c203602cb?w=500"], bedrooms: 2, bathrooms: 2, area: 500,
    description: "Cozy guest house near the falls.", amenities: ["Garden", "Parking"], host: "Victoria Falls Lodge", hostPhone: "+260 978 901 234", hostId: "host16"
  },
  {
    id: "17", title: "Luxury Villa in Livingstone", type: "House", price: 20000, location: "Livingstone, Zambia", latitude: -17.8300, longitude: 25.8400,
    images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500"], bedrooms: 6, bathrooms: 5, area: 4000,
    description: "Premium villa with a pool and views of the Zambezi.", amenities: ["Swimming Pool", "Garden", "Garage", "Security"], host: "Zambezi Estates", hostPhone: "+260 966 777 888", hostId: "host17"
  },
  {
    id: "18", title: "Beachfront Villa in Siavonga", type: "House", price: 15000, location: "Siavonga, Zambia", latitude: -16.5386, longitude: 28.7089,
    images: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500"], bedrooms: 5, bathrooms: 4, area: 3000,
    description: "Luxury villa on the shores of Lake Kariba.", amenities: ["Pool", "Garden", "Security"], host: "Lakeview Properties", hostPhone: "+260 966 789 123", hostId: "host18"
  },
  {
    id: "19", title: "Lake View Cabin in Siavonga", type: "Apartment", price: 4000, location: "Siavonga, Zambia", latitude: -16.5450, longitude: 28.7150,
    images: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500"], bedrooms: 2, bathrooms: 1, area: 600,
    description: "Cozy cabin with a lake view.", amenities: ["WiFi", "Parking"], host: "Kariba Cottages", hostPhone: "+260 977 123 456", hostId: "host19"
  },
  {
    id: "20", title: "Modern House in Kabwe", type: "House", price: 5500, location: "Kabwe, Zambia", latitude: -14.4469, longitude: 28.4464,
    images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500"], bedrooms: 3, bathrooms: 2, area: 1200,
    description: "Contemporary home with a spacious yard.", amenities: ["Garden", "Parking", "Security"], host: "Kabwe Homes", hostPhone: "+260 978 901 234", hostId: "host20"
  },
  {
    id: "21", title: "Affordable Apartment in Mufulira", type: "Apartment", price: 3000, location: "Mufulira, Zambia", latitude: -12.5500, longitude: 28.2333,
    images: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500"], bedrooms: 2, bathrooms: 1, area: 500,
    description: "Comfortable apartment in a quiet suburb.", amenities: ["WiFi", "Security"], host: "Mufulira Rentals", hostPhone: "+260 977 654 321", hostId: "host21"
  }
];

const SEED_REVIEWS = {
  "1": [ { id: "r1", userId: "user1", userName: "John Doe", userType: "client", rating: 5, comment: "Absolutely stunning apartment! The views are incredible and the location is perfect. Highly recommend!", date: "2026-08-01T10:00:00Z", createdAt: "2026-08-01T10:00:00Z" } ],
  "2": [ { id: "r4", userId: "user4", userName: "Alice Banda", userType: "client", rating: 4, comment: "Great location near UNZA. Quiet environment and friendly neighbors.", date: "2026-07-28T11:00:00Z", createdAt: "2026-07-28T11:00:00Z" } ],
  "3": [ { id: "r6", userId: "user6", userName: "Carol Phiri", userType: "client", rating: 5, comment: "Beautiful family home! The garden is amazing and the neighborhood is very safe.", date: "2026-07-30T13:20:00Z", createdAt: "2026-07-30T13:20:00Z" } ],
  "4": [], "5": [], "6": [], "7": [], "8": [], "9": [], "10": [], "11": [], "12": [], "13": [], "14": [], "15": [], "16": [], "17": [], "18": [], "19": [], "20": [], "21": []
};

// ---- load persisted state ----
let properties  = loadJSON('properties.json', SEED_PROPERTIES);
let reviewsData = loadJSON('reviews.json',    SEED_REVIEWS);
let wishlist    = loadJSON('wishlist.json',   []);

if (!fs.existsSync(path.join(DATA_DIR, 'properties.json'))) saveJSON('properties.json', properties);
if (!fs.existsSync(path.join(DATA_DIR, 'reviews.json')))    saveJSON('reviews.json', reviewsData);
if (!fs.existsSync(path.join(DATA_DIR, 'wishlist.json')))   saveJSON('wishlist.json', wishlist);

// ============================================
// API ROUTES
// ============================================

// ---------- PROPERTIES ----------
app.get('/api/properties', (req, res) => {
  const propertiesWithReviews = properties.map(prop => {
    const propertyReviews = reviewsData[prop.id] || [];
    const avgRating = propertyReviews.length > 0 ? propertyReviews.reduce((sum, r) => sum + r.rating, 0) / propertyReviews.length : 0;
    return { ...prop, reviews: propertyReviews, reviewCount: propertyReviews.length, rating: parseFloat(avgRating.toFixed(1)) };
  });
  res.json({ success: true, properties: propertiesWithReviews });
});

app.get('/api/properties/featured', (req, res) => {
  const featured = properties.slice(0, 5);
  const featuredWithReviews = featured.map(prop => {
    const propertyReviews = reviewsData[prop.id] || [];
    const avgRating = propertyReviews.length > 0 ? propertyReviews.reduce((sum, r) => sum + r.rating, 0) / propertyReviews.length : 0;
    return { ...prop, reviews: propertyReviews, reviewCount: propertyReviews.length, rating: parseFloat(avgRating.toFixed(1)) };
  });
  res.json({ success: true, properties: featuredWithReviews });
});

app.get('/api/properties/my-listings', (req, res) => {
  res.status(200).json({ success: true, properties: properties });
});

app.post('/api/properties', upload.array('images', 10), (req, res) => {
  try {
    const { title, description, price, type, location, latitude, longitude, bedrooms, bathrooms, area, amenities, host, hostPhone, hostId, userId } = req.body;
    if (!title || !price || !location) return res.status(400).json({ success: false, message: 'title, price and location are required' });

    // 🔥 Only take the files that Multer actually saved to the server
    const serverImages = (req.files || []).map(f => `/uploads/${f.filename}`);
    
    // 🔥 SAFE PARSING: Handle strings, arrays, and objects without crashing
    let remoteImages = [];
    if (req.body.images) {
      let parsedImages = req.body.images;
      
      if (typeof parsedImages === 'string') {
        try { parsedImages = JSON.parse(parsedImages); } 
        catch { parsedImages = [parsedImages]; }
      }
      
      if (!Array.isArray(parsedImages)) parsedImages = [parsedImages];

      remoteImages = parsedImages.filter(img => typeof img === 'string' && img.startsWith('http'));
    }

    let parsedAmenities = [];
    if (amenities) {
      try { const parsed = JSON.parse(amenities); parsedAmenities = Array.isArray(parsed) ? parsed : [amenities]; }
      catch { parsedAmenities = amenities.split(',').map(s => s.trim()).filter(Boolean); }
    }

    const newProperty = {
      id: `${Date.now()}`, userId: userId || 'agent_mock_id', title, type: type || 'Apartment', price: Number(price), location,
      latitude: latitude ? Number(latitude) : null, longitude: longitude ? Number(longitude) : null,
      images: [...remoteImages, ...serverImages], bedrooms: Number(bedrooms) || 0, bathrooms: Number(bathrooms) || 0, area: Number(area) || 0,
      description: description || '', amenities: parsedAmenities, host: host || 'Unknown Host', hostPhone: hostPhone || '', hostId: hostId || `host_${Date.now()}`, createdAt: new Date().toISOString(),
    };

    properties.push(newProperty);
    reviewsData[newProperty.id] = [];
    saveJSON('properties.json', properties);
    saveJSON('reviews.json', reviewsData);
    
    res.status(201).json({ success: true, property: newProperty });
  } catch (err) {
    console.error('🔥 ERROR in POST /api/properties:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ UPDATE PROPERTY ROUTE
app.put('/api/properties/:id', upload.array('images', 10), (req, res) => {
  try {
    const propertyId = req.params.id;
    const index = properties.findIndex(p => p.id === propertyId);
    if (index === -1) return res.status(404).json({ success: false, message: 'Property not found' });

    let existingImages = [];
    if (req.body.existingImages) {
      try { existingImages = JSON.parse(req.body.existingImages); } catch(e) {}
    }
    const newImages = (req.files || []).map(f => `/uploads/${f.filename}`);
    const finalImages = [...existingImages, ...newImages];

    const updatedProperty = {
      ...properties[index], ...req.body, id: propertyId,
      price: Number(req.body.price) || properties[index].price,
      bedrooms: Number(req.body.bedrooms) || properties[index].bedrooms,
      bathrooms: Number(req.body.bathrooms) || properties[index].bathrooms,
      area: Number(req.body.area) || properties[index].area,
      images: finalImages.length > 0 ? finalImages : properties[index].images,
      updatedAt: new Date().toISOString(),
    };

    properties[index] = updatedProperty;
    saveJSON('properties.json', properties);
    res.json({ success: true, property: updatedProperty });
  } catch (err) {
    console.error('🔥 ERROR in PUT /api/properties:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/properties/:id', (req, res) => {
  const property = properties.find(p => p.id === req.params.id);
  if (!property) return res.status(404).json({ success: false, message: 'Property not found' });
  const propertyReviews = reviewsData[property.id] || [];
  const avgRating = propertyReviews.length > 0 ? propertyReviews.reduce((sum, r) => sum + r.rating, 0) / propertyReviews.length : 0;
  res.json({ success: true, property: { ...property, reviews: propertyReviews, reviewCount: propertyReviews.length, rating: parseFloat(avgRating.toFixed(1)) } });
});

// ---------- REVIEWS ----------
app.get('/api/properties/:propertyId/reviews', (req, res) => {
  const { propertyId } = req.params;
  if (!properties.find(p => p.id === propertyId)) return res.status(404).json({ success: false, message: 'Property not found' });
  const reviews = reviewsData[propertyId] || [];
  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  res.json({ success: true, reviews, averageRating: parseFloat(averageRating.toFixed(1)), totalReviews: reviews.length });
});

app.post('/api/properties/:propertyId/reviews', (req, res) => {
  const { propertyId } = req.params;
  if (!properties.find(p => p.id === propertyId)) return res.status(404).json({ success: false, message: 'Property not found' });
  const newReview = { id: `r${Date.now()}`, userId: req.body.userId || 'anonymous', userName: req.body.userName || 'Anonymous', userType: req.body.userType || 'client', rating: req.body.rating || 5, comment: req.body.comment || 'Great property!', date: new Date().toISOString(), createdAt: new Date().toISOString() };
  if (!reviewsData[propertyId]) reviewsData[propertyId] = [];
  reviewsData[propertyId].push(newReview);
  saveJSON('reviews.json', reviewsData);
  res.json({ success: true, review: newReview, message: 'Review added successfully' });
});

app.put('/api/properties/:propertyId/reviews/:reviewId', (req, res) => {
  const { propertyId, reviewId } = req.params;
  if (!reviewsData[propertyId]) return res.status(404).json({ success: false, message: 'No reviews found' });
  const index = reviewsData[propertyId].findIndex(r => r.id === reviewId);
  if (index === -1) return res.status(404).json({ success: false, message: 'Review not found' });
  reviewsData[propertyId][index] = { ...reviewsData[propertyId][index], rating: req.body.rating || reviewsData[propertyId][index].rating, comment: req.body.comment || reviewsData[propertyId][index].comment, updatedAt: new Date().toISOString() };
  saveJSON('reviews.json', reviewsData);
  res.json({ success: true, review: reviewsData[propertyId][index], message: 'Review updated successfully' });
});

app.delete('/api/properties/:propertyId/reviews/:reviewId', (req, res) => {
  const { propertyId, reviewId } = req.params;
  if (!reviewsData[propertyId]) return res.status(404).json({ success: false, message: 'No reviews found' });
  const initialLength = reviewsData[propertyId].length;
  reviewsData[propertyId] = reviewsData[propertyId].filter(r => r.id !== reviewId);
  if (reviewsData[propertyId].length === initialLength) return res.status(404).json({ success: false, message: 'Review not found' });
  saveJSON('reviews.json', reviewsData);
  res.json({ success: true, message: 'Review deleted successfully' });
});

// ---------- USER REVIEWS ----------
app.get('/api/users/:userId/reviews', (req, res) => {
  const { userId } = req.params;
  const userReviews = [];
  for (const [propertyId, reviews] of Object.entries(reviewsData)) {
    reviews.forEach(review => {
      if (review.userId === userId) {
        const property = properties.find(p => p.id === propertyId);
        userReviews.push({ ...review, propertyId, propertyTitle: property?.title || 'Unknown Property', propertyImage: property?.images?.[0] || null });
      }
    });
  }
  userReviews.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  res.json({ success: true, reviews: userReviews, total: userReviews.length });
});

app.get('/api/users/:userId/reviews/count', (req, res) => {
  const { userId } = req.params;
  let count = 0;
  for (const reviews of Object.values(reviewsData)) { reviews.forEach(review => { if (review.userId === userId) count++; }); }
  res.json({ success: true, count });
});

// ---------- AUTH ----------
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (email && password) {
    let user = { id: 'user1', name: 'John Doe', email, role: 'Client' };
    if (email.toLowerCase().includes('agent')) user = { id: 'agent1', name: 'Agent User', email, role: 'Agent' };
    res.json({ success: true, token: 'fake-jwt-token', user });
  } else { res.status(401).json({ success: false, message: 'Invalid credentials' }); }
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (name && email && password) {
    res.json({ success: true, token: 'fake-jwt-token', user: { id: `user${Date.now()}`, name, email, role: role || 'Client' } });
  } else { res.status(400).json({ success: false, message: 'Missing fields' }); }
});

app.put('/api/auth/change-password', (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: 'Both current and new password are required' });
  if (newPassword.length < 6) return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
  if (currentPassword === newPassword) return res.status(400).json({ success: false, message: 'New password must be different from current' });
  res.json({ success: true, message: 'Password changed successfully' });
});

app.post('/api/auth/logout-all', (req, res) => res.json({ success: true, message: 'Logged out from all devices' }));
app.delete('/api/auth/account', (req, res) => res.json({ success: true, message: 'Account deleted' }));

// ---------- BOOKINGS ----------
app.get('/api/bookings/my-bookings', (req, res) => res.json({ success: true, bookings: [] }));

// ---------- WISHLIST ----------
app.get('/api/wishlist/check/:id', (req, res) => res.json({ success: true, isInWishlist: wishlist.some(item => item && item.id === req.params.id) }));
app.get('/api/wishlist', (req, res) => res.json({ success: true, wishlist: wishlist.filter(item => item !== null && item.id) }));
app.post('/api/wishlist', (req, res) => {
  const { property } = req.body;
  if (!property || !property.id) return res.status(400).json({ success: false, message: 'Invalid property data received' });
  if (!wishlist.some(item => item && item.id === property.id)) wishlist.push(property);
  saveJSON('wishlist.json', wishlist);
  res.json({ success: true, wishlist });
});
app.delete('/api/wishlist/:id', (req, res) => {
  wishlist = wishlist.filter(item => item && item.id !== req.params.id);
  saveJSON('wishlist.json', wishlist);
  res.json({ success: true, wishlist });
});

// ---------- HEALTH ----------
app.get('/api/health', (req, res) => res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() }));

// ---------- START SERVER ----------
const PORT = 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ APSA Backend running on port ${PORT}`);
  console.log(`📡 Listening on all network interfaces (0.0.0.0)`);
});

process.on('SIGINT', () => {
  saveJSON('properties.json', properties);
  saveJSON('reviews.json', reviewsData);
  saveJSON('wishlist.json', wishlist);
  server.close(() => process.exit(0));
});whats