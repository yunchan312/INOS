import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMe } from "@/hooks/useMe";
import { useMyOrgs } from "@/hooks/useMyOrgs";
import { useAuthStore } from "@/stores/auth-store";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { Button } from "@/components/Button";
import { apiClient } from "@/api/client";

function OrgRequestForm() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const handleSend = async () => {
    setStatus("sending");
    try {
      await apiClient.post("/auth/request-org", {
        message: message.trim() || undefined,
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <p className="text-sm text-neutral-500 text-center">
        신청이 전송됐어요. 관리자가 확인 후 초대장을 보내드릴게요.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-neutral-400 hover:text-neutral-600 underline underline-offset-2 transition-colors"
      >
        오가니제이션 생성 신청
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-3 w-full">
      <p className="text-sm font-medium text-neutral-700">
        오가니제이션 생성 신청
      </p>
      <p className="text-xs text-neutral-500">
        신청 내용이 관리자에게 전달돼요. 확인 후 초대장을 보내드릴게요.
      </p>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="오가니제이션 이름, 목적 등을 간략히 적어주세요 (선택)"
        rows={3}
        className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-400 focus:outline-none"
      />
      {status === "error" && (
        <p className="text-xs text-red-500">
          전송에 실패했어요. 다시 시도해주세요.
        </p>
      )}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          loading={status === "sending"}
          onClick={handleSend}
        >
          신청하기
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setOpen(false);
            setStatus("idle");
          }}
        >
          취소
        </Button>
      </div>
    </div>
  );
}

export default function OrgSelectorPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const meQuery = useMe();
  const orgsQuery = useMyOrgs();

  useEffect(() => {
    if (!isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (meQuery.data) useAuthStore.getState().setUser(meQuery.data);
  }, [meQuery.data]);

  return (
    <div className="min-h-dvh bg-neutral-50">
      <Header />
      <main className="mx-auto max-w-3xl px-4 pt-6 pb-safe page-enter">
        <h2 className="text-xl font-semibold text-neutral-900">
          내 오가니제이션
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          {meQuery.data?.nickname
            ? `${meQuery.data.nickname}님, 이어가세요.`
            : ""}
        </p>

        <section className="mt-6 space-y-3 flex flex-col">
          {orgsQuery.isLoading &&
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}

          {orgsQuery.data && orgsQuery.data.length === 0 && (
            <EmptyState
              title="아직 속한 오가니제이션이 없어요"
              description="초대받은 오가니제이션만 접근할 수 있어요."
            />
          )}

          {orgsQuery.data?.map((org) => (
            <Link key={org.id} to={`/orgs/${org.id}`}>
              <Card interactive>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">{org.name}</p>
                    {org.description && (
                      <p className="mt-1 text-sm text-neutral-500 line-clamp-1">
                        {org.description}
                      </p>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {org.memberCount}명 ·{" "}
                    {org.myRole === "OWNER" ? "소유자" : "멤버"}
                  </div>
                </div>
              </Card>
            </Link>
          ))}

          {orgsQuery.data && (
            <div className="pt-4 flex justify-center">
              <OrgRequestForm />
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
