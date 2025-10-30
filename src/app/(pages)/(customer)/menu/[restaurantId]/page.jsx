"use client";

import { addToCart, openCart } from "@/app/store/cartSlice"; // Explicitly import openCart
import CartDrawer from "@/components/CartDrawer";
import api from "@/lib/axios";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Header } from "../../components/Header";
import { Badge } from "@/components/ui/badge";

/**
 * RestaurantMenuPage (improved UI/UX)
 */

export default function RestaurantMenuPage() {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const router = useRouter();

  // New state for hydration safety
  const [isClient, setIsClient] = useState(false);

  // Menu slice (you already used this; keep using it if available)
  const menuState = useSelector((s) => s.menu);
  const {
    restaurant: storeRestaurant,
    categories: storeCategories,
    menuItems: storeMenuItems,
    status: storeStatus,
  } = menuState || {};

  // Cart open
  const open = useSelector((s) => s.cart.open);
  const cartTotalQty = useSelector((s) => s.cart.totalQty);
  const cartTotalPrice = useSelector((s) => s.cart.totalPrice);

  // local states
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState("all");
  const [restaurant, setRestaurant] = useState(storeRestaurant || null);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("grid"); // or 'list'
  const [addingItemId, setAddingItemId] = useState(null);

  // refs for smooth scroll to sections
  const containerRef = useRef(null);
  const sectionRefs = useRef({}); // categoryId -> DOM node
  const tabsRef = useRef(null);

  // Prefer restaurant from store (you said you dispatch restaurant details elsewhere)

  // Fetch categories and menu items for customer view & set isClient
  useEffect(() => {
    setIsClient(true); // <-- FIX: Set true on mount for hydration safety

    let mounted = true;
    async function fetchData() {
      if (!restaurantId) return;
      setLoading(true);
      try {
        const [catRes, itemRes] = await Promise.all([
          api.get(`/category/customer/${restaurantId}`),
          api.get(`/menu-items/customer/${restaurantId}`),
        ]);
        if (!mounted) return;
        const cats = catRes.data.categories || [];
        const its = itemRes.data.menuItems || [];
        const rest = catRes.data.restaurant || null;

        if (rest) {
          setRestaurant(rest);
        }

        // Add synthetic "All" tab
        const withAll = [{ _id: "all", name: "All", description: "" }, ...cats];

        setCategories(withAll);
        setItems(its);
        // set default active category to first real category if exists else 'all'
        setActiveCat(withAll[0]?._id || "all");
      } catch (err) {
        console.error(err);
        toast.error("Failed to load menu. Please try again.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();

    return () => {
      mounted = false;
    };
  }, [restaurantId]);

  // grouped items by category id (including category objects)
  const grouped = useMemo(() => {
    const map = {};
    // include all categories (even if empty)
    (categories || []).forEach((c) => (map[c._id] = []));

    (items || []).forEach((m) => {
      const cid = m.category?._id || m.category || "uncategorized";
      if (!map[cid]) map[cid] = [];
      map[cid].push(m);
    });

    // map 'all' to full list
    map["all"] = items || [];

    return map;
  }, [categories, items]);

  // filtered items based on search + availability + category
  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list =
      activeCat === "all" ? grouped["all"] || [] : grouped[activeCat] || [];
    return list.filter((it) => {
      if (!q) return true;
      return (
        (it.name || "").toLowerCase().includes(q) ||
        (it.description || "").toLowerCase().includes(q) ||
        (it.category?.name || "").toLowerCase().includes(q)
      );
    });
  }, [query, activeCat, grouped]);

  // Add to cart (uses your redux action)
  const onAdd = async (item) => {
    if (!item.available) {
      toast.error("Item not available");
      return;
    }
    setAddingItemId(item._id);
    try {
      dispatch(
        addToCart({
          _id: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
        })
      );
      toast.success("Added to cart");
      // micro animation: briefly show check
      setTimeout(() => setAddingItemId(null), 700);
    } catch (err) {
      toast.error("Failed to add to cart");
      setAddingItemId(null);
    }
  };

  // scroll to category section smoothly and center tab under view
  const handleTabClick = (catId) => {
    setActiveCat(catId);
    // scroll tab into view
    const tabNode = document.getElementById(`tab-${catId}`);
    if (tabNode && tabsRef.current) {
      const left =
        tabNode.offsetLeft -
        tabsRef.current.offsetLeft -
        tabsRef.current.clientWidth / 2 +
        tabNode.clientWidth / 2;
      tabsRef.current.scrollTo({ left, behavior: "smooth" });
    }
    // scroll content to section
    const section = sectionRefs.current[catId];
    if (section && containerRef.current) {
      containerRef.current.scrollTo({
        top: section.offsetTop - containerRef.current.offsetTop - 12,
        behavior: "smooth",
      });
    }
  };

  // update active cat on scroll (throttled-ish)
  const onScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    let current = activeCat;
    // If user has explicitly chosen the "all" tab, don't auto-switch to
    // individual categories while scrolling. This prevents jumping from
    // "All" -> first category when the page scrolls past the header.
    if (activeCat === "all") return;

    for (const c of categories) {
      const s = sectionRefs.current[c._id];
      if (!s) continue;
      // Use 150px offset to make the detection more reliable
      if (s.offsetTop - containerRef.current.offsetTop - 150 <= scrollTop) {
        current = c._id;
      }
    }
    if (current !== activeCat) setActiveCat(current);
  };

  // small skeleton card
  const SkeletonCard = () => (
    <div className="animate-pulse bg-white rounded-2xl p-4 shadow-sm">
      <div className="h-36 bg-gray-100 rounded-md mb-3" />
      <div className="h-4 bg-gray-100 rounded w-3/5 mb-2" />
      <div className="h-3 bg-gray-100 rounded w-2/5" />
    </div>
  );

  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  /* ---------------- Presentational subcomponents ---------------- */

  const MenuItemCardGrid = ({ item }) => (
    <div className="w-full bg-white rounded-2xl p-4 flex flex-col shadow-sm">
      <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-50">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-fullflex items-center justify-center text-gray-300">
            No image
          </div>
        )}
      </div>

      <div className="mt-3 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-gray-900">{item.name}</h3>
          <div className="text-sm font-bold">Rs {item.price}</div>
        </div>
        <p className="text-sm text-gray-500 mt-2 line-clamp-3">
          {item.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex-1">
            <Badge className="px-4 py-1 text-xs rounded-3xl bg-[#f0f0f0] text-gray-800">
              {item.category?.name || "Uncategorized"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onAdd(item)}
              disabled={addingItemId === item._id}
              className={`px-8 py-2 rounded-full text-sm font-medium transition inline-flex items-center gap-2 ${
                item.available
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
              aria-label={`Add ${item.name} to cart`}
            >
              {addingItemId === item._id ? (
                <span className="inline-flex items-center gap-1 text-sm">
                  <Check className="w-4 h-4" /> Added
                </span>
              ) : (
                "Add"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const MenuItemCardList = ({ item }) => (
    <motion.div className="flex flex-col gap-1">
      <div
        key={item._id}
        className={`flex items-center bg-white border rounded-xl p-3 shadow-sm hover:shadow-md transition `}
      >
        <img
          src={item.image || "/placeholder.png"}
          alt={item.name}
          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
        />
        <div className="ml-4 flex-1 flex-col gap-2 min-w-0 ">
          <div className="flex gap-1 justify-between items-center">
            <h3 className="font-medium text-gray-800 truncate">{item.name}</h3>
            <p className="mr-2 text-base font-semibold text-gray-900">
              Rs. {item.price}
            </p>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">
            {item.description}
          </p>
          <div className="flex justify-between items-end mt-1">
            <Badge className="px-3 py-1 -ml-2 text-xs rounded-2xl bg-[#f0f0f0] text-gray-800">
              {item.category?.name || "Uncategorized"}
            </Badge>
            <button
              onClick={() => onAdd(item)}
              disabled={addingItemId === item._id}
              className={`ml-4 px-4 py-1 rounded-full text-sm font-medium transition flex-shrink-0 ${
                item.available
                  ? "bg-black text-white"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
              aria-label={`Add ${item.name} to cart`}
            >
              {addingItemId === item._id ? (
                <Check className="w-4 h-4" />
              ) : (
                "Add"
              )}
            </button>
          </div>
        </div>

        {/* List view Add Button */}
      </div>
    </motion.div>
  );

  /* ---------------- Render ---------------- */

  return (
    <div className={`min-h-screen bg-gray-50 ${open ? "bg-black/40" : ""}`}>
      <Header
        restaurant={restaurant}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        query={query}
        setQuery={setQuery}
        inputRef={inputRef}
        categories={categories}
        activeCat={activeCat}
        handleTabClick={handleTabClick}
        view={view}
        setView={setView}
        tabsRef={tabsRef}
      />

      {/* Content area */}
      <main
        ref={containerRef}
        onScroll={onScroll}
        // Increased height for better visibility, adjusted based on header height (~100px)
        className="max-w-3xl mx-auto p-4 space-y-8 h-[calc(100vh-100px)] overflow-auto"
      >
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <>
            {/* If there is search query but no results (visibleItems is based on combined filters) */}
            {query && visibleItems.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                No items found matching "{query}".
              </div>
            ) : // If 'All' is active, render a single unified grid that shows
            // all items together (two columns on larger screens). This
            // prevents per-category row grouping and allows items from
            // different categories to sit side-by-side.
            activeCat === "all" ? (
              <section
                key="all"
                ref={(el) => (sectionRefs.current["all"] = el)}
                id={`section-all`}
              >
                <AnimatePresence>
                  <div
                    className={
                      view === "grid"
                        ? "w-full grid grid-cols-1 sm:grid-cols-2 gap-1"
                        : "space-y-1"
                    }
                  >
                    {visibleItems.length === 0 ? (
                      <div className="text-gray-500 col-span-full py-4">
                        No items found matching your search/filters.
                      </div>
                    ) : (
                      visibleItems.map((item) =>
                        view === "grid" ? (
                          <MenuItemCardGrid key={item._id} item={item} />
                        ) : (
                          <MenuItemCardList key={item._id} item={item} />
                        )
                      )
                    )}
                  </div>
                </AnimatePresence>
              </section>
            ) : (
              // grouped by category presentation: show category header + items
              categories
                .filter((c) => c)
                .map((cat) => {
                  // In single category view, only show that category.

                  if (cat._id === "all") return null;

                  const listForCat = (grouped[cat._id] || []).filter((it) => {
                    if (!query) return true;
                    const q = query.toLowerCase();
                    return (
                      (it.name || "").toLowerCase().includes(q) ||
                      (it.description || "").toLowerCase().includes(q)
                    );
                  });

                  const shouldRenderSection = activeCat === cat._id;

                  if (!shouldRenderSection) return null;

                  // In single-category view, skip if empty after filtering
                  if (listForCat.length === 0) return null;

                  return (
                    <section
                      key={cat._id}
                      ref={(el) => (sectionRefs.current[cat._id] = el)}
                      id={`section-${cat._id}`}
                    >
                      {activeCat === cat._id && (
                        <div className="flex flex-col mb-3">
                          <h2 className="text-xl font-semibold">{cat.name}</h2>
                          {cat.description && (
                            <p className="text-sm text-gray-500">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Display content based on view type */}
                      <AnimatePresence>
                        <div
                          className={
                            view === "grid"
                              ? "w-full grid grid-cols-1 sm:grid-cols-2 gap-1"
                              : "space-y-1"
                          }
                        >
                          {listForCat.length === 0 ? (
                            <div className="text-gray-500 col-span-full py-4">
                              No items found in this category matching your
                              search/filters.
                            </div>
                          ) : (
                            listForCat.map((item) =>
                              view === "grid" ? (
                                <MenuItemCardGrid key={item._id} item={item} />
                              ) : (
                                <MenuItemCardList key={item._id} item={item} />
                              )
                            )
                          )}
                        </div>
                      </AnimatePresence>
                    </section>
                  );
                })
            )}
          </>
        )}
      </main>

      {/* Floating cart button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => dispatch(openCart())} // Use imported action creator
          className="flex items-center gap-3 bg-black text-white px-4 py-2 rounded-full shadow-lg"
          aria-label="Open cart"
        >
          {/* FIX: Use isClient for hydration safety */}
          {isClient ? (
            <>
              <span className="font-semibold">{cartTotalQty}</span>
              <span className="text-sm">items</span>
              <span className="font-medium">•</span>
              <span className="font-semibold">
                Rs {cartTotalPrice.toFixed(2)}
              </span>
            </>
          ) : (
            // Consistent server render output
            <>
              <span className="font-semibold">0</span>
              <span className="text-sm">items</span>
              <span className="font-medium">•</span>
              <span className="font-semibold">Rs 0.00</span>
            </>
          )}
        </button>
      </div>

      {/* Cart drawer (existing component) */}
      <CartDrawer restaurantId={restaurantId} />
    </div>
  );
}
