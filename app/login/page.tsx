"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const roles = ["breeder", "fighter", "seller", "shipper", "buyer"];

export default function AuthPage() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { document.head.removeChild(link); };
  }, []);

  const [mode, setMode] = useState<"login" | "signup">("login");
  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  // Signup state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupRole, setSignupRole] = useState(roles[0]);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("token", data.token);
      router.push("/");
    } catch (err: unknown) {
      const error = err as Error;
      setLoginError(error.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError("");
    setSignupSuccess("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: signupName, email: signupEmail, password: signupPassword, role: signupRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      setSignupSuccess("Account created! You can now log in.");
      setMode("login");
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupRole(roles[0]);
    } catch (err: unknown) {
      const error = err as Error;
      setSignupError(error.message);
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-green-100 via-blue-50 to-amber-50 py-8">
      {/* Image with overlayed script font text */}
      <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto" style={{height: '40vh', maxHeight: 300}}>
        <img
          src="/gamefowl-farm.jpg"
          alt="Gamefowl farm at sunrise"
          className="object-cover w-full h-full rounded-xl shadow-lg"
          style={{width: '100%', height: '100%'}}
        />
        <div className="absolute bottom-3 right-4 bg-green-900/70 px-4 py-2 rounded-lg shadow-lg">
          <span
            className="text-green-100 text-2xl drop-shadow"
            style={{ fontFamily: 'Dancing Script, cursive', letterSpacing: '1px', textShadow: '1px 1px 4px #222' }}
          >
            palahian.com
          </span>
        </div>
      </div>
      {/* Centered form with earth-tone glassmorphism */}
      <div className="w-full max-w-md mx-4 mt-6 p-6 sm:p-8 rounded-xl shadow-xl backdrop-blur-md bg-green-50/90 border border-green-200 flex flex-col items-center">
        <div className="flex justify-center mb-6 w-full">
          <button
            className={`px-4 py-2 font-semibold rounded-l ${mode === "login" ? "bg-green-700 text-white" : "bg-green-200 text-green-900"}`}
            onClick={() => setMode("login")}
            type="button"
          >
            Login
          </button>
          <button
            className={`px-4 py-2 font-semibold rounded-r ${mode === "signup" ? "bg-green-700 text-white" : "bg-green-200 text-green-900"}`}
            onClick={() => setMode("signup")}
            type="button"
          >
            Register
          </button>
        </div>
        {mode === "login" ? (
          <form onSubmit={handleLogin} className="w-full">
            <h2 className="text-xl font-bold mb-6 text-center text-green-900">Login</h2>
            {loginError && <div className="mb-4 text-red-900 bg-red-200 rounded p-2 text-center">{loginError}</div>}
            <div className="mb-4">
              <label className="block mb-1 font-medium text-green-900">Email</label>
              <input
                type="email"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-green-400 bg-white/90 text-green-900"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block mb-1 font-medium text-green-900">Password</label>
              <input
                type="password"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-green-400 bg-white/90 text-green-900"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-green-700 text-white py-2 rounded font-semibold hover:bg-green-800 transition"
              disabled={loginLoading}
            >
              {loginLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="w-full">
            <h2 className="text-xl font-bold mb-6 text-center text-green-900">Register</h2>
            {signupError && <div className="mb-4 text-red-900 bg-red-200 rounded p-2 text-center">{signupError}</div>}
            {signupSuccess && <div className="mb-4 text-green-900 bg-green-200 rounded p-2 text-center">{signupSuccess}</div>}
            <div className="mb-4">
              <label className="block mb-1 font-medium text-green-900">Name</label>
              <input
                type="text"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-green-400 bg-white/90 text-green-900"
                value={signupName}
                onChange={e => setSignupName(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-green-900">Email</label>
              <input
                type="email"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-green-400 bg-white/90 text-green-900"
                value={signupEmail}
                onChange={e => setSignupEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1 font-medium text-green-900">Password</label>
              <input
                type="password"
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-green-400 bg-white/90 text-green-900"
                value={signupPassword}
                onChange={e => setSignupPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <label className="block mb-1 font-medium text-green-900">Role</label>
              <select
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring focus:border-green-400 bg-white/90 text-green-900"
                value={signupRole}
                onChange={e => setSignupRole(e.target.value)}
                required
              >
                {roles.map(r => (
                  <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-green-700 text-white py-2 rounded font-semibold hover:bg-green-800 transition"
              disabled={signupLoading}
            >
              {signupLoading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
} 