import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, type User } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import type { SaveData } from './SaveManager';

// Firebase configuration
const firebaseConfig = {
  projectId: "apex-swarm-laharsh",
  appId: "1:57453097662:web:ccb31447593dcf694024ef",
  storageBucket: "apex-swarm-laharsh.firebasestorage.app",
  apiKey: "AIzaSyA1BuwUK2MtFvS_B75y7CkeRh5FAqhaBkk",
  authDomain: "apex-swarm-laharsh.firebaseapp.com",
  messagingSenderId: "57453097662"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export interface LeaderboardEntry {
    uid: string;
    displayName: string;
    survivalTime: number;
    totalKills: number;
    lastPlayedAt: any;
}

export class FirebaseManager {
    private currentUser: User | null = null;
    private onUserReadyCallbacks: (() => void)[] = [];
    public isReady: boolean = false;

    constructor() {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                this.currentUser = user;
                this.isReady = true;
                this.onUserReadyCallbacks.forEach(cb => cb());
                this.onUserReadyCallbacks = [];
            }
        });

        signInAnonymously(auth).catch((error) => {
            console.error("Firebase Anonymous Auth failed", error);
        });
    }

    public onReady(callback: () => void) {
        if (this.isReady) {
            callback();
        } else {
            this.onUserReadyCallbacks.push(callback);
        }
    }

    public getUid(): string | null {
        return this.currentUser?.uid || null;
    }

    // Sync save data and scores
    public async syncData(displayName: string, saveData: SaveData, currentRunTime?: number, currentRunKills?: number) {
        if (!this.currentUser) return;
        
        const userRef = doc(db, 'users', this.currentUser.uid);
        
        try {
            const docSnap = await getDoc(userRef);
            let highScoreTime = currentRunTime || 0;
            let highScoreKills = currentRunKills || 0;

            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.survivalTime > highScoreTime) highScoreTime = data.survivalTime;
                if (data.totalKills > highScoreKills) highScoreKills = data.totalKills;
            }

            await setDoc(userRef, {
                displayName,
                survivalTime: highScoreTime,
                totalKills: highScoreKills,
                saveData,
                lastPlayedAt: serverTimestamp()
            }, { merge: true });

        } catch (error) {
            console.error("Error syncing data to Firebase", error);
        }
    }

    public async saveRunLog(logData: {
        displayName: string | null;
        survivalTime: number;
        totalKills: number;
        level: number;
        weapons: any[];
        passives: any[];
        events: any[];
        statsTimeline: any[];
    }) {
        try {
            const logsRef = collection(db, 'run_logs');
            await addDoc(logsRef, {
                ...logData,
                uid: this.currentUser?.uid || 'anonymous',
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error("Error saving run log to Firebase", error);
        }
    }

    public async saveFeedback(feedbackText: string, rating: number, contactInfo: string): Promise<boolean> {
        try {
            const feedbackRef = collection(db, 'feedback');
            await addDoc(feedbackRef, {
                uid: this.currentUser?.uid || 'anonymous',
                feedback: feedbackText,
                rating: rating,
                contact: contactInfo,
                timestamp: serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error("Error saving feedback to Firebase", error);
            return false;
        }
    }

    public async getLeaderboard(metric: 'survivalTime' | 'totalKills'): Promise<LeaderboardEntry[]> {
        try {
            const usersRef = collection(db, 'users');
            const q = query(usersRef, orderBy(metric, 'desc'), limit(50));
            const querySnapshot = await getDocs(q);
            
            const leaderboard: LeaderboardEntry[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.displayName) {
                    leaderboard.push({
                        uid: doc.id,
                        displayName: data.displayName,
                        survivalTime: data.survivalTime || 0,
                        totalKills: data.totalKills || 0,
                        lastPlayedAt: data.lastPlayedAt
                    });
                }
            });
            return leaderboard;
        } catch (error) {
            console.error("Error fetching leaderboard", error);
            return [];
        }
    }

    public async checkDisplayNameExists(): Promise<string | null> {
        if (!this.currentUser) return null;
        try {
            const userRef = doc(db, 'users', this.currentUser.uid);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                return docSnap.data().displayName || null;
            }
        } catch (e) {
            console.error(e);
        }
        return null;
    }
}

export const firebaseManager = new FirebaseManager();
