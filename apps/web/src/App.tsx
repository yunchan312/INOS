import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "@/router";
import { useMe } from "@/hooks/useMe";
import { useAuthStore } from "@/stores/auth-store";

// user는 localStorage에 저장되지 않으므로, 새로고침 후 토큰만 있는 상태에서
// /users/me로 스토어를 다시 채운다 (감상·자체 발제의 본인 판별이 여기에 의존)
function AuthUserSync() {
  const meQuery = useMe();
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (meQuery.data) setUser(meQuery.data);
  }, [meQuery.data, setUser]);

  return null;
}

export default function App() {
  return (
    <>
      <AuthUserSync />
      <RouterProvider router={router} />
    </>
  );
}
