import {
  CreateUserParams,
  GetMenuParams,
  MenuItem,
  SignInParams,
  User,
} from "@/type";

import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
  TablesDB,
} from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  platform: process.env.EXPO_PUBLIC_APPWRITE_PLATFORM,
  databaseId: "68f9e0f30026aa607ebb",
  bucketId: "68ff23ce002682e92ecd",
  usersTable: "user",
  categoriesTable: "categories",
  menuTable: "menu",
  customizationTable: "customization",
  menuCustomizationsTable: "menu_customizations",
};
// console.log(appwriteConfig.databaseId);
export const client = new Client();

client
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform!);

export const account = new Account(client);
export const databases = new Databases(client);
export const tables = new TablesDB(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);
// AUTH;
// Register;
export const createUser = async ({
  email,
  password,
  name,
}: CreateUserParams) => {
  //   console.log(appwriteConfig.databaseId);
  // 1. Створюємо користувача в Appwrite Auth
  try {
    const newAccount = await account.create({
      userId: ID.unique(),
      email,
      password,
      name,
    });
    if (!newAccount) throw Error;

    //   2. Додаємо користувача в базу(Database)
    const avatarUrl = avatars.getInitialsURL(name);
    const newUser = await tables.createRow({
      databaseId: appwriteConfig.databaseId,
      //   collectionId: appwriteConfig.userCollection,
      tableId: appwriteConfig.usersTable,
      rowId: ID.unique(),
      data: {
        accountId: newAccount.$id,
        email,
        name,
        avatar: avatarUrl,
      },
    });
    // 3. Авторизуємо користувача
    await signIn({ email, password });
    return newUser;
  } catch (error) {
    throw new Error(error as string);
  }
};
// LogIn;
export const signIn = async ({ email, password }: SignInParams) => {
  try {
    const session = await account.createEmailPasswordSession({
      email,
      password,
    });
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error;
    const currentUser = await tables.listRows<User>({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.usersTable,
      queries: [Query.equal("accountId", currentAccount.$id)],
    });

    if (!currentUser) throw new Error();
    // console.log(currentUser);
    // console.log(currentUser.rows[0]);
    return currentUser.rows[0];
  } catch (error) {
    console.log(error);
    throw new Error(error as string);
  }
};
// LogOut
export const logOut = async () => {
  try {
    await account.deleteSession({ sessionId: "current" });
    console.log("User logged out successfully");
  } catch (error) {
    console.log("Logout error:", error);
    throw new Error(error as string);
  }
};

export const getMenu = async ({ category, query }: GetMenuParams) => {
  try {
    const queries: string[] = [];
    if (category) queries.push(Query.equal("categories", category));
    if (query) queries.push(Query.search("name", query));
    const menus = await tables.listRows<MenuItem>({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.menuTable,
      queries,
    });
    // console.log("Raw rows from Appwrite:", menus.rows);
    return menus.rows;
  } catch (e) {
    throw new Error(e as string);
  }
};

export const getCategories = async () => {
  try {
    const categories = await tables.listRows({
      databaseId: appwriteConfig.databaseId,
      tableId: appwriteConfig.categoriesTable,
    });

    return categories.rows;
  } catch (e) {
    throw new Error(e as string);
  }
};
