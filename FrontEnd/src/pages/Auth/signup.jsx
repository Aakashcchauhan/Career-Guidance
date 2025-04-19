import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useFirebase } from "../../context/FirebaseContext";
import { AuthContext } from "../../context/AuthContext";

export default function SignupForm({ switchToLogin }) {
  const { signup } = React.useContext(AuthContext);
  const { signUpWithEmail, signInWithGoogle } = useFirebase();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [signupData, setSignupData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupData({ ...signupData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signUpWithEmail(
        signupData.email,
        signupData.password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();
      signup(user.email, token);
      navigate("/");
    } catch (error) {
      console.error("Signup Error:", error.message);
      alert(error.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      const token = await user.getIdToken();
      signup(user.email, token);
      navigate("/");
    } catch (error) {
      console.error("Google Signup Error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
        <p className="text-gray-600 mt-2">Sign up to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="signup-email"
            className="text-sm font-medium text-gray-700 block"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              id="signup-email"
              name="email"
              type="email"
              required
              value={signupData.email}
              onChange={handleChange}
              className="pl-10 block w-full rounded-md border border-gray-300 py-2"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="signup-password"
            className="text-sm font-medium text-gray-700 block"
          >
            Password
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={signupData.password}
              onChange={handleChange}
              className="pl-10 block w-full rounded-md border border-gray-300 py-2"
              placeholder="Create a password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Create Account
        </button>
      </form>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
      <button onClick={handleGoogleSignup} className="cursor-pointer bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white font-semibold px-6 py-2 rounded-md shadow-md hover:opacity-90 transition">
  Signup with Google
</button>
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <button
            type="button"
            onClick={switchToLogin}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
