import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Badge, Button, ErrorText, Field, Input, Loading, TextArea } from "../components/ui";
import { api, useApi } from "../lib/api";
import { centsToDollars, parseDollars } from "../lib/money";
import { preparePhoto } from "../lib/resizeImage";

export const Route = createFileRoute("/admin/listings/$id")({
  component: RouteComponent,
});

const Photos = ({ listing, onChange }) => {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(null);
  const [error, setError] = useState(null);

  const upload = async (files) => {
    setError(null);
    let latest = listing;
    try {
      for (const [i, file] of [...files].entries()) {
        setProgress(`Uploading ${i + 1} of ${files.length}…`);
        const photo = await preparePhoto(file);
        const form = new FormData();
        form.append("full", photo.full, "full.jpg");
        form.append("thumb", photo.thumb, "thumb.jpg");
        form.append("width", photo.width);
        form.append("height", photo.height);
        latest = await api(`/admin/listings/${listing.id}/photos`, { method: "POST", form });
        onChange(latest);
      }
    } catch (err) {
      setError(err);
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const reorder = async (from, to) => {
    const ids = listing.photos.map((p) => p.id);
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    try {
      onChange(await api(`/admin/listings/${listing.id}/photos/order`, { method: "PUT", body: { ids } }));
    } catch (err) {
      setError(err);
    }
  };

  const remove = async (photo) => {
    setError(null);
    try {
      onChange(await api(`/admin/photos/${photo.id}`, { method: "DELETE" }));
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-lg text-text-main font-medium">Photos</h2>
      {listing.photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {listing.photos.map((p, i) => (
            <div key={p.id} className="flex flex-col gap-1">
              <div className="relative aspect-square overflow-hidden rounded-md border border-tag-border bg-tag-background">
                <img src={p.thumbUrl} alt="" className="h-full w-full object-cover" />
                {i === 0 && (
                  <span className="absolute top-1 left-1">
                    <Badge>cover</Badge>
                  </span>
                )}
              </div>
              <div className="flex flex-row justify-between text-sm">
                <div className="flex gap-3">
                  <button disabled={i === 0} onClick={() => reorder(i, i - 1)} className="text-text-secondary hover:text-text-main disabled:opacity-30 cursor-pointer">
                    ←
                  </button>
                  <button
                    disabled={i === listing.photos.length - 1}
                    onClick={() => reorder(i, i + 1)}
                    className="text-text-secondary hover:text-text-main disabled:opacity-30 cursor-pointer"
                  >
                    →
                  </button>
                  {i !== 0 && (
                    <button onClick={() => reorder(i, 0)} className="text-text-secondary hover:text-text-main cursor-pointer">
                      make cover
                    </button>
                  )}
                </div>
                <button onClick={() => remove(p)} className="text-closed hover:underline cursor-pointer">
                  delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files.length && upload(e.target.files)} />
      <Button onClick={() => inputRef.current.click()} disabled={!!progress} className="self-start">
        {progress ?? "Add photos"}
      </Button>
      <ErrorText error={error} />
    </div>
  );
};

const Details = ({ listing, onChange }) => {
  const [form, setForm] = useState({
    title: listing.title,
    description: listing.description,
    details: listing.details,
    price: centsToDollars(listing.price_cents || null),
    offerShipping: listing.shipping_cents !== null,
    shipping: centsToDollars(listing.shipping_cents),
    pickup: listing.pickup_available,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const set = (key) => (e) => {
    setSaved(false);
    setForm({ ...form, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  };

  const save = async (status) => {
    setError(null);
    const price_cents = form.price === "" ? 0 : parseDollars(form.price);
    const shipping_cents = form.offerShipping ? parseDollars(form.shipping) : null;
    if (price_cents === null) return setError(new Error("Price should look like 120 or 120.50"));
    if (form.offerShipping && shipping_cents === null) return setError(new Error("Shipping should look like 25 or 24.50"));

    setSaving(true);
    try {
      const updated = await api(`/admin/listings/${listing.id}`, {
        method: "PATCH",
        body: {
          title: form.title,
          description: form.description,
          details: form.details,
          price_cents,
          shipping_cents,
          pickup_available: form.pickup,
          ...(status ? { status } : {}),
        },
      });
      onChange(updated);
      setSaved(true);
    } catch (err) {
      setError(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Field label="Title">
        <Input value={form.title} onChange={set("title")} />
      </Field>
      <Field label="Description" hint="The story of the board: wood species, what it's good for, anything special about it.">
        <TextArea rows={4} value={form.description} onChange={set("description")} />
      </Field>
      <Field label="Details" hint="One per line, e.g. dimensions, weight, finish, care.">
        <TextArea rows={4} value={form.details} onChange={set("details")} placeholder={"12\" × 18\" × 1.5\"\nBlack walnut and maple\nFinished with mineral oil and beeswax"} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Price (CAD)">
          <Input inputMode="decimal" value={form.price} onChange={set("price")} placeholder="120" />
        </Field>
        <div className="flex flex-col gap-2">
          <label className="flex flex-row items-center gap-2 text-sm font-medium text-text-main">
            <input type="checkbox" className="accent-text-main" checked={form.offerShipping} onChange={set("offerShipping")} />
            Offer shipping (Canada)
          </label>
          {form.offerShipping && <Input inputMode="decimal" value={form.shipping} onChange={set("shipping")} placeholder="Shipping cost, e.g. 25" />}
          <label className="flex flex-row items-center gap-2 text-sm font-medium text-text-main">
            <input type="checkbox" className="accent-text-main" checked={form.pickup} onChange={set("pickup")} />
            Offer free local pickup
          </label>
        </div>
      </div>
      <ErrorText error={error} />
      <div className="flex flex-row flex-wrap gap-2 items-center">
        <Button onClick={() => save()} disabled={saving}>
          Save
        </Button>
        {listing.status === "draft" && (
          <Button variant="primary" onClick={() => save("available")} disabled={saving}>
            Save & publish
          </Button>
        )}
        {listing.status === "available" && (
          <>
            <Button onClick={() => save("draft")} disabled={saving}>
              Unpublish
            </Button>
            <Button onClick={() => save("sold")} disabled={saving} title="For boards sold in person">
              Mark sold
            </Button>
          </>
        )}
        {listing.status === "sold" && (
          <Button onClick={() => save("available")} disabled={saving} title="e.g. after a refund">
            Relist
          </Button>
        )}
        {saved && <span className="text-sm text-text-secondary">Saved ✓</span>}
      </div>
    </div>
  );
};

function RouteComponent() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data: listing, error, loading, setData } = useApi(`/admin/listings/${id}`);
  const [deleteError, setDeleteError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const remove = async () => {
    try {
      await api(`/admin/listings/${id}`, { method: "DELETE" });
      navigate({ to: "/admin" });
    } catch (err) {
      setDeleteError(err);
    }
  };

  if (loading && !listing) return <Loading />;
  if (error) return <ErrorText error={error} />;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-row justify-between items-start gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-medium text-text-main text-3xl">{listing.title}</h1>
          {listing.status !== "draft" && (
            <Link to="/shop/$slug" params={{ slug: listing.slug }} className="text-sm text-hyperlink hover:underline">
              view in shop →
            </Link>
          )}
        </div>
        <Badge tone={listing.status === "available" ? "green" : "slate"}>{listing.reserved ? "in checkout" : listing.status}</Badge>
      </div>
      {listing.order_id && (
        <Link to="/admin/orders/$id" params={{ id: String(listing.order_id) }} className="text-hyperlink hover:underline">
          View order #{listing.order_id} →
        </Link>
      )}
      <Photos listing={listing} onChange={setData} />
      <Details listing={listing} onChange={setData} />
      {!listing.order_id && (
        <div className="flex flex-col gap-2 pt-4 border-t border-tag-border">
          {confirmDelete ? (
            <div className="flex flex-row gap-2 items-center">
              <span className="text-sm text-text-main">Delete this board and its photos for good?</span>
              <Button variant="danger" onClick={remove}>
                Yes, delete
              </Button>
              <Button onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </div>
          ) : (
            <Button variant="danger" onClick={() => setConfirmDelete(true)} className="self-start">
              Delete board
            </Button>
          )}
          <ErrorText error={deleteError} />
        </div>
      )}
    </div>
  );
}
