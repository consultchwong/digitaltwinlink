// Character Card V3 Specification Types

export interface CharacterBookEntry {
  keys: string[];
  content: string;
  insertion_order: number;
  enabled: boolean;
}

export interface CharacterBook {
  entries: CharacterBookEntry[];
}

export interface CharacterV3Data {
  // Core identity
  name: string;
  description: string;
  personality: string;
  tags: string[];
  nickname?: string;

  // Greetings and examples
  first_mes: string;
  alternate_greetings?: string[];
  mes_example?: string;

  // Knowledge base
  character_book?: CharacterBook;

  // Advanced
  system_prompt?: string;
  post_history_instructions?: string;
  scenario?: string;
  creator_notes?: string;

  // Metadata
  character_version?: string;
  creator?: string;
  creation_date?: string;
  modification_date?: string;
  source?: string;
  extensions?: Record<string, unknown>;
}

export interface CharacterCard {
  spec: "chara_card_v3";
  spec_version: "3.0";
  data: CharacterV3Data;
}

export interface Character {
  id: string;
  user_id?: string;
  name: string;
  avatar_url?: string;
  background_url?: string;
  v3_data: CharacterV3Data;
  created_at: string;
  updated_at: string;
}

// Mission Types
export interface MissionDetails {
  [key: string]: string | number | boolean | string[];
}

export interface MissionConfirmation {
  [key: string]: string | number | boolean | string[];
}

export interface Mission {
  mission_type: "schedule_meeting" | "accept_offer" | "interview_report" | "custom";
  mission_title: string;
  initial_details: MissionDetails;
  confirmation?: MissionConfirmation;
  generated_by?: "human" | "ai";
}

// Session Types
export interface Session {
  id: string;
  character_id: string;
  mission: Mission;
  sender_id?: string;
  link_token: string;
  status: "active" | "completed" | "expired";
  created_at: string;
  completed_at?: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: "user" | "assistant";
  content: string;
  suggested_options?: string[];
  created_at: string;
}
