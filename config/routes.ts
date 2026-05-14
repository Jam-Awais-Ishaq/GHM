export const routes = {
  home: "/",
  map: "/map",
  restaurant: (id: string) => `/restaurant/${id}`,
  hotDeals: "/hot-deals",
  community: "/community",
  saved: "/saved",
  login: "/login",
} as const;
