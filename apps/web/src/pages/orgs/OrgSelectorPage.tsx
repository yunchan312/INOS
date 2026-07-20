import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useMe } from "@/hooks/useMe";
import { useMyOrgs } from "@/hooks/useMyOrgs";
import { useAuthStore } from "@/stores/auth-store";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/Skeleton";
import { Button } from "@/components/Button";
import { apiClient } from "@/api/client";

function OrgRequestForm() {
  const [open, setOpen] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const handleSend = async () => {
    if (!orgName.trim()) return;
    setStatus("sending");
    try {
      await apiClient.post("/auth/request-org", {
        orgName: orgName.trim(),
        message: message.trim() || undefined,
      });
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <p className="text-sm text-muted text-center">
        신청이 전송됐어요. 관리자가 확인 후 초대장을 보내드릴게요.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-[13px] font-medium text-muted border-b border-muted hover:text-ink hover:border-ink pb-0.5 transition-colors"
      >
        오가니제이션 생성 신청
      </button>
    );
  }

  return (
    <div className="border-2 border-ink bg-surface p-4 space-y-3 w-full">
      <p className="text-sm font-semibold text-ink">오가니제이션 생성 신청</p>
      <p className="text-xs text-muted">
        신청 내용이 관리자에게 전달돼요. 확인 후 초대장을 보내드릴게요.
      </p>
      <input
        type="text"
        value={orgName}
        onChange={(e) => setOrgName(e.target.value.slice(0, 80))}
        maxLength={80}
        placeholder="오가니제이션 이름 (필수)"
        className="input-underline text-sm"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="모임 목적, 인원 등을 간략히 적어주세요 (선택)"
        rows={3}
        className="input-underline text-sm resize-none"
      />
      {status === "error" && (
        <p className="text-xs text-danger">
          전송에 실패했어요. 다시 시도해주세요.
        </p>
      )}
      <div className="flex gap-2">
        <Button
          variant="primary"
          size="sm"
          loading={status === "sending"}
          disabled={!orgName.trim()}
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
    <div className="min-h-dvh bg-paper flex flex-col">
      <Header />
      <main className="mx-auto max-w-3xl w-full flex-1 px-6 pt-10 page-enter">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          01 — 내 오가니제이션
        </p>
        <h2 className="mt-3 text-[clamp(28px,4vw,40px)] font-extrabold tracking-tight">
          {meQuery.data?.nickname
            ? `${meQuery.data.nickname}님, 이어가세요.`
            : "이어가세요."}
        </h2>

        <section className="mt-8">
          {orgsQuery.isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-20" />
              <Skeleton className="h-20" />
            </div>
          )}

          {orgsQuery.data && orgsQuery.data.length === 0 && (
            <EmptyState
              title="아직 속한 오가니제이션이 없어요"
              description="초대받은 오가니제이션만 접근할 수 있어요."
            />
          )}

          {orgsQuery.data && orgsQuery.data.length > 0 && (
            <div className="border-t-2 border-ink">
              {orgsQuery.data.map((org) => (
                <Link
                  key={org.id}
                  to={`/orgs/${org.id}`}
                  className="grid grid-cols-[minmax(0,1fr)_auto] gap-4 items-center px-5 py-7 border-b-2 border-ink cursor-pointer transition-colors hover:bg-point/25"
                >
                  <div className="min-w-0">
                    <p className="text-[22px] font-bold">{org.name}</p>
                    {org.description && (
                      <p className="mt-1.5 text-sm text-muted line-clamp-1">
                        {org.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <p className="text-[13px] font-semibold">
                        {org.memberCount}명
                      </p>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted whitespace-nowrap">
                        {org.myRole === "OWNER" ? "소유자" : "멤버"}
                      </p>
                    </div>
                    <span aria-hidden="true" className="text-xl">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {orgsQuery.data && (
            <div className="mt-10">
              <OrgRequestForm />
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
