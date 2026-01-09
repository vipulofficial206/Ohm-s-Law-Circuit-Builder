
import { ComponentType, Lab, TutorialStep } from './types';

export const GRID_SIZE = 1;
export const MAX_COMPONENTS = 50;
export const CONNECTION_DISTANCE = 5.5; // Significantly increased for high reliability in connections

export const DEFAULT_VALUES = {
  [ComponentType.BATTERY]: 9,
  [ComponentType.RESISTOR]: 220,
  [ComponentType.LED]: 2,
  [ComponentType.WIRE]: 0,
  [ComponentType.SWITCH]: 0,
  [ComponentType.POTENTIOMETER]: 500,
};

export const COMPONENT_LABELS = {
  [ComponentType.BATTERY]: '9V Battery',
  [ComponentType.RESISTOR]: 'Resistor',
  [ComponentType.LED]: 'Red LED',
  [ComponentType.WIRE]: 'Wire',
  [ComponentType.SWITCH]: 'Switch',
  [ComponentType.POTENTIOMETER]: 'Potentiometer',
};

export const COMPONENT_COLORS = {
  [ComponentType.BATTERY]: '#facc15',
  [ComponentType.RESISTOR]: '#64748b',
  [ComponentType.LED]: '#ef4444',
  [ComponentType.WIRE]: '#3b82f6',
  [ComponentType.SWITCH]: '#10b981',
  [ComponentType.POTENTIOMETER]: '#a855f7',
};

export const LAB_EXERCISES: Lab[] = [
  {
    id: 'ohms-basics',
    title: "1. The Basics of Flow",
    description: "Learn how to move equipment and connect your first circuit using snap-to-grid controls.",
    difficulty: "Beginner",
    icon: "⚡",
    objectives: ["Move the Battery", "Connect the Resistor", "Watch the Current"],
    initialComponents: [
      { type: ComponentType.BATTERY, pos: { x: -6, y: -4 }, value: 9, label: 'Power Source' },
      { type: ComponentType.RESISTOR, pos: { x: 6, y: 4 }, value: 1000, label: 'Load' }
    ],
    tutorialSteps: [
      {
        title: "🖱️ DRAG & DROP",
        description: "Hold Left-Click on the YELLOW BATTERY to move it. Parts snap to a grid to help you align them perfectly.",
        actionLabel: "Moved it!"
      },
      {
        title: "🔗 CONNECTING",
        description: "Drag the GREY RESISTOR near the battery. A blue glowing wire will appear when they are close enough to form a connection.",
        trigger: (comps) => comps.some(c => c.isActive),
        actionLabel: "Flowing now!"
      },
      {
        title: "📉 OHM'S LAW",
        description: "Select the Resistor. On the RIGHT panel, slide the resistance value. Observe how lower resistance allows more current flow!",
        trigger: (comps) => comps.some(c => c.type === ComponentType.RESISTOR && c.value < 200 && c.isActive),
        actionLabel: "Physics Mastered!"
      }
    ]
  },
  {
    id: 'led-safety',
    title: "2. LED Safety Lab",
    description: "Don't blow up the LED! Use a resistor to limit the current flow properly.",
    difficulty: "Beginner",
    icon: "💡",
    objectives: ["Add a Resistor", "Protect the LED", "Avoid the 'Pop'"],
    initialComponents: [
      { type: ComponentType.BATTERY, pos: { x: -7, y: 0 }, value: 12, label: '12V Power' },
      { type: ComponentType.LED, pos: { x: 7, y: 0 }, value: 2, label: 'Bright LED' }
    ],
    tutorialSteps: [
      {
        title: "➕ ADDING PARTS",
        description: "Pull a 'Fixed Resistor' from the LEFT inventory onto the board. We need this to protect our delicate LED.",
        trigger: (comps) => comps.filter(c => c.type === ComponentType.RESISTOR).length > 0,
        actionLabel: "Added Resistor"
      },
      {
        title: "🛡️ WIRING",
        description: "Place the Resistor between the Battery and the LED. All three components must be connected in a single loop to glow.",
        trigger: (comps) => comps.some(c => c.type === ComponentType.LED && c.isActive && !c.isBurnedOut),
        actionLabel: "LED is Safe!"
      }
    ]
  }
];
