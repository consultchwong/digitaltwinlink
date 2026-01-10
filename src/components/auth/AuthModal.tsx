import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGuestContinue: () => void;
  onGoogleSignIn: () => void;
}

export function AuthModal({ isOpen, onClose, onGuestContinue, onGoogleSignIn }: AuthModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={onClose}
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
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Logo */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center shadow-glow">
                  <span className="text-3xl">🔗</span>
                </div>
              </div>

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
                  onClick={onGoogleSignIn}
                >
                  <Chrome className="w-5 h-5" />
                  Continue with Google
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full justify-start gap-3"
                  disabled
                >
                  <Mail className="w-5 h-5" />
                  Continue with Email
                  <span className="ml-auto text-xs text-muted-foreground">Coming soon</span>
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
