import { motion } from "framer-motion";
import { Bot, Calendar, FileText, Link2, MessageSquare, Share2, Sparkles, Users, Zap } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Reusable AI Characters",
    description: "Create once, use forever. Build AI personas with unique personalities, knowledge bases, and behaviors.",
    color: "from-primary to-primary/60",
  },
  {
    icon: Link2,
    title: "Shareable Session Links",
    description: "Generate unique links for each mission. Share via WhatsApp, email, or any messaging platform.",
    color: "from-electric-cyan to-electric-cyan/60",
  },
  {
    icon: Calendar,
    title: "Mission Templates",
    description: "Pre-built templates for scheduling, offers, interviews, and custom goals. Get started in seconds.",
    color: "from-success to-success/60",
  },
  {
    icon: MessageSquare,
    title: "Smart Conversations",
    description: "AI stays focused on the mission while handling distractions gracefully and answering relevant questions.",
    color: "from-warning to-warning/60",
  },
  {
    icon: Zap,
    title: "Quick Reply Options",
    description: "Suggested buttons reduce friction. Users tap to respond quickly while retaining full typing freedom.",
    color: "from-primary to-electric-cyan",
  },
  {
    icon: Share2,
    title: "Viral Growth Built-In",
    description: "AI recommends relevant bots during sessions, turning receivers into senders organically.",
    color: "from-destructive to-destructive/60",
  },
];

const missionTypes = [
  { icon: Calendar, label: "Schedule Meeting", description: "Book calls & appointments" },
  { icon: FileText, label: "Accept Offer", description: "Close deals & proposals" },
  { icon: Users, label: "Interview Report", description: "Collect structured feedback" },
  { icon: Sparkles, label: "Custom Mission", description: "Define your own goals" },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 bg-surface relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need for{" "}
            <span className="text-gradient">AI-Powered Conversations</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From character creation to mission completion, DigitalTwinLink provides a complete toolkit for goal-oriented AI interactions.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group relative bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Mission types */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Mission Templates for Every Use Case
          </h3>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Start with pre-built templates or create custom missions tailored to your needs.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {missionTypes.map((mission, i) => (
            <motion.div
              key={mission.label}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group bg-card border border-border rounded-xl p-5 text-center hover:border-primary/50 hover:shadow-glow/20 transition-all cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <mission.icon className="w-7 h-7 text-primary" />
              </div>
              <h4 className="font-semibold mb-1">{mission.label}</h4>
              <p className="text-sm text-muted-foreground">{mission.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
