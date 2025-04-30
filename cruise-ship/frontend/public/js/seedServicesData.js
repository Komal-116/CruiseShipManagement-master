// seedServicesData.js - Script to seed Firestore 'services' collection with hierarchical services, subcategories, and items with prices in Indian Rupees
// Uses Firebase SDK v9 modular imports

import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

// Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyCtIVWDl1X2QV9dzbKwjmBFpzUc_zrtrGY",
  authDomain: "celestia-management.firebaseapp.com",
  databaseURL: "https://celestia-management-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "celestia-management",
  storageBucket: "celestia-management.firebasestorage.app",
  messagingSenderId: "1018991690511",
  appId: "1:1018991690511:web:159883eaa14c4db57e347a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedServices() {
  const services = [
    {
      name: "Food",
      category: "food",
      subcategories: [
        {
          name: "Tiffin",
          items: [
            { name: "Idly", price: "₹200" },
            { name: "Dosa", price: "₹250" },
            { name: "Vada", price: "₹180" },
            { name: "Upma", price: "₹220" },
            { name: "Pongal", price: "₹250" }
          ]
        },
        {
          name: "Lunch",
          items: [
            { name: "Rice and Curry", price: "₹400" },
            { name: "Chapati and Sabzi", price: "₹350" },
            { name: "Dal Tadka", price: "₹300" },
            { name: "Paneer Butter Masala", price: "₹450" },
            { name: "Mixed Vegetable", price: "₹350" }
          ]
        },
        {
          name: "Dinner",
          items: [
            { name: "Biryani", price: "₹500" },
            { name: "Paneer Butter Masala", price: "₹450" },
            { name: "Chicken Curry", price: "₹550" },
            { name: "Fish Fry", price: "₹600" },
            { name: "Mixed Veg Curry", price: "₹400" }
          ]
        },
        {
          name: "Snacks",
          items: [
            { name: "Samosa", price: "₹150" },
            { name: "Pakora", price: "₹200" },
            { name: "Spring Roll", price: "₹250" },
            { name: "Cutlet", price: "₹200" },
            { name: "Paneer Tikka", price: "₹300" }
          ]
        }
      ]
    },
    {
      name: "Gym",
      category: "gym",
      subcategories: [
        {
          name: "Personal Training",
          items: [
            { name: "One-on-One Session", price: "₹2200" },
            { name: "Monthly Package", price: "₹15000" },
            { name: "Nutrition Consultation", price: "₹3700" },
            { name: "Strength Training", price: "₹3000" }
          ]
        },
        {
          name: "Group Classes",
          items: [
            { name: "Yoga", price: "₹1100" },
            { name: "Zumba", price: "₹1100" },
            { name: "Pilates", price: "₹1500" },
            { name: "CrossFit", price: "₹1800" }
          ]
        },
        {
          name: "Equipment Rental",
          items: [
            { name: "Treadmill", price: "₹750" },
            { name: "Dumbbells", price: "₹375" },
            { name: "Exercise Bike", price: "₹900" },
            { name: "Rowing Machine", price: "₹1100" }
          ]
        }
      ]
    },
    {
      name: "Salon",
      category: "salon",
      subcategories: [
        {
          name: "Hair",
          items: [
            { name: "Haircut", price: "₹1500" },
            { name: "Hair Coloring", price: "₹3000" },
            { name: "Hair Spa", price: "₹2600" },
            { name: "Hair Straightening", price: "₹3700" }
          ]
        },
        {
          name: "Nails",
          items: [
            { name: "Manicure", price: "₹1100" },
            { name: "Pedicure", price: "₹1300" },
            { name: "Nail Art", price: "₹1500" },
            { name: "Gel Nails", price: "₹1800" }
          ]
        },
        {
          name: "Facial",
          items: [
            { name: "Basic Facial", price: "₹1800" },
            { name: "Anti-Aging Facial", price: "₹2600" },
            { name: "Deep Cleansing Facial", price: "₹2200" }
          ]
        },
        {
          name: "Massage",
          items: [
            { name: "Swedish Massage", price: "₹3700" },
            { name: "Deep Tissue Massage", price: "₹4400" },
            { name: "Aromatherapy Massage", price: "₹4000" }
          ]
        }
      ]
    },
    {
      name: "Maintenance",
      category: "maintenance",
      subcategories: [
        {
          name: "Electrical",
          items: [
            { name: "Light Fixture Repair", price: "₹2200" },
            { name: "Wiring Check", price: "₹3700" },
            { name: "Socket Replacement", price: "₹3000" }
          ]
        },
        {
          name: "Plumbing",
          items: [
            { name: "Leak Fix", price: "₹3000" },
            { name: "Pipe Replacement", price: "₹5200" },
            { name: "Drain Cleaning", price: "₹2600" }
          ]
        },
        {
          name: "Carpentry",
          items: [
            { name: "Furniture Repair", price: "₹4400" },
            { name: "Custom Shelves", price: "₹5900" },
            { name: "Door Repair", price: "₹3700" }
          ]
        },
        {
          name: "Cleaning",
          items: [
            { name: "Room Cleaning", price: "₹1800" },
            { name: "Carpet Cleaning", price: "₹3000" },
            { name: "Window Cleaning", price: "₹2200" }
          ]
        }
      ]
    },
    {
      name: "Stationary",
      category: "stationary",
      subcategories: [
        {
          name: "Office Supplies",
          items: [
            { name: "Notebooks", price: "₹220" },
            { name: "Pens", price: "₹75" },
            { name: "Stapler", price: "₹370" }
          ]
        },
        {
          name: "Art Supplies",
          items: [
            { name: "Sketchbook", price: "₹370" },
            { name: "Paint Set", price: "₹1100" },
            { name: "Brush Set", price: "₹520" }
          ]
        },
        {
          name: "School Supplies",
          items: [
            { name: "Geometry Set", price: "₹520" },
            { name: "Backpack", price: "₹1500" },
            { name: "Lunch Box", price: "₹590" }
          ]
        }
      ]
    }
  ];

  for (const service of services) {
    const serviceRef = doc(collection(db, "services"));
    await setDoc(serviceRef, service);
    console.log(`Added service: ${service.name}`);
  }

  console.log("Seeding services data completed.");
}

seedServices().catch(console.error);
