// // config/db.js
// import mongoose from "mongoose";

// export const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(process.env.MONGO_URI, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
    
//     console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
//     mongoose.connection.on("error", (err) => {
//       console.error("MongoDB connection error:", err);
//     });
    
//     mongoose.connection.on("disconnected", () => {
//       console.log("MongoDB disconnected. Attempting to reconnect...");
//     });
    
//     return conn;
//   } catch (error) {
//     console.error("❌ MongoDB connection failed:", error.message);
//     process.exit(1);
//   }
// };







// config/db.js
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    console.log('🔌 ===== ATTEMPTING MONGODB CONNECTION =====');
    
    // Check if MONGO_URI is set
    if (!process.env.MONGO_URI) {
      console.error('❌ MONGO_URI is not defined in environment variables');
      throw new Error('MONGO_URI is not defined');
    }
    
    console.log('🔌 MONGO_URI length:', process.env.MONGO_URI.length);
    console.log('🔌 Database name from URI:', process.env.MONGO_URI.split('/').pop().split('?')[0]);
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000, // 45 seconds socket timeout
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      w: 'majority'
    };

    console.log('🔌 Connection options:', options);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log(`✅ ===== MONGODB CONNECTED =====`);
    console.log(`✅ Host: ${conn.connection.host}`);
    console.log(`✅ Database: ${conn.connection.name}`);
    console.log(`✅ Port: ${conn.connection.port}`);
    console.log(`✅ Connection state: ${mongoose.connection.readyState}`);
    console.log(`✅ Connection ID: ${conn.connection.id}`);
    
    // Test connection with a simple query
    try {
      const collections = await conn.connection.db.listCollections().toArray();
      console.log(`✅ Available collections: ${collections.map(c => c.name).join(', ')}`);
      
      // Check if Contract collection exists
      const contractCollectionExists = collections.some(c => c.name === 'contracts');
      console.log(`✅ Contract collection exists: ${contractCollectionExists}`);
    } catch (testError) {
      console.warn('⚠️ Could not list collections:', testError.message);
    }

    // Event listeners
    mongoose.connection.on("connecting", () => {
      console.log("🔄 MongoDB connecting...");
    });

    mongoose.connection.on("connected", () => {
      console.log("✅ MongoDB connected");
    });

    mongoose.connection.on("disconnecting", () => {
      console.log("🔄 MongoDB disconnecting...");
    });

    mongoose.connection.on("disconnected", () => {
      console.log("❌ MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
    });

    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err.message);
      console.error("Error details:", err);
    });

    mongoose.connection.on("fullsetup", () => {
      console.log("✅ MongoDB replica set connected");
    });

    // Monitor queries in development
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', (collectionName, method, query, doc) => {
        console.log(`📝 MongoDB ${collectionName}.${method}`, {
          query: JSON.stringify(query),
          doc: doc ? JSON.stringify(doc) : 'none'
        });
      });
    }

    return conn;
  } catch (error) {
    console.error("❌ ===== MONGODB CONNECTION FAILED ===== ");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Error stack:", error.stack);
    
    if (error.name === 'MongoParseError') {
      console.error("❌ MongoDB URI parsing error - check your MONGO_URI format");
    } else if (error.name === 'MongoNetworkError') {
      console.error("❌ MongoDB network error - check your connection and firewall settings");
    } else if (error.name === 'MongoServerError') {
      console.error("❌ MongoDB server error - check authentication and permissions");
    }
    
    // Exit with error code
    process.exit(1);
  }
};