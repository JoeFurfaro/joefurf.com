// Each page has its own accent colour (slot names: green = pine, teal = spruce, ochre = moss, brick = cedar).
export const PAGES = [
  { label: "me", path: "/", color: "green" },
  { label: "blog", path: "/blog", color: "brick" },
  { label: "roadmap", path: "/roadmap", color: "ochre" },
  { label: "shop", path: "/shop", color: "teal" },
];

export const pageFor = (pathname) => {
  if (pathname.startsWith("/article")) return PAGES[1];
  if (pathname.startsWith("/admin")) return PAGES[3];
  return PAGES.find((p) => p.path !== "/" && pathname.startsWith(p.path)) ?? PAGES[0];
};
