"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  UserCheck,
  AlertTriangle
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const navigation = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "officer"],
    },
    {
      name: "All Complaints",
      href: "/dashboard/complaints",
      icon: FileText,
      roles: ["admin", "officer"],
    },
    {
      name: "Assignments",
      href: "/dashboard/assignments",
      icon: UserCheck,
      roles: ["admin", "officer"],
    },
    {
      name: "Officers",
      href: "/dashboard/officers",
      icon: Users,
      roles: ["admin"],
    },
    {
      name: "Reports",
      href: "/dashboard/reports",
      icon: AlertTriangle,
      roles: ["admin"],
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
      roles: ["admin"],
    },
  ];

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(session?.user?.role || "")
  );

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center flex-shrink-0 px-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Civic Admin
                </h1>
              </div>
            </div>
          </div>
          
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {filteredNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  }`}
                >
                  <Icon
                    className={`mr-3 flex-shrink-0 h-5 w-5 ${
                      isActive(item.href)
                        ? "text-blue-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {session?.user?.name?.[0]?.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {session?.user?.role}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="ml-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header - Mobile */}
        <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              Civic Admin
            </h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}