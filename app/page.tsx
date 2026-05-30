"use client";

import { useState, useEffect, Suspense } from "react";
import DashboardNav from "@/components/dashboard-nav";
import DashboardContent from "@/components/dashboard-content";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu } from "lucide-react";
import { useUserContext } from "@/lib/context/users";
import { useRouter, useSearchParams } from "next/navigation";

export default function Home() {
  const { user, setUser } = useUserContext();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      }
    })();

    setIsHydrated(true);
  }, []);

  return (
    <div
      suppressHydrationWarning
      className="flex h-screen bg-background text-foreground"
    >
      {!isHydrated ? null : !!user ? (
        <Dashboard />
      ) : (
        <Login setUser={setUser} />
      )}
    </div>
  );
}

function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      }
    >
      <DashboardMain />
    </Suspense>
  );
}

const DashboardMain = () => {
  // const searchParams = useSearchParams();
  // const page = searchParams.get("page");
  const [activeTab, setActiveTab] = useState("overview");
  // default mobile nav hidden to avoid hydration mismatches
  const [showNavBar, setShowNavBar] = useState(false);

  return (
    <div className="flex flex-col w-full h-screen">
      {/* Mobile header: visible only on small screens */}
      <button
        className="border flex items-center-safe h-[8%] w-full md:hidden px-4"
        onClick={() => setShowNavBar((s) => !s)}
        aria-expanded={showNavBar}
        aria-label="Toggle navigation"
      >
        <Menu strokeWidth={3} size={24} />
        <span className="font-semibold text-2xl ml-2">Menu</span>
      </button>

      <div className="h-[92%] flex">
        {/* Sidebar Navigation (responsive) */}
        <DashboardNav
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            // hide nav on mobile after selecting
            setShowNavBar(false);
          }}
          showNav={showNavBar}
          onShowNav={setShowNavBar}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardContent activeTab={activeTab} />
        </div>
      </div>
    </div>
  );
};

const Login = ({ setUser }: { setUser: (data: any) => any }) => {
  const [formData, setFormData] = useState({
    user_id: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    const res = await fetch("api/auth/login", {
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data?.error);
      return;
    }

    setFormData({ user_id: "", password: "" });
    // setUser(data);
    // router.refresh()
    window.location.reload();
  };

  return (
    <div className="w-full h-full flex justify-center items-center">
      <Card className="bg-card border-border md:w-[25%]">
        {!!error && (
          <div className="text-red-600 text-lg text-center">{error}</div>
        )}
        <h2 className="text-xl font-bold text-foreground mx-2 text-center">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4 mx-2">
          <div className="grid row-span-3 md:row-span-3 gap-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                User ID
              </label>
              <Input
                type="text"
                placeholder="User ID"
                value={formData.user_id}
                onChange={(e) =>
                  setFormData({ ...formData, user_id: e.target.value })
                }
                className="bg-background border-border"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <Input
                type="text"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="bg-background border-border"
                required
              />
            </div>
          </div>
          <div className="flex m-2">
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Login
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
