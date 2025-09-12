"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "@/app/store/cartSlice";
import { useParams } from "next/navigation";
import CartDrawer from "@/components/CartDrawer";
import { toast } from "react-hot-toast";
import { fetchRestaurantMenu } from "@/app/store/menuSlice";

export default function RestaurantMenuPage() {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();
  const { restaurant, categories, menuItems, status } = useSelector(
    (s) => s.menu
  );
  const open = useSelector((s) => s.cart.open);

  const [activeCat, setActiveCat] = useState(null);
  const containerRef = useRef(null);
  const catRefs = useRef({}); // map categoryId -> dom node

  useEffect(() => {
    if (restaurantId) dispatch(fetchRestaurantMenu(restaurantId));
  }, [restaurantId, dispatch]);

  useEffect(() => {
    if (categories.length) setActiveCat(categories[0]._id);
  }, [categories]);

  // group items by category for faster rendering
  const grouped = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[c._id] = []));
    menuItems.forEach((m) => {
      const cid = m.category?._id || m.category;
      if (!map[cid]) map[cid] = [];
      map[cid].push(m);
    });
    return map;
  }, [categories, menuItems]);

  const onAdd = (item) => {
    if (!item.available) return toast.error("Item not available");
    dispatch(
      addToCart({
        _id: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
      })
    );
    toast.success("Added to cart");
  };

  const scrollToCat = (id) => {
    const node = catRefs.current[id];
    if (node && containerRef.current) {
      const top = node.offsetTop - containerRef.current.offsetTop - 8;
      containerRef.current.scrollTo({ top, behavior: "smooth" });
    }
  };

  // when scrolling, set active category
  const onScroll = () => {
    const scrollTop = containerRef.current?.scrollTop || 0;
    let last = null;
    for (const c of categories) {
      const n = catRefs.current[c._id];
      if (!n) continue;
      if (n.offsetTop - containerRef.current.offsetTop - 40 <= scrollTop)
        last = c._id;
    }
    if (last) setActiveCat(last);
  };

  if (status === "loading") return <div className="p-6">Loading menu…</div>;
  if (status === "failed")
    return <div className="p-6 text-red-600">Failed to load menu.</div>;

  return (
    <div
      className={`min-h-screen  ${
        open ? "bg-black/40 bg-opacity-80" : "bg-gray-50"
      }`}
    >
      {/* Header */}
      <header className="sticky top-0 z-20 shadow px-4 py-3 flex items-center gap-3">
        <img
          src={restaurant?.logo || "/placeholder.png"}
          alt={restaurant?.name || "Restaurant"}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div>
          <h1 className="text-lg font-semibold">
            {restaurant?.name || "Menu"}
          </h1>
          <p className="text-sm text-gray-500">Tap items to add to cart</p>
        </div>
      </header>

      {/* Category Tabs */}
      <div className="sticky top-[72px] z-10 border-b">
        <div className="overflow-x-auto py-2 px-3 flex gap-3">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => {
                setActiveCat(cat._id);
                scrollToCat(cat._id);
              }}
              className={`px-3 py-1 rounded-full whitespace-nowrap ${
                activeCat === cat._id
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu list */}
      <main
        ref={containerRef}
        onScroll={onScroll}
        className="p-4 space-y-8 overflow-auto h-[calc(100vh-160px)]"
      >
        {categories.map((cat) => (
          <section
            key={cat._id}
            ref={(el) => (catRefs.current[cat._id] = el)}
            id={`cat-${cat._id}`}
          >
            <h2 className="text-xl font-semibold mb-3">{cat.name}</h2>
            <p className="text-sm text-gray-500 mb-3">{cat.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(grouped[cat._id] || []).map((item) => (
                <div
                  key={item._id}
                  className="rounded-2xl p-4 flex gap-4 items-center shadow"
                >
                  <div className="flex-1">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-semibold">Rs {item.price}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onAdd(item)}
                          className="bg-green-600 text-white px-3 py-1 rounded-full"
                        >
                          Add
                        </button>
                        {!item.available && (
                          <span className="text-xs text-red-600">
                            Not available
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Cart Drawer */}
      <CartDrawer restaurantId={restaurantId} />
    </div>
  );
}
