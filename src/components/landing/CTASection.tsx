import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  onGetStarted: () => void;
}

export function CTASection({ onGetStarted }: CTASectionProps) {
  return (
    <section className="py-24 px-4 bg-background relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-glow opacity-30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/20 to-electric-cyan/20 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative z-10 max-w-4xl mx-auto text-center"
      >
        <h2 className="text-3xl md:text-5xl font-bold mb-6">
          Ready to Create Your First{" "}
          <span className="text-gradient">AI Character?</span>
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Start building mission-focused AI conversations in minutes. No credit card required.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="electric"
            size="xl"
            onClick={onGetStarted}
            className="group"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            variant="outline"
            size="xl"
          >
            View Documentation
          </Button>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          ✓ Free tier available &nbsp;&nbsp; ✓ No setup required &nbsp;&nbsp; ✓ BYOK supported
        </p>
      </motion.div>
    </section>
  );
}
