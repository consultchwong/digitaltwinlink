import {
  Menu,
  Moon,
  Sun,
  Settings,
  Plus,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

interface TopBarProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenCharacters: () => void;
  onOpenSettings?: () => void;
  onToggleSidebar?: () => void;
  showMenuButton?: boolean;
}

export function TopBar({
  isDarkMode,
  onToggleDarkMode,
  onOpenCharacters,
  onOpenSettings,
  onToggleSidebar,
  showMenuButton,
}: TopBarProps) {
  const { user, signOut } = useAuth();

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
            <Menu className="w-5 h-5" />
          </Button>
        )}

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center shadow-sm">
            <span className="text-sm">🔗</span>
          </div>
          <span className="font-semibold hidden sm:block">DigitalTwinLink</span>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Add Character button */}
        <Button
          variant="default"
          size="sm"
          onClick={onOpenCharacters}
          className="hidden sm:flex"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Character
        </Button>

        {/* Theme toggle */}
        <Button variant="ghost" size="icon" onClick={onToggleDarkMode}>
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Avatar className="w-7 h-7">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onOpenCharacters} className="sm:hidden">
              <Plus className="w-4 h-4 mr-2" />
              New Character
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onOpenSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut()}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
