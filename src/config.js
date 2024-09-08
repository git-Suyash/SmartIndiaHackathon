export const config = {
    appwrite : {
        baseurl : import.meta.env.VITE_APPWRITE_PROJECT_ID,
        projectid : import.meta.env.VITE_APPWRITE_PROJECT_ID,
        databaseid : import.meta.env.VITE_DATABSE_ID,
        collectionid : import.meta.env.VITE_APPWRITE_COLLECTION_URL,
        storageid : import.meta.env.VITE_APPWRITE_STORAGE_ID
    }
}