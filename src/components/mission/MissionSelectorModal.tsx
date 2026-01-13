import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, FileText, Users, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mission } from "@/types/character";

interface MissionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mission: Mission) => void;
  character?: { name: string };
}

const missionTemplates = [
  {
    type: "schedule_meeting" as const,
    icon: Calendar,
    title: "Schedule Meeting",
    description: "Book calls, appointments, or interviews with availability management",
    color: "from-primary to-primary/60",
    fields: [
      { key: "meeting_title", label: "Meeting Title", placeholder: "e.g., Q1 Roadmap Discussion" },
      { key: "with_person", label: "With", placeholder: "e.g., Sarah from Marketing" },
      { key: "duration", label: "Duration", placeholder: "e.g., 30 minutes" },
      { key: "format", label: "Format", placeholder: "e.g., Video call, In-person" },
    ],
  },
  {
    type: "accept_offer" as const,
    icon: FileText,
    title: "Accept Offer",
    description: "Close deals, confirm proposals, or get sign-offs from stakeholders",
    color: "from-success to-success/60",
    fields: [
      { key: "offer_title", label: "Offer Title", placeholder: "e.g., Enterprise Plan Proposal" },
      { key: "details", label: "Key Details", placeholder: "e.g., $5,000/month, 12-month commitment" },
      { key: "deadline", label: "Response Deadline", placeholder: "e.g., End of week" },
    ],
  },
  {
    type: "interview_report" as const,
    icon: Users,
    title: "Interview Report",
    description: "Collect structured feedback, assessments, or survey responses",
    color: "from-warning to-warning/60",
    fields: [
      { key: "candidate_name", label: "Candidate/Subject", placeholder: "e.g., John Smith" },
      { key: "position", label: "Position/Topic", placeholder: "e.g., Senior Developer Role" },
      { key: "criteria", label: "Evaluation Criteria", placeholder: "e.g., Technical skills, Communication" },
    ],
  },
  {
    type: "custom" as const,
    icon: Sparkles,
    title: "Custom Mission",
    description: "Define your own goal and parameters for complete flexibility",
    color: "from-electric-cyan to-electric-cyan/60",
    fields: [
      { key: "goal", label: "Mission Goal", placeholder: "e.g., Collect feedback on new product feature" },
      { key: "success_criteria", label: "Success Criteria", placeholder: "e.g., Get rating and 3 suggestions" },
    ],
  },
];

export function MissionSelectorModal({ isOpen, onClose, onSelect, character }: MissionSelectorModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<typeof missionTemplates[0] | null>(null);
  const [missionTitle, setMissionTitle] = useState("");
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleTemplateSelect = (template: typeof missionTemplates[0]) => {
    setSelectedTemplate(template);
    setFormData({});
    setMissionTitle("");
  };

  const handleCreate = () => {
    if (!selectedTemplate || !missionTitle.trim()) return;

    const mission: Mission = {
      mission_type: selectedTemplate.type,
      mission_title: missionTitle,
      initial_details: formData,
      generated_by: "human",
    };

    onSelect(mission);
    setSelectedTemplate(null);
    setMissionTitle("");
    setFormData({});
    onClose();
  };

  const handleBack = () => {
    setSelectedTemplate(null);
    setMissionTitle("");
    setFormData({});
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
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[85vh] bg-card border border-border rounded-2xl shadow-lg z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedTemplate ? "Configure Mission" : "Select Mission Type"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {selectedTemplate
                    ? `Setting up: ${selectedTemplate.title}`
                    : "Choose a template to get started"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
              <AnimatePresence mode="wait">
                {!selectedTemplate ? (
                  <motion.div
                    key="templates"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="grid sm:grid-cols-2 gap-4"
                  >
                    {missionTemplates.map((template) => (
                      <button
                        key={template.type}
                        onClick={() => handleTemplateSelect(template)}
                        className="group text-left bg-surface-elevated rounded-xl p-5 border border-border hover:border-primary/50 transition-all"
                      >
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                        >
                          <template.icon className="w-6 h-6 text-primary-foreground" />
                        </div>
                        <h3 className="font-semibold mb-1">{template.title}</h3>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </button>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-6"
                  >
                    {/* Mission Title */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mission Title *</label>
                      <Input
                        placeholder="Give this mission a name..."
                        value={missionTitle}
                        onChange={(e) => setMissionTitle(e.target.value)}
                      />
                    </div>

                    {/* Template-specific fields */}
                    {selectedTemplate.fields.map((field) => (
                      <div key={field.key} className="space-y-2">
                        <label className="text-sm font-medium">{field.label}</label>
                        {field.key === "details" || field.key === "criteria" || field.key === "goal" || field.key === "success_criteria" ? (
                          <Textarea
                            placeholder={field.placeholder}
                            value={formData[field.key] || ""}
                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                            rows={3}
                          />
                        ) : (
                          <Input
                            placeholder={field.placeholder}
                            value={formData[field.key] || ""}
                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                          />
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-border bg-surface-elevated">
              {selectedTemplate ? (
                <>
                  <Button variant="ghost" onClick={handleBack}>
                    Back
                  </Button>
                  <Button variant="hero" onClick={handleCreate} disabled={!missionTitle.trim()}>
                    Create Mission
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                  <span className="text-sm text-muted-foreground">Select a template to continue</span>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
