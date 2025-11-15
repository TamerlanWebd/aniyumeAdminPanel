import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "../../lib/api";

export default function Admin() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      console.log("🔍 Проверяем права админа...");
      const response = await api.get("/api/admin-check");
      console.log("✅ Admin check response:", response.data);

      if (response.data.is_admin) {
        setIsAdmin(true);
        setUser(response.data.user);
      } else {
        console.log("❌ Не админ, редирект на login");
        router.push("/login");
      }
    } catch (error: any) {
      console.error("❌ Ошибка проверки админа:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (error) {
      console.error("Ошибка logout:", error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h2>Загрузка...</h2>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div style={{ padding: "50px" }}>
      <h1>✅ Админ панель</h1>
      <p>Добро пожаловать, {user?.name}!</p>
      <img
        src={user?.avatar}
        alt="Avatar"
        style={{ borderRadius: "50%", width: "100px" }}
      />

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleLogout}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Выйти
        </button>
      </div>

      <div style={{ marginTop: "30px" }}>
        <h3>Токен (localStorage):</h3>
        <code
          style={{
            display: "block",
            padding: "10px",
            background: "#f5f5f5",
            wordBreak: "break-all",
          }}
        >
          {typeof window !== "undefined"
            ? localStorage.getItem("token")
            : "N/A"}
        </code>
      </div>
    </div>
  );
}
