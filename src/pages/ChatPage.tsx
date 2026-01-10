import { ChatInterface } from "@/components/chat/ChatInterface";
import { useNavigate, useParams } from "react-router-dom";
import { Character, Mission } from "@/types/character";

// Demo character and mission for the chat demo
const demoCharacter: Character = {
  id: "demo",
  name: "Alex",
  v3_data: {
    name: "Alex",
    description: "A professional meeting scheduler with a friendly demeanor",
    personality: "Professional, efficient, friendly, helpful",
    tags: ["scheduler", "professional"],
    first_mes: "Hi! I'm Alex, and I'll be helping you schedule a meeting today.",
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const demoMission: Mission = {
  mission_type: "schedule_meeting",
  mission_title: "Q1 Roadmap Discussion with Sarah",
  initial_details: {
    with_person: "Sarah",
    duration: "30 minutes",
    format: "Video call",
  },
  generated_by: "human",
};

const ChatPage = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();

  const handleBack = () => {
    navigate("/");
  };

  return (
    <ChatInterface
      character={demoCharacter}
      mission={demoMission}
      onBack={handleBack}
    />
  );
};

export default ChatPage;
