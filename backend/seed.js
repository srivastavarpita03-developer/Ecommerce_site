const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

dotenv.config();

const User = require("./src/models/userModel");
const Category = require("./src/models/categoryModel");
const Product = require("./src/models/productsModel");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/e-commerce-site";

const UPLOADS_DIR = path.join(__dirname, "uploads");

// ======================================
// DOWNLOAD IMAGE
// ======================================

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;

    client
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`Failed to download: ${url} (status ${res.statusCode})`));
        }

        const stream = fs.createWriteStream(filepath);
        res.pipe(stream);

        stream.on("finish", () => {
          stream.close(resolve);
        });

        stream.on("error", (err) => {
          fs.unlink(filepath, () => {});
          reject(err);
        });
      })
      .on("error", reject);
  });
}

// ======================================
// CATEGORIES
// ======================================

const categories = [
  { name: "Men", icon: "👔", subcategory: ["Shirts", "T-Shirts", "Jeans", "Trousers", "Jackets"] },
  { name: "Women", icon: "👗", subcategory: ["Dresses", "Tops", "Sarees", "Kurtis", "Skirts"] },
  { name: "Kids", icon: "🧒", subcategory: ["T-Shirts", "Shorts", "Dresses", "Jeans"] },
  { name: "Accessories", icon: "👜", subcategory: ["Bags", "Watches", "Belts", "Sunglasses"] },
];

// ======================================
// USERS
// ======================================

const users = [
  {
    name: "Admin User",
    email: "admin@vestiq.com",
    password: "admin123",
    role: "admin",
    address: "VestiQ HQ, Mumbai",
    contactNumber: 9876543210,
  },
  {
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    password: "rahul123",
    role: "user",
    address: "42 MG Road, Delhi",
    contactNumber: 9876543211,
  },
  {
    name: "Priya Patel",
    email: "priya@gmail.com",
    password: "priya123",
    role: "user",
    address: "15 Anna Salai, Chennai",
    contactNumber: 9876543212,
  },
];

// ======================================
// PRODUCTS (with image URLs)
// ======================================

