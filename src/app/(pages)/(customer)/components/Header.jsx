// ====================================================================
// NEW: Extracted Header component
// ====================================================================
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Grid, List } from "lucide-react";
import Image from "next/image";

export const Header = ({
  restaurant,
  searchOpen,
  setSearchOpen,
  query,
  setQuery,
  inputRef,
  categories,
  activeCat,
  handleTabClick,
  view,
  setView,
  tabsRef,
}) => (
  <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b">
    <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
      <Image
        src={restaurant?.logo || "/logo.png"}
        alt={restaurant?.name || "Restaurant"}
        className="w-12 h-12 rounded-full object-cover border"
        width={48}
        height={48}
      />
      <div className="flex-1">
        <h1 className="text-lg font-semibold">
          {restaurant?.name || "Restaurant Menu"}
        </h1>
        <p className="text-xs text-gray-500">{restaurant?.address || ""}</p>
      </div>

      {/* ... (Hidden sm:flex block) ... */}
      <div className="hidden sm:flex flex-col items-end">
        <div className="text-sm font-medium">
          {restaurant?.tableCount ? `${restaurant.tableCount} tables` : ""}
        </div>
        <div className="text-xs text-gray-500">
          {restaurant?.openingTime
            ? `${restaurant.openingTime} - ${restaurant.closingTime}`
            : ""}
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center">
        <motion.div
          animate={{
            width: searchOpen ? 180 : 0,
            opacity: searchOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            // ✅ CORRECTED: Use 'query' state directly
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-9 text-sm"
          />
        </motion.div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSearchOpen(!searchOpen)}
          className="ml-2"
        >
          <SearchIcon className="w-5 h-5" />
        </Button>
      </div>
    </div>

    {/* Tabs + view toggle */}
    <div className="border-t">
      <div className="max-w-3xl mx-auto px-4 py-3 flex gap-3 items-center">
        {/* Tabs */}
        <div
          ref={tabsRef}
          className="flex gap-2 overflow-x-auto no-scrollbar py-1 flex-1"
        >
          {categories.map((cat) => {
            const isActive = activeCat === cat._id;
            return (
              <button
                key={cat._id}
                id={`tab-${cat._id}`}
                onClick={() => handleTabClick(cat._id)}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap text-sm font-medium transition ${
                  isActive
                    ? "bg-black text-white shadow-sm"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1 shrink-0">
          <Button
            variant={view === "grid" ? "default" : "ghost"}
            size="icon"
            className="rounded-md"
            onClick={() => setView("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={view === "list" ? "default" : "ghost"}
            size="icon"
            className="rounded-md"
            onClick={() => setView("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  </header>
);

// ====================================================================
// END Header component
// ====================================================================
