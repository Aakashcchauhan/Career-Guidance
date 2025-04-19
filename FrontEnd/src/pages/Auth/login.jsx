import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useFirebase } from "../../context/FirebaseContext";
import { AuthContext } from "../../context/AuthContext";

export default function LoginForm({ switchToSignup }) {
  const { login } = React.useContext(AuthContext);
  const { signInWithEmail, signInWithGoogle } = useFirebase();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmail(
        loginData.email,
        loginData.password
      );
      const user = userCredential.user;
      const token = await user.getIdToken();
      login(user.email, token);
      navigate("/");
    } catch (error) {
      console.error("Login Error:", error.message);
      alert(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      const user = result.user;
      const token = await user.getIdToken();
      login(user.email, token);
      navigate("/");
    } catch (error) {
      console.error("Google Login Error:", error.message);
      alert(error.message);
    }
  };
  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
        <p className="text-gray-600 mt-2">Sign in to access your account</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label
            htmlFor="login-email"
            className="text-sm font-medium text-gray-700 block"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              id="login-email"
              name="email"
              type="email"
              required
              value={loginData.email}
              onChange={handleChange}
              className="pl-10 block w-full rounded-md border border-gray-300 py-2"
              placeholder="name@example.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="login-password"
            className="text-sm font-medium text-gray-700 block"
          >
            Password
          </label>
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              value={loginData.password}
              onChange={handleChange}
              className="pl-10 block w-full rounded-md border border-gray-300 py-2"
              placeholder="Enter your password"
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

        <div className="flex items-center justify-end">
          <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Sign In
        </button>
      </form>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
      <button onClick={handleGoogleLogin} className="cursor-pointer bg-gradient-to-r from-red-600 via-red-500 to-red-400 text-white font-semibold px-6 py-2 rounded-md shadow-md hover:opacity-90 transition">
  Login with Google
</button>
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={switchToSignup}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