const products = [
  // ── MEN ──
  {
    title: "Classic Navy Blue Formal Shirt",
    description: "Premium cotton formal shirt with a tailored fit. Perfect for office wear and business meetings. Features a spread collar and full sleeves.",
    price: 1499,
    subcategory: "Shirts",
    discount: 15,
    stock: 50,
    features: [
      { key: "Material", value: "100% Cotton" },
      { key: "Fit", value: "Slim Fit" },
      { key: "Sleeve", value: "Full Sleeve" },
      { key: "Wash Care", value: "Machine Wash" },
    ],
    variant: ["S", "M", "L", "XL", "XXL"],
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
  },
  {
    title: "Premium White Oxford Shirt",
    description: "Timeless white oxford shirt crafted from fine cotton. A wardrobe essential that pairs effortlessly with chinos or jeans.",
    price: 1799,
    subcategory: "Shirts",
    discount: 10,
    stock: 35,
    features: [
      { key: "Material", value: "Cotton Oxford" },
      { key: "Fit", value: "Regular Fit" },
      { key: "Sleeve", value: "Full Sleeve" },
    ],
    variant: ["S", "M", "L", "XL"],
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
  },
  {
    title: "Black Graphic Print T-Shirt",
    description: "Bold graphic print tee in soft jersey cotton. Streetwear inspired design with a relaxed comfortable fit.",
    price: 799,
    subcategory: "T-Shirts",
    discount: 20,
    stock: 80,
    features: [
      { key: "Material", value: "Cotton Jersey" },
      { key: "Fit", value: "Relaxed Fit" },
      { key: "Pattern", value: "Graphic Print" },
    ],
    variant: ["S", "M", "L", "XL"],
    imageUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
  },
  {
    title: "Slim Fit Dark Wash Jeans",
    description: "Classic dark wash denim jeans with a modern slim fit. Stretch fabric for all-day comfort and movement.",
    price: 2199,
    subcategory: "Jeans",
    discount: 10,
    stock: 45,
    features: [
      { key: "Material", value: "Cotton Denim with Stretch" },
      { key: "Fit", value: "Slim Fit" },
      { key: "Wash", value: "Dark Indigo" },
    ],
    variant: ["28", "30", "32", "34", "36"],
    imageUrl: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
  },
  {
    title: "Beige Chino Trousers",
    description: "Versatile beige chinos with a clean finish. Ideal for smart-casual occasions. Comfortable mid-rise waist.",
    price: 1699,
    subcategory: "Trousers",
    discount: 5,
    stock: 40,
    features: [
      { key: "Material", value: "Cotton Twill" },
      { key: "Fit", value: "Tapered Fit" },
      { key: "Closure", value: "Button and Zip" },
    ],
    variant: ["28", "30", "32", "34"],
    imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&q=80",
  },
  {
    title: "Charcoal Wool Blend Blazer",
    description: "Sophisticated charcoal blazer in premium wool blend fabric. Unstructured design for a modern, relaxed elegance.",
    price: 4999,
    subcategory: "Jackets",
    discount: 25,
    stock: 20,
    features: [
      { key: "Material", value: "Wool Blend" },
      { key: "Fit", value: "Regular Fit" },
      { key: "Lining", value: "Fully Lined" },
      { key: "Pockets", value: "3 (2 front, 1 inner)" },
    ],
    variant: ["M", "L", "XL", "XXL"],
    imageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80",
  },
  {
    title: "Breathable Polo T-Shirt",
    description: "Classic polo t-shirt in moisture-wicking fabric. Perfect for casual outings and weekend getaways.",
    price: 999,
    subcategory: "T-Shirts",
    discount: 10,
    stock: 60,
    features: [
      { key: "Material", value: "Pique Cotton" },
      { key: "Fit", value: "Regular Fit" },
      { key: "Collar", value: "Ribbed Polo Collar" },
    ],
    variant: ["S", "M", "L", "XL", "XXL"],
    imageUrl: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=600&q=80",
  },

  // ── WOMEN ──
  {
    title: "Floral Print Summer Dress",
    description: "Light and breezy floral dress in soft georgette fabric. Features a flattering A-line silhouette and adjustable waist tie.",
    price: 1899,
    subcategory: "Dresses",
    discount: 20,
    stock: 30,
    features: [
      { key: "Material", value: "Georgette" },
      { key: "Fit", value: "A-Line" },
      { key: "Length", value: "Midi" },
      { key: "Pattern", value: "Floral Print" },
    ],
    variant: ["XS", "S", "M", "L"],
    imageUrl: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80",
  },
  {
    title: "Silk Blend Embroidered Saree",
    description: "Elegant silk blend saree with intricate embroidery work. Comes with a matching blouse piece. Perfect for festive occasions.",
    price: 3499,
    subcategory: "Sarees",
    discount: 15,
    stock: 15,
    features: [
      { key: "Material", value: "Silk Blend" },
      { key: "Length", value: "6.3 meters" },
      { key: "Blouse", value: "Included" },
      { key: "Occasion", value: "Festive / Party" },
    ],
    variant: ["Free Size"],
    imageUrl: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&q=80",
  },
  {
    title: "Cotton Anarkali Kurti",
    description: "Beautiful Anarkali kurti in pure cotton with block print design. Comfortable for daily wear with elegant styling.",
    price: 1299,
    subcategory: "Kurtis",
    discount: 10,
    stock: 55,
    features: [
      { key: "Material", value: "Pure Cotton" },
      { key: "Fit", value: "Flared" },
      { key: "Pattern", value: "Block Print" },
      { key: "Length", value: "Calf Length" },
    ],
    variant: ["S", "M", "L", "XL"],
    imageUrl: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&q=80",
  },
  {
    title: "Pastel Linen Crop Top",
    description: "Minimalist crop top in breathable linen fabric. Clean lines and a relaxed fit make it a summer essential.",
    price: 699,
    subcategory: "Tops",
    discount: 0,
    stock: 70,
    features: [
      { key: "Material", value: "Linen" },
      { key: "Fit", value: "Relaxed" },
      { key: "Sleeve", value: "Cap Sleeve" },
    ],
    variant: ["XS", "S", "M", "L"],
    imageUrl: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&q=80",
  },
  {
    title: "Pleated A-Line Midi Skirt",
    description: "Flowy pleated midi skirt with an elasticated waistband. Versatile piece that transitions from desk to dinner effortlessly.",
    price: 1199,
    subcategory: "Skirts",
    discount: 5,
    stock: 40,
    features: [
      { key: "Material", value: "Polyester Blend" },
      { key: "Fit", value: "A-Line" },
      { key: "Length", value: "Midi" },
    ],
    variant: ["XS", "S", "M", "L"],
    imageUrl: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&q=80",
  },

  // ── KIDS ──
  {
    title: "Kids Rainbow Striped T-Shirt",
    description: "Fun and colorful striped t-shirt for kids. Soft cotton that's gentle on skin. Perfect for playtime and school.",
    price: 499,
    subcategory: "T-Shirts",
    discount: 10,
    stock: 100,
    features: [
      { key: "Material", value: "Soft Cotton" },
      { key: "Fit", value: "Regular" },
      { key: "Pattern", value: "Striped" },
    ],
    variant: ["4-5Y", "6-7Y", "8-9Y", "10-11Y"],
    imageUrl: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80",
  },
  {
    title: "Kids Denim Shorts",
    description: "Comfortable denim shorts for active kids. Durable fabric with elastic waist for easy wear.",
    price: 599,
    subcategory: "Shorts",
    discount: 0,
    stock: 65,
    features: [
      { key: "Material", value: "Cotton Denim" },
      { key: "Fit", value: "Regular" },
      { key: "Closure", value: "Elastic Waist" },
    ],
    variant: ["4-5Y", "6-7Y", "8-9Y", "10-11Y"],
    imageUrl: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600&q=80",
  },

  // ── ACCESSORIES ──
  {
    title: "Premium Leather Messenger Bag",
    description: "Handcrafted genuine leather messenger bag with brass hardware. Multiple compartments for laptop and essentials.",
    price: 3999,
    subcategory: "Bags",
    discount: 20,
    stock: 25,
    features: [
      { key: "Material", value: "Genuine Leather" },
      { key: "Capacity", value: "15 inch Laptop" },
      { key: "Compartments", value: "4" },
      { key: "Strap", value: "Adjustable Shoulder" },
    ],
    variant: ["Brown", "Black"],
    imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
  },
  {
    title: "Minimalist Analog Watch",
    description: "Sleek analog watch with a clean dial design. Japanese quartz movement with genuine leather strap.",
    price: 2499,
    subcategory: "Watches",
    discount: 15,
    stock: 30,
    features: [
      { key: "Movement", value: "Japanese Quartz" },
      { key: "Strap", value: "Genuine Leather" },
      { key: "Water Resistance", value: "30 meters" },
      { key: "Case", value: "Stainless Steel" },
    ],
    variant: ["Black Dial", "White Dial"],
    imageUrl: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80",
  },
  {
    title: "Classic Aviator Sunglasses",
    description: "Timeless aviator sunglasses with UV400 protection. Lightweight metal frame with polarized lenses.",
    price: 1299,
    subcategory: "Sunglasses",
    discount: 10,
    stock: 45,
    features: [
      { key: "Lens", value: "Polarized" },
      { key: "Protection", value: "UV400" },
      { key: "Frame", value: "Metal" },
      { key: "Weight", value: "28g" },
    ],
    variant: ["Gold Frame", "Silver Frame"],
    imageUrl: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&q=80",
  },
];

