"use client";

import { fetchRestaurantMenu } from "@/app/store/customerMenuSlice";
import { useParams } from "next/navigation";
import { use, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function CustomerMenu() {
  const { restaurantId } = useParams();
  const dispatch = useDispatch();
  const { menus, loading, error } = useSelector((state) => state.menu);

  // const restaurantMenu = menus[restaurantId];
  // console.log(restaurantMenu);

  useEffect(() => {
    dispatch(fetchRestaurantMenu(restaurantId));
  }, [restaurantId, dispatch]);

  if (loading) return <p>Loading menu...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  // if (!restaurantMenu) return null;

  return (
    // <div className="space-y-6">
    //   {restaurantMenu.categories.map((cat) => (
    //     <div key={cat._id}>
    //       <h3 className="font-semibold text-lg">{cat.name}</h3>
    //       <p className="text-gray-500">{cat.description}</p>
    //       <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
    //         {restaurantMenu.menuItems
    //           .filter((item) => item.category._id === cat._id)
    //           .map((item) => (
    //             <div key={item._id} className="border rounded p-4">
    //               <h4 className="font-medium">{item.name}</h4>
    //               <p className="text-sm text-gray-500">{item.description}</p>
    //               <p className="font-semibold mt-1">₹ {item.price}</p>
    //             </div>
    //           ))}
    //       </div>
    //     </div>
    //   ))}
    // </div>
    <h1>Hello</h1>
  );
}
