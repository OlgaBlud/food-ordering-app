import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: "topping" | "side" | "size" | "crust" | string; // extend as needed
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  category_name: string;
  customization: string[]; // list of customization names
}

interface DummyData {
  categories: Category[];
  customization: Customization[];
  menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

async function clearAll(collectionId: string): Promise<void> {
  const list = await databases.listDocuments(
    appwriteConfig.databaseId,
    collectionId
  );

  await Promise.all(
    list.documents.map((doc) =>
      databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
    )
  );
}

async function clearStorage(): Promise<void> {
  const list = await storage.listFiles(appwriteConfig.bucketId);

  await Promise.all(
    list.files.map((file) =>
      storage.deleteFile(appwriteConfig.bucketId, file.$id)
    )
  );
}

async function uploadImageToStorage(imageUrl: string) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();

  const fileObj = {
    name: imageUrl.split("/").pop() || `file-${Date.now()}.jpg`,
    type: blob.type,
    size: blob.size,
    uri: imageUrl,
  };

  const file = await storage.createFile(
    appwriteConfig.bucketId,
    ID.unique(),
    fileObj
  );

  return storage.getFileViewURL(appwriteConfig.bucketId, file.$id);
}

// async function seed(): Promise<void> {
//   // 1. Clear all
//   await clearAll(appwriteConfig.categoriesTable);
//   await clearAll(appwriteConfig.customizationTable);
//   await clearAll(appwriteConfig.menuTable);
//   await clearAll(appwriteConfig.menuCustomizationsTable);
//   await clearStorage();

//   // 2. Create Categories
//   const categoryMap: Record<string, string> = {};
//   for (const cat of data.categories) {
//     const doc = await databases.createDocument(
//       appwriteConfig.databaseId,
//       appwriteConfig.categoriesTable,
//       ID.unique(),
//       cat
//     );
//     categoryMap[cat.name] = doc.$id;
//   }

//   // 3. Create Customizations
//   const customizationMap: Record<string, string> = {};
//   for (const cus of data.customization) {
//     const doc = await databases.createDocument(
//       appwriteConfig.databaseId,
//       appwriteConfig.customizationTable,
//       ID.unique(),
//       {
//         name: cus.name,
//         price: cus.price,
//         type: cus.type,
//       }
//     );
//     customizationMap[cus.name] = doc.$id;
//   }

//   // 4. Create Menu Items
//   const menuMap: Record<string, string> = {};
//   for (const item of data.menu) {
//     const uploadedImage = await uploadImageToStorage(item.image_url);

//     const doc = await databases.createDocument(
//       appwriteConfig.databaseId,
//       appwriteConfig.menuTable,
//       ID.unique(),
//       {
//         name: item.name,
//         description: item.description,
//         image_url: uploadedImage,
//         price: item.price,
//         rating: item.rating,
//         calories: item.calories,
//         protein: item.protein,
//         categories: categoryMap[item.category_name],
//       }
//     );

//     menuMap[item.name] = doc.$id;

//     // 5. Create menu_customization
//     for (const cusName of item.customization) {
//       await databases.createDocument(
//         appwriteConfig.databaseId,
//         appwriteConfig.menuCustomizationsTable,
//         ID.unique(),
//         {
//           menu: doc.$id,
//           customization: customizationMap[cusName],
//         }
//       );
//     }
//   }

//   console.log("✅ Seeding complete.");
// }

// export default seed;
async function seed(): Promise<void> {
  console.log("🧹 Clearing tables...");
  await clearAll(appwriteConfig.categoriesTable);
  await clearAll(appwriteConfig.customizationTable);
  await clearAll(appwriteConfig.menuTable);
  await clearAll(appwriteConfig.menuCustomizationsTable);
  await clearStorage();
  console.log("✅ Tables cleared");

  // 2. Create Categories
  const categoryMap: Record<string, string> = {};
  console.log("📦 Creating categories...");
  for (const cat of data.categories) {
    try {
      const doc = await databases.createDocument({
        databaseId: appwriteConfig.databaseId,
        collectionId: appwriteConfig.categoriesTable,
        documentId: ID.unique(),
        data: {
          name: cat.name,
          description: cat.description,
        },
      });
      categoryMap[cat.name] = doc.$id;
      console.log(`✅ Category created: ${cat.name}`);
    } catch (err) {
      console.error(`❌ Failed to create category: ${cat.name}`, err);
    }
  }

  // 3. Create Customizations
  const customizationMap: Record<string, string> = {};
  console.log("🧩 Creating customizations...");
  for (const cus of data.customization) {
    try {
      const doc = await databases.createDocument({
        databaseId: appwriteConfig.databaseId,
        collectionId: appwriteConfig.customizationTable,
        documentId: ID.unique(),
        data: {
          name: cus.name,
          price: cus.price,
          type: cus.type,
        },
      });
      customizationMap[cus.name] = doc.$id;
      console.log(`✅ Customization created: ${cus.name}`);
    } catch (err) {
      console.error(`❌ Failed to create customization: ${cus.name}`, err);
    }
  }

  // 4. Create Menu Items
  console.log("🍕 Creating menu items...");
  for (const item of data.menu) {
    try {
      const uploadedImage = await uploadImageToStorage(item.image_url);
      const doc = await databases.createDocument({
        databaseId: appwriteConfig.databaseId,
        collectionId: appwriteConfig.menuTable,
        documentId: ID.unique(),
        data: {
          name: item.name,
          description: item.description,
          image_url: uploadedImage,
          price: item.price,
          rating: item.rating,
          calories: item.calories,
          protein: item.protein,
          categories: categoryMap[item.category_name],
        },
      });
      console.log(`✅ Menu item created: ${item.name}`);

      // 5. Create menu_customization
      for (const cusName of item.customization) {
        await databases.createDocument({
          databaseId: appwriteConfig.databaseId,
          collectionId: appwriteConfig.menuCustomizationsTable,
          documentId: ID.unique(),
          data: {
            menu: doc.$id,
            customization: customizationMap[cusName],
          },
        });
      }
    } catch (err) {
      console.error(`❌ Failed to create menu item: ${item.name}`, err);
    }
  }

  console.log("🎉 ✅ Seeding complete.");
}
export default seed;
