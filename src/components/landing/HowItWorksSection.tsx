import { motion } from "framer-motion";
import { ArrowRight, Bot, Link2, MessageCircle, Target } from "lucide-react";

const steps = [
  {
    icon: Bot,
    title: "Create Your Character",
    description: "Design an AI persona with personality, knowledge base, and custom avatar. Follows Character Card V3 spec for compatibility.",
    image: "character",
  },
  {
    icon: Target,
    title: "Define a Mission",
    description: "Choose a template or create a custom goal. The AI will guide conversations toward completing this mission.",
    image: "mission",
  },
  {
    icon: Link2,
    title: "Generate & Share Link",
    description: "Get a unique URL for this session. Share it via WhatsApp, email, SMS, or any platform your audience uses.",
    image: "link",
  },
  {
    icon: MessageCircle,
    title: "Mission Complete",
    description: "Your AI character handles the conversation, collects required info, and reports back when the mission is done.",
    image: "complete",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 px-4 bg-background relative overflow-hidden">
      {/* Gradient accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-electric-cyan/5 rounded-full blur-[128px]" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four simple steps to create mission-focused AI conversations
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative"
            >
              {/* Connector line for desktop */}
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-[2px] bg-gradient-to-r from-primary/50 to-transparent" />
              )}

              <div className="flex lg:flex-col items-start lg:items-center gap-4 lg:text-center">
                {/* Step number + icon */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-glow">
                    <step.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 lg:mt-4">
                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>

                {/* Arrow for mobile */}
                {i < steps.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-primary lg:hidden" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Visual demo placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 relative"
        >
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 to-electric-cyan/10 rounded-3xl blur-2xl" />
          <div className="relative bg-card border border-border rounded-2xl p-8 lg:p-12">
            <div className="grid lg:grid-cols-3 gap-8 items-center">
              {/* Character card preview */}
              <div className="bg-surface-elevated rounded-xl p-6 border border-border">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-electric-cyan flex items-center justify-center text-2xl">
                    🤖
                  </div>
                  <div>
                    <h4 className="font-semibold">Alex</h4>
                    <p className="text-xs text-muted-foreground">Meeting Scheduler</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Professional & friendly</p>
                  <p>• Calendar integration</p>
                  <p>• Multi-timezone support</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <ArrowRight className="w-8 h-8 text-primary" />
                </div>
              </div>

              {/* Session result preview */}
              <div className="bg-surface-elevated rounded-xl p-6 border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-sm font-medium text-success">Mission Complete</span>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Meeting:</span>
                    <span className="font-medium">Q1 Roadmap Call</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium">Thu, Jan 16 @ 3:30 PM</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="font-medium">Video Call</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
