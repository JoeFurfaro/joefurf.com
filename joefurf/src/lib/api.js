import { useCallback, useEffect, useState } from "react";

export async function api(path, { method = "GET", body, form } = {}) {
  const res = await fetch("/api" + path, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : form,
    credentials: "same-origin",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || "Something went wrong");
    err.status = res.status;
    throw err;
  }
  return data;
}

// Fetches `path` on mount (and when it changes). `setData` allows optimistic updates from mutations.
export function useApi(path) {
  const [state, setState] = useState({ data: null, error: null, loading: true });

  const reload = useCallback(() => {
    if (!path) return;
    setState((s) => ({ ...s, loading: true }));
    api(path)
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => setState({ data: null, error, loading: false }));
  }, [path]);

  useEffect(reload, [reload]);

  const setData = useCallback((data) => setState({ data, error: null, loading: false }), []);
  return { ...state, reload, setData };
}
