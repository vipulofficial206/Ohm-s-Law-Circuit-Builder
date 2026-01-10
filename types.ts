
export enum ComponentType {
  BATTERY = 'BATTERY',
  RESISTOR = 'RESISTOR',
  LED = 'LED',
  WIRE = 'WIRE',
  SWITCH = 'SWITCH',
  POTENTIOMETER = 'POTENTIOMETER'
}

export enum ViewMode {
  VIEW_3D = '3D',
  VIEW_2D = '2D'
}

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface Lab {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  icon: string;
  initialComponents: any[]; 
  objectives: string[];
  tutorialSteps: TutorialStep[];
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface CircuitComponent {
  id: string;
  type: ComponentType;
  pos: Vec2;
  rotation: number;
  value: number;
  label: string;
  current: number;
  voltageDrop: number;
  power: number;
  isActive: boolean;
  isBurnedOut?: boolean;
  isOpen?: boolean; // For Switch: true means circuit is broken
  connectedTo?: string[]; // IDs of connected components
}

export interface TutorialStep {
  title: string;
  description: string;
  trigger?: (components: CircuitComponent[]) => boolean;
  actionLabel?: string;
}

export interface CircuitResult {
  updatedComponents: CircuitComponent[];
  insights: string;
  isComplete: boolean;
}
