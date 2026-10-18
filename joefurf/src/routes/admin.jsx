import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { PageLayout } from "../components/PageLayout";
import { Button, ErrorText, Field, Input, Loading } from "../components/ui";
import { api, useApi } from "../lib/api";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
});

const Login = ({ onLogin }) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api("/admin/login", { method: "POST", body: { password } });
      onLogin();
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 max-w-sm">
      <h1 className="font-medium text-text-main text-3xl">Admin</h1>
      <Field label="Password">
        <Input type="password" autoComplete="current-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <Button variant="primary" type="submit" disabled={submitting || !password} className="self-start">
        Log in
      </Button>
      <ErrorText error={error} />
    </form>
  );
};

function RouteComponent() {
  const { data, loading, reload } = useApi("/admin/me");

  const logout = async () => {
    await api("/admin/logout", { method: "POST" });
    reload();
  };

  return (
    <PageLayout>
      {loading && !data && <Loading />}
      {data && !data.admin && <Login onLogin={reload} />}
      {data?.admin && (
        <>
          <div className="flex flex-row justify-between items-center text-sm">
            <div className="flex flex-row gap-4">
              <Link to="/admin" className="text-text-secondary hover:underline" activeOptions={{ exact: true }}>
                admin home
              </Link>
              <Link to="/admin/feedback" className="text-text-secondary hover:underline">
                blog feedback
              </Link>
            </div>
            <button onClick={logout} className="text-text-secondary hover:underline cursor-pointer">
              log out
            </button>
          </div>
          <Outlet />
        </>
      )}
    </PageLayout>
  );
}
