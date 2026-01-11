import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Chrome, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestContinue: () => void;
}

type AuthMode = "choice" | "login" | "signup";

export function AuthModal({ isOpen, onClose, onGuestContinue }: AuthModalProps) {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<AuthMode>("choice");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      toast.error("Failed to sign in with Google");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      if (mode === "login") {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Welcome back!");
          onClose();
        }
      } else {
        const { error } = await signUpWithEmail(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Account created successfully!");
          onClose();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetModal = () => {
    setMode("choice");
    setEmail("");
    setPassword("");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-2xl shadow-lg z-50 overflow-hidden"
          >
            {/* Glow effect */}
            <div className="absolute inset-0 bg-glow opacity-30" />

            <div className="relative p-8">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={handleClose}
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center shadow-glow">
                  <span className="text-3xl">🔗</span>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {mode === "choice" ? (
                  <motion.div
                    key="choice"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {/* Title */}
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold mb-2">Welcome to DigitalTwinLink</h2>
                      <p className="text-muted-foreground">
                        Create AI characters and mission-focused conversations
                      </p>
                    </div>

                    {/* Auth options */}
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-start gap-3"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Chrome className="w-5 h-5" />
                        )}
                        Continue with Google
                      </Button>

                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full justify-start gap-3"
                        onClick={() => setMode("login")}
                      >
                        <Mail className="w-5 h-5" />
                        Continue with Email
                      </Button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                      <div className="flex-1 h-px bg-border" />
                      <span className="text-sm text-muted-foreground">or</span>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Guest option */}
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full"
                      onClick={onGuestContinue}
                    >
                      Continue as Guest
                    </Button>

                    <p className="text-center text-xs text-muted-foreground mt-6">
                      By continuing, you agree to our Terms of Service and Privacy Policy
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="email-form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    {/* Title */}
                    <div className="text-center mb-8">
                      <h2 className="text-2xl font-bold mb-2">
                        {mode === "login" ? "Welcome Back" : "Create Account"}
                      </h2>
                      <p className="text-muted-foreground">
                        {mode === "login"
                          ? "Sign in to your account"
                          : "Sign up to get started"}
                      </p>
                    </div>

                    <form onSubmit={handleEmailAuth} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        variant="hero"
                        size="lg"
                        className="w-full"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : mode === "login" ? (
                          "Sign In"
                        ) : (
                          "Create Account"
                        )}
                      </Button>
                    </form>

                    <div className="mt-6 text-center">
                      <button
                        type="button"
                        className="text-sm text-muted-foreground hover:text-foreground"
                        onClick={() => setMode(mode === "login" ? "signup" : "login")}
                      >
                        {mode === "login"
                          ? "Don't have an account? Sign up"
                          : "Already have an account? Sign in"}
                      </button>
                    </div>

                    <div className="mt-4 text-center">
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline"
                        onClick={() => setMode("choice")}
                      >
                        ← Back to options
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
