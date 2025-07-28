import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth, db } from "../firebase/config"; // Corrected import path
import { toast, ToastContainer } from "react-toastify"; // We need ToastContainer as well
import "react-toastify/dist/ReactToastify.css"; // Import the CSS for toastify
import { setDoc, doc } from "firebase/firestore"; // Corrected import path
import Image from "next/image"; // Use the optimized Next.js Image component

export default function SignInWithGoogle() {
  
  async function googleLogin() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    try {
      // Sign out any existing user to allow account selection
      await signOut(auth);

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        // Create a document in the 'Users' collection with the user's UID as the document ID
        await setDoc(doc(db, "Users", user.uid), {
          email: user.email,
          firstName: user.displayName, // Google provides the full name here
          photo: user.photoURL,
          lastName: "", // This will be empty as Google doesn't separate names
        });

        // You don't need toast here, as the page will redirect immediately.
        // The redirection will be handled by your login/signup page's auth state listener.
        // For now, we can keep it for debugging.
        toast.success("User logged in Successfully", {
          position: "top-center",
        });

        // The redirect will be handled automatically by the auth state change,
        // but an explicit push is fine too. Let's use the router for this.
        // window.location.href is not the recommended way in Next.js.
        // For simplicity in this component, we'll leave it, but a router is better.
        window.location.href = "/profile"; 
      }
    } catch (error) {
      console.error("Error during Google sign-in:", error);
      toast.error(error.message, {
        position: "bottom-center",
      });
    }
  }

  return (
    <div className="google-signin-container">

      <p className="google-signin-btn9">-- Sign In With --</p>
      <button className="google-signin-btn" onClick={googleLogin}>
        <div className="logo-content9">
        <Image src="/google.png" alt="Google icon" width={24} height={24} />
        <span>Google</span>
      </div>
      </button>
    </div>
  );
}