// ======================================
// SEED FUNCTION
// ======================================

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("Connected!\n");

    // ── Ensure uploads directory exists ──
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }

    // ── Clear existing data ──
    console.log("Clearing old data...");
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log("Cleared!\n");

    // ── Seed Categories ──
    console.log("Seeding categories...");
    const createdCategories = await Category.insertMany(categories);
    console.log(`  ✓ ${createdCategories.length} categories created\n`);

    // Map category name → _id
    const catMap = {};
    createdCategories.forEach((c) => {
      catMap[c.name] = c._id;
    });

    // ── Seed Users ──
    console.log("Seeding users...");
    const hashedUsers = await Promise.all(
      users.map(async (u) => ({
        ...u,
        password: await bcrypt.hash(u.password, 10),
      }))
    );
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`  ✓ ${createdUsers.length} users created\n`);

    // ── Download product images ──
    console.log("Downloading product images...");
    const productsWithCategory = [];

    for (let i = 0; i < products.length; i++) {
      const p = products[i];

      // Assign category based on subcategory
      let catName = "Men";
      if (["Dresses", "Tops", "Sarees", "Kurtis", "Skirts"].includes(p.subcategory)) {
        catName = "Women";
      } else if (["Kids"].includes(p.subcategory) || p.title.toLowerCase().includes("kids")) {
        catName = "Kids";
      } else if (["Bags", "Watches", "Belts", "Sunglasses"].includes(p.subcategory)) {
        catName = "Accessories";
      }

      const images = [];

      if (p.imageUrl) {
        try {
          const ext = p.imageUrl.includes(".png")
            ? ".png"
            : p.imageUrl.includes(".webp")
              ? ".webp"
              : ".jpg";

          const filename = `${Date.now()}-${i}${ext}`;
          const filepath = path.join(UPLOADS_DIR, filename);

          await downloadImage(p.imageUrl, filepath);
          images.push(filename);

          console.log(`  ✓ [${i + 1}/${products.length}] ${p.title}`);
        } catch (err) {
          console.log(`  ✗ [${i + 1}/${products.length}] ${p.title} — ${err.message}`);
        }
      }

      productsWithCategory.push({
        ...p,
        category: catMap[catName],
        images,
      });
    }

    console.log(`\n  ✓ ${productsWithCategory.filter((p) => p.images.length > 0).length}/${products.length} images downloaded\n`);

    // ── Seed Products ──
    console.log("Seeding products...");
    const createdProducts = await Product.insertMany(productsWithCategory);
    console.log(`  ✓ ${createdProducts.length} products created\n`);

    // ── Summary ──
    console.log("═══════════════════════════════════════");
    console.log("  SEED COMPLETE!");
    console.log("═══════════════════════════════════════\n");
    console.log("  USERS (password same for all):");
    createdUsers.forEach((u) => {
      const plain = users.find((x) => x.email === u.email);
      console.log(`    ${u.role.padEnd(6)} | ${u.email.padEnd(22)} | ${plain.password}`);
    });
    console.log(`\n  CATEGORIES: ${createdCategories.map((c) => c.name).join(", ")}`);
    console.log(`  PRODUCTS:  ${createdProducts.length} items`);
    console.log(`  IMAGES:    ${createdProducts.filter((p) => p.images.length > 0).length} products with images\n`);
    console.log("═══════════════════════════════════════");

    process.exit(0);
  } catch (error) {
    console.error("Seed Error:", error);
    process.exit(1);
  }
}

seed();
