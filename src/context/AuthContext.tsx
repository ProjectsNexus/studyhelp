import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType, cleanForFirestore } from "../firebase";
import { UniversityProfile, SemesterProfile, SubjectProfile, UserProfile } from "../types";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  universityProfile: UniversityProfile | null;
  semesters: SemesterProfile[];
  subjects: SubjectProfile[];
  activeSemester: SemesterProfile | null;
  activeSubject: SubjectProfile | null;
  isLoading: boolean;
  needsOnboarding: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  saveUniversityProfile: (profile: Partial<UniversityProfile>) => Promise<UniversityProfile>;
  addSemester: (sem: Omit<SemesterProfile, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<SemesterProfile>;
  updateSemester: (id: string, sem: Partial<SemesterProfile>) => Promise<void>;
  deleteSemester: (id: string) => Promise<void>;
  addSubject: (sub: Omit<SubjectProfile, "id" | "userId" | "createdAt" | "updatedAt">) => Promise<SubjectProfile>;
  updateSubject: (id: string, sub: Partial<SubjectProfile>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;
  setActiveSemesterId: (id: string) => void;
  setActiveSubjectId: (id: string) => void;
  setNeedsOnboarding: (val: boolean) => void;
  loginAsDemoStudent: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [universityProfile, setUniversityProfile] = useState<UniversityProfile | null>(null);
  const [semesters, setSemesters] = useState<SemesterProfile[]>([]);
  const [subjects, setSubjects] = useState<SubjectProfile[]>([]);
  const [activeSemesterId, setActiveSemesterId] = useState<string | null>(null);
  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);

  // Listen to Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          // Fetch user profile doc
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            setUserProfile(userSnap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              userId: currentUser.uid,
              email: currentUser.email || "",
              displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "Scholar",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${currentUser.uid}`);
        }
      } else {
        setUserProfile(null);
        setUniversityProfile(null);
        setSemesters([]);
        setSubjects([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to University Profiles for authenticated user
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "universityProfiles"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data() as UniversityProfile;
          setUniversityProfile({ ...docData, id: snapshot.docs[0].id });
          setNeedsOnboarding(false);
        } else {
          setUniversityProfile(null);
          setNeedsOnboarding(true);
        }
        setIsLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "universityProfiles");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  // Listen to Semesters
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "semesterProfiles"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: SemesterProfile[] = [];
        snapshot.forEach((d) => list.push({ ...(d.data() as SemesterProfile), id: d.id }));
        list.sort((a, b) => a.semesterNumber - b.semesterNumber);
        setSemesters(list);

        if (list.length > 0 && !activeSemesterId) {
          setActiveSemesterId(list[0].id || null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "semesterProfiles");
      }
    );

    return () => unsubscribe();
  }, [user, activeSemesterId]);

  // Listen to Subjects
  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "subjectProfiles"), where("userId", "==", user.uid));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: SubjectProfile[] = [];
        snapshot.forEach((d) => list.push({ ...(d.data() as SubjectProfile), id: d.id }));
        setSubjects(list);

        if (list.length > 0 && !activeSubjectId) {
          setActiveSubjectId(list[0].id || null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "subjectProfiles");
      }
    );

    return () => unsubscribe();
  }, [user, activeSubjectId]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });
      const newProfile: UserProfile = {
        userId: cred.user.uid,
        email,
        displayName: name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await setDoc(doc(db, "users", cred.user.uid), newProfile);
      setNeedsOnboarding(true);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUniversityProfile(null);
    setSemesters([]);
    setSubjects([]);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const saveUniversityProfile = async (profileData: Partial<UniversityProfile>): Promise<UniversityProfile> => {
    if (!user) throw new Error("Authentication required");

    const profileId = universityProfile?.id || `uni-${user.uid}`;
    const now = new Date().toISOString();

    const fullProfile: UniversityProfile = {
      id: profileId,
      userId: user.uid,
      name: profileData.name || "University",
      website: profileData.website || "",
      country: profileData.country || "United States",
      city: profileData.city || "",
      degree: profileData.degree || "Bachelor of Science",
      program: profileData.program || "Computer Science",
      department: profileData.department || "Computer Science & Engineering",
      academicLevel: profileData.academicLevel || "undergraduate",
      academicSystem: profileData.academicSystem || "Semester System",
      preferredLanguage: profileData.preferredLanguage || "English",
      answerStyle: profileData.answerStyle || "balanced",
      citationPreference: profileData.citationPreference || "apa",
      researchDepth: profileData.researchDepth || "standard",
      officialUrls: profileData.officialUrls || [],
      departments: profileData.departments || [],
      academicResources: profileData.academicResources || [],
      researchSources: profileData.researchSources || [],
      verified: profileData.verified ?? true,
      verificationNotes: profileData.verificationNotes || "",
      createdAt: universityProfile?.createdAt || now,
      updatedAt: now,
    };

    try {
      const sanitized = cleanForFirestore(fullProfile);
      await setDoc(doc(db, "universityProfiles", profileId), sanitized);
      setUniversityProfile(fullProfile);
      setNeedsOnboarding(false);

      // If user has no semesters yet, create initial default semester context
      if (semesters.length === 0) {
        await addSemester({
          semesterNumber: 4,
          name: "Spring Semester (Year 2)",
          program: fullProfile.program,
          description: "Core discipline and foundational coursework",
        });
      }

      return fullProfile;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `universityProfiles/${profileId}`);
      throw error;
    }
  };

  const addSemester = async (
    semData: Omit<SemesterProfile, "id" | "userId" | "createdAt" | "updatedAt">
  ): Promise<SemesterProfile> => {
    if (!user) throw new Error("Authentication required");
    const semId = `sem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newSem: SemesterProfile = {
      ...semData,
      id: semId,
      userId: user.uid,
      universityId: universityProfile?.id,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const sanitized = cleanForFirestore(newSem);
      await setDoc(doc(db, "semesterProfiles", semId), sanitized);
      setActiveSemesterId(semId);

      // Auto create a starter subject if this is the first semester
      if (subjects.length === 0) {
        await addSubject({
          semesterId: semId,
          name: "Database Systems",
          courseCode: "CS 334",
          description: "Relational database models, SQL, normal forms (1NF-BCNF), transactions, and indexing.",
          learningObjectives: [
            "Understand relational algebra and ER modeling",
            "Master database normalization up to BCNF",
            "Design ACID transactions and concurrent execution",
          ],
          topics: ["Normalization", "SQL Query Optimization", "Concurrency Control", "B-Trees"],
        });
      }

      return newSem;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `semesterProfiles/${semId}`);
      throw error;
    }
  };

  const updateSemester = async (id: string, semData: Partial<SemesterProfile>) => {
    if (!user) throw new Error("Authentication required");
    try {
      const sanitized = cleanForFirestore({
        ...semData,
        updatedAt: new Date().toISOString(),
      });
      await updateDoc(doc(db, "semesterProfiles", id), sanitized);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `semesterProfiles/${id}`);
      throw error;
    }
  };

  const deleteSemester = async (id: string) => {
    if (!user) throw new Error("Authentication required");
    try {
      await deleteDoc(doc(db, "semesterProfiles", id));
      if (activeSemesterId === id) {
        const remaining = semesters.filter((s) => s.id !== id);
        setActiveSemesterId(remaining[0]?.id || null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `semesterProfiles/${id}`);
      throw error;
    }
  };

  const addSubject = async (
    subData: Omit<SubjectProfile, "id" | "userId" | "createdAt" | "updatedAt">
  ): Promise<SubjectProfile> => {
    if (!user) throw new Error("Authentication required");
    const subId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    const newSub: SubjectProfile = {
      ...subData,
      id: subId,
      userId: user.uid,
      universityId: universityProfile?.id,
      createdAt: now,
      updatedAt: now,
    };

    try {
      const sanitized = cleanForFirestore(newSub);
      await setDoc(doc(db, "subjectProfiles", subId), sanitized);
      setActiveSubjectId(subId);
      return newSub;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `subjectProfiles/${subId}`);
      throw error;
    }
  };

  const updateSubject = async (id: string, subData: Partial<SubjectProfile>) => {
    if (!user) throw new Error("Authentication required");
    try {
      const sanitized = cleanForFirestore({
        ...subData,
        updatedAt: new Date().toISOString(),
      });
      await updateDoc(doc(db, "subjectProfiles", id), sanitized);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `subjectProfiles/${id}`);
      throw error;
    }
  };

  const deleteSubject = async (id: string) => {
    if (!user) throw new Error("Authentication required");
    try {
      await deleteDoc(doc(db, "subjectProfiles", id));
      if (activeSubjectId === id) {
        const remaining = subjects.filter((s) => s.id !== id);
        setActiveSubjectId(remaining[0]?.id || null);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `subjectProfiles/${id}`);
      throw error;
    }
  };

  // Quick Demo Student account login for instant interactive evaluation
  const loginAsDemoStudent = async () => {
    setIsLoading(true);
    const demoEmail = `student.demo.${Date.now()}@university.edu`;
    const demoPass = "AcademicResearch2026!";
    try {
      const cred = await createUserWithEmailAndPassword(auth, demoEmail, demoPass);
      await updateProfile(cred.user, { displayName: "Alex Rivera (Scholar)" });

      // Create rich university profile
      const uniProfile: UniversityProfile = {
        id: `uni-${cred.user.uid}`,
        userId: cred.user.uid,
        name: "Stanford University",
        website: "https://stanford.edu",
        country: "United States",
        city: "Stanford, California",
        degree: "Bachelor of Science",
        program: "Computer Science",
        department: "School of Engineering",
        academicLevel: "undergraduate",
        academicSystem: "Quarter System (10-week terms)",
        preferredLanguage: "English",
        answerStyle: "rigorous",
        citationPreference: "ieee",
        researchDepth: "deep",
        verified: true,
        verificationNotes: "Official accreditation verified. Department catalog loaded with CS core systems track.",
        officialUrls: [
          { title: "Stanford CS Course Catalog", url: "https://cs.stanford.edu/academics", type: "portal" },
          { title: "Stanford Engineering Library", url: "https://library.stanford.edu", type: "library" },
        ],
        departments: [
          { name: "Computer Science", description: "Systems, AI, Theory, and Database Specializations" },
          { name: "Electrical Engineering", description: "Hardware and Network Architectures" },
        ],
        academicResources: [
          { title: "Stanford Digital Repository (SDR)", url: "https://sdr.stanford.edu" },
        ],
        researchSources: [
          { title: "Stanford University Official Accreditation", url: "https://stanford.edu/about" },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "universityProfiles", uniProfile.id!), uniProfile);

      // Create starter semesters and subjects
      const sem1Id = `sem-${Date.now()}-1`;
      const sem2Id = `sem-${Date.now()}-2`;

      const sem1: SemesterProfile = {
        id: sem1Id,
        userId: cred.user.uid,
        universityId: uniProfile.id,
        semesterNumber: 3,
        name: "Autumn Quarter (Year 2)",
        program: "Computer Science",
        description: "Systems programming, algorithms, and core theory",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const sem2: SemesterProfile = {
        id: sem2Id,
        userId: cred.user.uid,
        universityId: uniProfile.id,
        semesterNumber: 4,
        name: "Winter Quarter (Year 2)",
        program: "Computer Science",
        description: "Databases, distributed systems, and networks",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "semesterProfiles", sem1Id), sem1);
      await setDoc(doc(db, "semesterProfiles", sem2Id), sem2);

      // Add subjects
      const sub1Id = `sub-${Date.now()}-1`;
      const sub2Id = `sub-${Date.now()}-2`;
      const sub3Id = `sub-${Date.now()}-3`;

      const sub1: SubjectProfile = {
        id: sub1Id,
        userId: cred.user.uid,
        semesterId: sem2Id,
        universityId: uniProfile.id,
        name: "Database Systems",
        courseCode: "CS 145",
        description: "Relational database concepts, normalization, query optimization, ACID transactions, and storage.",
        learningObjectives: [
          "Master Boyce-Codd (BCNF) and Third Normal Form (3NF) decomposition",
          "Analyze query execution plans and B+ Tree indexing performance",
          "Implement concurrency control mechanisms and two-phase locking",
        ],
        topics: ["Database Normalization", "Query Optimization", "Concurrency Control", "Storage Engines"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const sub2: SubjectProfile = {
        id: sub2Id,
        userId: cred.user.uid,
        semesterId: sem2Id,
        universityId: uniProfile.id,
        name: "Operating Systems Principles",
        courseCode: "CS 140",
        description: "Virtual memory, process scheduling, synchronization primitives, file systems.",
        learningObjectives: [
          "Understand virtual memory paging and TLB caching",
          "Implement lock-free synchronization primitives",
        ],
        topics: ["Virtual Memory", "Deadlock Prevention", "File System Inodes"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const sub3: SubjectProfile = {
        id: sub3Id,
        userId: cred.user.uid,
        semesterId: sem1Id,
        universityId: uniProfile.id,
        name: "Design and Analysis of Algorithms",
        courseCode: "CS 161",
        description: "Divide-and-conquer, dynamic programming, graph algorithms, NP-completeness.",
        learningObjectives: [
          "Prove asymptotic complexity bounds using master theorem",
          "Formulate dynamic programming recurrence relations",
        ],
        topics: ["Dynamic Programming", "Dijkstra & A* Search", "Network Flow"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "subjectProfiles", sub1Id), sub1);
      await setDoc(doc(db, "subjectProfiles", sub2Id), sub2);
      await setDoc(doc(db, "subjectProfiles", sub3Id), sub3);

      setActiveSemesterId(sem2Id);
      setActiveSubjectId(sub1Id);
      setNeedsOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const activeSemester = semesters.find((s) => s.id === activeSemesterId) || semesters[0] || null;
  const activeSubject = subjects.find((s) => s.id === activeSubjectId) || subjects[0] || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        universityProfile,
        semesters,
        subjects,
        activeSemester,
        activeSubject,
        isLoading,
        needsOnboarding,
        login,
        register,
        logout,
        resetPassword,
        saveUniversityProfile,
        addSemester,
        updateSemester,
        deleteSemester,
        addSubject,
        updateSubject,
        deleteSubject,
        setActiveSemesterId,
        setActiveSubjectId,
        setNeedsOnboarding,
        loginAsDemoStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
