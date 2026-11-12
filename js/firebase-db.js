import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Web application's Firebase configuration coordinates
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize app instance
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Streams real-time updates from Firestore to the dynamic dashboard table.
 * @param {Function} callback - Function executed on every live data stream update.
 */
export function streamLiveCases(callback) {
    const casesRef = collection(db, "cases");
    const q = query(casesRef, orderBy("timestamp", "desc"));
    
    return onSnapshot(q, (snapshot) => {
        const activeCases = [];
        snapshot.forEach((doc) => {
            activeCases.push({ id: doc.id, ...doc.data() });
        });
        callback(activeCases);
    }, (error) => {
        console.error("Live ledger connection suspended due to rule restrictions:", error);
    });
}

/**
 * Safely posts user reports directly into the data verification funnel.
 * @param {Object} reportData - Object containing location, category, and descriptive evidence fields.
 */
export async function submitPublicReport(reportData) {
    try {
        const casesRef = collection(db, "cases");
        await addDoc(casesRef, {
            ...reportData,
            status: "🔴 Pending Action",
            timestamp: new Date().getTime()
        });
        return { success: true };
    } catch (error) {
        console.error("Write privilege denied by backend firewall rule:", error);
        return { success: false, error: error.message };
    }
}
