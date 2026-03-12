import { Link, useLocation } from "wouter";
import { ChevronLeft, Star, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import codeImage from "@assets/generated_images/programming_code_screen.png";

// Mock Cart Data
const CART_ITEMS = [
  {
    id: 1,
    title: "Learn and Understand AngularJS",
    rating: 4.5,
    date: "30 Jun 2021",
    originalPrice: 20.00,
    price: 16.00,
    image: codeImage
  }
];

export default function Cart() {
  const [, setLocation] = useLocation();

  const subtotal = CART_ITEMS.reduce((acc, item) => acc + item.originalPrice, 0);
  const discount = CART_ITEMS.reduce((acc, item) => acc + (item.originalPrice - item.price), 0);
  const tax = (subtotal - discount) * 0.10;
  const total = subtotal - discount + tax;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white p-6 pt-8 pb-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-gray-100"
            onClick={() => setLocation("/home")}
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </Button>
          <h1 className="text-lg font-bold">Cart</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 p-6 space-y-4">
        {CART_ITEMS.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl p-3 flex gap-4 shadow-sm border border-gray-100">
            <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
              <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 flex flex-col justify-between py-1">
              <h3 className="font-bold text-sm leading-tight line-clamp-2">
                {item.title}
              </h3>
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-400">
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current" />
                  <Star className="w-3 h-3 fill-current opacity-50" />
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{item.date}</span>
                <div className="flex items-center gap-2">
                   <span className="line-through">${item.originalPrice.toFixed(2)}</span>
                   <span className="text-primary font-bold text-base">${item.price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Checkout Section */}
      <div className="bg-white rounded-t-[30px] p-8 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="space-y-3 mb-8">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Subtotal</span>
            <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Discount</span>
            <span className="font-medium text-gray-900">${discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>Tax (10.0%)</span>
            <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
          </div>
          <div className="h-px bg-gray-100 my-2" />
          <div className="flex justify-between text-base font-bold text-gray-900">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <Button className="flex-1 h-14 rounded-2xl text-base font-bold shadow-lg shadow-primary/20">
            Checkout
          </Button>
          <Button variant="outline" className="flex-1 h-14 rounded-2xl text-base font-bold border-gray-200 hover:bg-gray-50 hover:text-primary">
            Add Coupon
          </Button>
        </div>
      </div>
    </div>
  );
}
