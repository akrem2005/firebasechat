import React, { useState, useEffect } from "react";
import {
  Button,
  TextField,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  onSnapshot,
  orderBy,
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

const App = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, loading, error] = useAuthState(auth);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const openSignUp = () => {
    setIsSignUpOpen(true);
  };

  const closeSignUp = () => {
    setIsSignUpOpen(false);
  };

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      closeSignUp();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSignOut = () => {
    signOut(auth);
  };

  const handleMessageSubmit = async (e) => {
    e.preventDefault();

    try {
      const docRef = await addDoc(collection(db, "messages"), {
        text: message,
        timestamp: new Date(),
        userId: user.uid,
      });
      setMessage("");
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("timestamp"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setMessages(data);
    });

    return () => unsubscribe();
  }, [db]);

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#232932",
  };

  const formStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    backgroundColor: "#cbd0d9",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
  };

  const inputStyle = {
    borderRadius: "20px",
    padding: "10px",
    width: "250px",
    outline: "none",
    border: "none",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  };

  const buttonStyle = {
    borderRadius: "20px",
    padding: "10px 90px",
    backgroundColor: "#4caf50",
    color: "#ffffff",
    border: "none",
    outline: "none",
    cursor: "pointer",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  };
  const buttonStyle2 = {
    borderRadius: "20px",
    padding: "10px 90px",
    backgroundColor: "#cbd0d9",
    border: "2px solid #4caf50",
    color: "#4caf50",
    outline: "none",
    cursor: "pointer",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  };

  return (
    <div style={containerStyle}>
      {user ? (
        <div>
          <p>Welcome, {user.email}!</p>
          <button style={buttonStyle} onClick={handleSignOut}>
            Sign Out
          </button>
        </div>
      ) : (
        <div style={formStyle}>
          <input
            style={inputStyle}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={inputStyle}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button style={buttonStyle} onClick={handleSignIn}>
            Sign In
          </button>
          <button style={buttonStyle2} onClick={openSignUp}>
            Sign Up
          </button>
        </div>
      )}

      <Dialog open={isSignUpOpen} onClose={closeSignUp}>
        <DialogTitle>Sign Up</DialogTitle>
        <DialogContent>
          <form>
            <TextField
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button
              onClick={handleSignUp}
              style={buttonStyle}
              variant="contained"
              color="primary"
            >
              Sign Up
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {user && (
        <div style={formStyle}>
          <form onSubmit={handleMessageSubmit}>
            <TextField
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button type="submit" variant="contained" color="primary">
              Send
            </Button>
          </form>
        </div>
      )}

      {messages.map((msg) => (
        <div key={msg.id}>
          <p>{msg.text}</p>
          <p>Posted by: {msg.userId}</p>
          <p>Timestamp: {msg.timestamp.toDate().toString()}</p>
        </div>
      ))}
    </div>
  );
};

export default App;
