
import { CircuitComponent, ComponentType, CircuitResult } from '../types';
import { CONNECTION_DISTANCE } from '../constants';

/**
 * Advanced Cluster-based Solver
 * Groups components by proximity. A circuit works if a battery is in the same
 * physical 'cluster' as a consumer (LED/Resistor).
 */
export const solveCircuit = (components: CircuitComponent[]): CircuitResult => {
  if (components.length === 0) {
    return { updatedComponents: [], insights: "Place components to begin.", isComplete: false };
  }

  // 1. Map connections based on proximity
  const adj = new Map<string, string[]>();
  components.forEach(c => adj.set(c.id, []));

  for (let i = 0; i < components.length; i++) {
    for (let j = i + 1; j < components.length; j++) {
      const dist = Math.sqrt(
        Math.pow(components[i].pos.x - components[j].pos.x, 2) + 
        Math.pow(components[i].pos.y - components[j].pos.y, 2)
      );
      // We use a slightly more generous distance for connections to feel 'snappy'
      if (dist < CONNECTION_DISTANCE) {
        adj.get(components[i].id)?.push(components[j].id);
        adj.get(components[j].id)?.push(components[i].id);
      }
    }
  }

  // 2. Identify isolated 'clusters' (separate circuits on the same board)
  const visited = new Set<string>();
  const clusters: string[][] = [];

  components.forEach(comp => {
    if (!visited.has(comp.id)) {
      const cluster: string[] = [];
      const queue = [comp.id];
      visited.add(comp.id);
      while (queue.length > 0) {
        const id = queue.shift()!;
        cluster.push(id);
        adj.get(id)?.forEach(neighborId => {
          if (!visited.has(neighborId)) {
            visited.add(neighborId);
            queue.push(neighborId);
          }
        });
      }
      clusters.push(cluster);
    }
  });

  // 3. Solve each cluster
  let globalInsights = "";
  const finalComponents: CircuitComponent[] = [...components];

  clusters.forEach(clusterIds => {
    const clusterComps = finalComponents.filter(c => clusterIds.includes(c.id));
    const batteries = clusterComps.filter(c => c.type === ComponentType.BATTERY);
    const switches = clusterComps.filter(c => c.type === ComponentType.SWITCH);
    
    // Check if path is physically broken by an OPEN switch
    const isAnySwitchOpen = switches.some(s => s.isOpen);
    const hasBattery = batteries.length > 0;
    
    // A cluster is functional if it has power and at least one consumer
    const isActiveCluster = hasBattery && clusterComps.length >= 2 && !isAnySwitchOpen;

    if (!isActiveCluster) {
      clusterIds.forEach(id => {
        const idx = finalComponents.findIndex(c => c.id === id);
        finalComponents[idx] = { ...finalComponents[idx], current: 0, voltageDrop: 0, isActive: false };
      });
      
      if (hasBattery && isAnySwitchOpen && globalInsights === "") {
        globalInsights = "Switch is OPEN. Close it to complete the circuit path.";
      }
      return;
    }

    // Physics Calculation
    const totalV = batteries.reduce((s, b) => s + b.value, 0);
    const resistors = clusterComps.filter(c => c.type === ComponentType.RESISTOR || c.type === ComponentType.POTENTIOMETER);
    const leds = clusterComps.filter(c => c.type === ComponentType.LED);
    
    // Internal resistance model
    const totalR = Math.max(0.1, resistors.reduce((s, r) => s + r.value, 0) + (leds.length * 20));
    
    // Short circuit safety
    if (totalR < 1) {
      globalInsights = "⚠️ SHORT CIRCUIT! Very high current detected. Add resistance to protect the source.";
      clusterIds.forEach(id => {
        const idx = finalComponents.findIndex(c => c.id === id);
        finalComponents[idx] = { ...finalComponents[idx], current: 5, voltageDrop: 0, isActive: true };
      });
      return;
    }

    const current = totalV / totalR;
    
    clusterIds.forEach(id => {
      const idx = finalComponents.findIndex(c => c.id === id);
      const c = finalComponents[idx];
      let active = true;
      let burned = c.isBurnedOut || false;
      let vDrop = 0;

      if (c.type === ComponentType.RESISTOR || c.type === ComponentType.POTENTIOMETER) vDrop = current * c.value;
      if (c.type === ComponentType.BATTERY) vDrop = -c.value;
      if (c.type === ComponentType.LED) {
        vDrop = Math.min(2.1, totalV);
        if (current > 0.3) { // 300mA burnout limit
          burned = true;
          globalInsights = "💥 OVERLOAD: The LED burned out due to excessive current!";
        }
        if (burned) active = false;
      }

      finalComponents[idx] = {
        ...c,
        current: burned ? 0 : current,
        voltageDrop: vDrop,
        power: current * Math.abs(vDrop),
        isActive: active && !burned,
        isBurnedOut: burned
      };
    });

    if (globalInsights === "") {
      globalInsights = `Active Circuit: ${totalV}V source, ${(current * 1000).toFixed(0)}mA flow.`;
    }
  });

  return {
    updatedComponents: finalComponents,
    insights: globalInsights || "Place a battery near other components to start.",
    isComplete: finalComponents.some(c => c.isActive)
  };
};
