import { useState } from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../lib/firebase";
import api from "../lib/api";

export default function Login() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      console.log("🚀 Запускаем Google авторизацию...");
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");

      const result = await signInWithPopup(auth, provider);
      console.log("✅ Popup вернул результат");

      const idToken = await result.user.getIdToken();
      console.log("✅ idToken получен");

      // Получаем CSRF cookie
      console.log("🔐 Получаем CSRF cookie...");
      await api.get("/sanctum/csrf-cookie");

      console.log("📤 Отправляем на Laravel...");
      const response = await api.post("/api/auth/google", { idToken });
      console.log("✅ Laravel ответил:", response.data);

      // Токен теперь в httpOnly cookie автоматически!
      console.log("✅ Токен сохранён в httpOnly cookie");

      console.log("➡️ Редирект на /admin");
      window.location.href = "/admin";
    } catch (error: any) {
      console.error("❌ Ошибка:", error);

      if (error.code === "auth/popup-closed-by-user") {
        setError("Вы закрыли окно входа");
      } else if (error.code === "auth/cancelled-popup-request") {
        setLoading(false);
        return;
      } else {
        setError(
          error.response?.data?.error || error.message || "Ошибка входа"
        );
      }

      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "50px", textAlign: "center" }}>
      <h1>🔐 Вход в защищённую админ-панель</h1>

      <button
        onClick={handleGoogleLogin}
        disabled={loading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
          backgroundColor: loading ? "#ccc" : "#4285f4",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        {loading ? "Загрузка..." : "Войти через Google"}
      </button>

      {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}
    </div>
  );
}
