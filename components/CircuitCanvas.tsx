
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Text, ContactShadows, useCursor, Line, OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { CircuitComponent, ComponentType, ViewMode, Vec2 } from '../types';
import { COMPONENT_COLORS, CONNECTION_DISTANCE, DEFAULT_VALUES, COMPONENT_LABELS } from '../constants';

interface CircuitCanvasProps {
  components: CircuitComponent[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdatePos: (id: string, x: number, y: number) => void;
  viewMode: ViewMode;
  pendingType: ComponentType | null;
  onDrop: (type: ComponentType, pos: Vec2) => void;
  theme: 'dark' | 'light';
}

const SchematicSymbol: React.FC<{ type: ComponentType; color: string; active: boolean; isBurned: boolean; isOpen?: boolean; isGhost?: boolean; theme: 'dark' | 'light' }> = ({ type, color, active, isBurned, isOpen, isGhost, theme }) => {
  const strokeColor = isBurned ? "#444" : (active ? (theme === 'dark' ? "#fbbf24" : "#d97706") : (isGhost ? "#60a5fa" : (theme === 'dark' ? "white" : "#334155")));
  
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <planeGeometry args={[1.3, 1.3]} />
        <meshBasicMaterial color={theme === 'dark' ? "#1e293b" : "#ffffff"} transparent opacity={isGhost ? 0.1 : 0.3} />
      </mesh>

      {type === ComponentType.BATTERY && (
        <group>
          <Line points={[new THREE.Vector3(-0.35, 0.2, 0), new THREE.Vector3(0.35, 0.2, 0)]} color={strokeColor} lineWidth={2.5} transparent opacity={isGhost ? 0.5 : 1} />
          <Line points={[new THREE.Vector3(-0.2, 0.05, 0), new THREE.Vector3(0.2, 0.05, 0)]} color={strokeColor} lineWidth={5} transparent opacity={isGhost ? 0.5 : 1} />
          <Line points={[new THREE.Vector3(-0.35, -0.1, 0), new THREE.Vector3(0.35, -0.1, 0)]} color={strokeColor} lineWidth={2.5} transparent opacity={isGhost ? 0.5 : 1} />
          <Line points={[new THREE.Vector3(-0.2, -0.25, 0), new THREE.Vector3(0.2, -0.25, 0)]} color={strokeColor} lineWidth={5} transparent opacity={isGhost ? 0.5 : 1} />
        </group>
      )}

      {type === ComponentType.RESISTOR && (
        <Line 
          points={[
            new THREE.Vector3(-0.5, 0, 0),
            new THREE.Vector3(-0.35, 0.2, 0),
            new THREE.Vector3(-0.15, -0.2, 0),
            new THREE.Vector3(0.05, 0.2, 0),
            new THREE.Vector3(0.25, -0.2, 0),
            new THREE.Vector3(0.5, 0, 0)
          ]} 
          color={strokeColor} 
          lineWidth={2.5} 
          transparent opacity={isGhost ? 0.5 : 1}
        />
      )}

      {type === ComponentType.LED && (
        <group>
          <Line points={[new THREE.Vector3(-0.25, 0.2, 0), new THREE.Vector3(-0.25, -0.2, 0), new THREE.Vector3(0.25, 0, 0), new THREE.Vector3(-0.25, 0.2, 0)]} color={strokeColor} lineWidth={2.5} transparent opacity={isGhost ? 0.5 : 1} />
          <Line points={[new THREE.Vector3(0.25, 0.2, 0), new THREE.Vector3(0.25, -0.2, 0)]} color={strokeColor} lineWidth={2.5} transparent opacity={isGhost ? 0.5 : 1} />
        </group>
      )}

      {type === ComponentType.POTENTIOMETER && (
        <group>
          <Line 
            points={[
              new THREE.Vector3(-0.4, 0, 0),
              new THREE.Vector3(-0.2, 0.15, 0),
              new THREE.Vector3(0, -0.15, 0),
              new THREE.Vector3(0.2, 0.15, 0),
              new THREE.Vector3(0.4, 0, 0)
            ]} 
            color={strokeColor} 
            lineWidth={2.5} 
            transparent opacity={isGhost ? 0.5 : 1}
          />
          <Line points={[new THREE.Vector3(0, 0.45, 0), new THREE.Vector3(0, 0.15, 0)]} color={strokeColor} lineWidth={2.5} transparent opacity={isGhost ? 0.5 : 1} />
        </group>
      )}

      {type === ComponentType.SWITCH && (
        <group>
           <mesh position={[-0.35, 0, 0]}><circleGeometry args={[0.06, 16]} /><meshBasicMaterial color={strokeColor} transparent opacity={isGhost ? 0.5 : 1} /></mesh>
           <mesh position={[0.35, 0, 0]}><circleGeometry args={[0.06, 16]} /><meshBasicMaterial color={strokeColor} transparent opacity={isGhost ? 0.5 : 1} /></mesh>
           <Line points={[new THREE.Vector3(-0.35, 0, 0), new THREE.Vector3(0.25, isOpen ? 0.45 : 0, 0)]} color={strokeColor} lineWidth={2.5} transparent opacity={isGhost ? 0.5 : 1} />
        </group>
      )}

      {type === ComponentType.WIRE && (
        <Line points={[new THREE.Vector3(-0.6, 0, 0), new THREE.Vector3(0.6, 0, 0)]} color={strokeColor} lineWidth={5} transparent opacity={isGhost ? 0.5 : 1} />
      )}
    </group>
  );
};

const ConnectionLines: React.FC<{ components: CircuitComponent[], is2D: boolean; theme: 'dark' | 'light' }> = ({ components, is2D, theme }) => {
  const lines = useMemo(() => {
    const results: [THREE.Vector3, THREE.Vector3][] = [];
    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const dist = Math.sqrt(
          Math.pow(components[i].pos.x - components[j].pos.x, 2) + 
          Math.pow(components[i].pos.y - components[j].pos.y, 2)
        );
        if (dist < CONNECTION_DISTANCE) {
          results.push([
            new THREE.Vector3(components[i].pos.x, 0.01, components[i].pos.y),
            new THREE.Vector3(components[j].pos.x, 0.01, components[j].pos.y)
          ]);
        }
      }
    }
    return results;
  }, [components]);

  return (
    <group>
      {lines.map((pts, i) => (
        <Line 
          key={i} 
          points={pts} 
          color={theme === 'dark' ? "#60a5fa" : "#2563eb"} 
          lineWidth={is2D ? 10 : 4} 
          transparent 
          opacity={is2D ? 0.8 : 0.6} 
        />
      ))}
    </group>
  );
};

const PlacementGhost: React.FC<{ type: ComponentType; viewMode: ViewMode; onDrop: (pos: Vec2) => void; theme: 'dark' | 'light' }> = ({ type, viewMode, onDrop, theme }) => {
  const { raycaster } = useThree();
  const [pos, setPos] = useState<Vec2>({ x: 0, y: 0 });
  const is2D = viewMode === ViewMode.VIEW_2D;
  const ghostRef = useRef<THREE.Group>(null);

  useEffect(() => {
    const handleMove = () => {
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersect = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersect);
      setPos({ x: intersect.x, y: intersect.z });
    };

    const handleUp = () => {
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersect = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersect);
      onDrop({ x: intersect.x, y: intersect.z });
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [onDrop, raycaster]);

  useFrame((state) => {
    if (ghostRef.current) {
      ghostRef.current.position.y = is2D ? 0.1 : 0.3 + Math.sin(state.clock.elapsedTime * 4) * 0.05;
    }
  });

  return (
    <group ref={ghostRef} position={[pos.x, 0, pos.y]}>
      {is2D ? (
        <SchematicSymbol type={type} color={COMPONENT_COLORS[type]} active={false} isBurned={false} isOpen={true} isGhost theme={theme} />
      ) : (
        <group>
           <mesh>
             <boxGeometry args={[1.2, 0.1, 1.2]} />
             <meshBasicMaterial color="#3b82f6" transparent opacity={0.1} />
           </mesh>
           <mesh position={[0, 0.4, 0]}>
             <boxGeometry args={[0.8, 0.8, 0.8]} />
             <meshBasicMaterial color={COMPONENT_COLORS[type]} transparent opacity={0.3} wireframe />
           </mesh>
        </group>
      )}
      <Text position={[0, 1.2, 0]} fontSize={0.2} color={theme === 'dark' ? "#60a5fa" : "#1e40af"} font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff">
        DROP TO PLACE
      </Text>
    </group>
  );
};

const ComponentItem: React.FC<{
  component: CircuitComponent;
  isSelected: boolean;
  viewMode: ViewMode;
  onSelect: (id: string) => void;
  onDrag: (x: number, y: number) => void;
  setIsDragging: (val: boolean) => void;
  theme: 'dark' | 'light';
}> = ({ component, isSelected, viewMode, onSelect, onDrag, setIsDragging, theme }) => {
  const [hovered, setHover] = useState(false);
  const { raycaster } = useThree();
  const dragging = useRef(false);
  useCursor(hovered);

  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    onSelect(component.id);
    dragging.current = true;
    setIsDragging(true);
  };

  const handlePointerUp = (e: any) => {
    e.target.releasePointerCapture(e.pointerId);
    dragging.current = false;
    setIsDragging(false);
  };

  const handlePointerMove = (e: any) => {
    if (dragging.current) {
      const planeIntersect = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const target = new THREE.Vector3();
      raycaster.ray.intersectPlane(planeIntersect, target);
      onDrag(target.x, target.z);
    }
  };

  const is2D = viewMode === ViewMode.VIEW_2D;

  return (
    <group 
      position={[component.pos.x, is2D ? 0.05 : 0.3, component.pos.y]} 
      rotation={[0, (component.rotation * Math.PI) / 180, 0]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {(isSelected || hovered) && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[1.7, 1.5]} />
          <meshBasicMaterial color={isSelected ? "#3b82f6" : "#ffffff"} transparent opacity={isSelected ? 0.15 : 0.1} />
        </mesh>
      )}

      {is2D ? (
        <SchematicSymbol 
          type={component.type} 
          color={COMPONENT_COLORS[component.type]} 
          active={component.isActive} 
          isBurned={!!component.isBurnedOut}
          isOpen={component.isOpen}
          theme={theme}
        />
      ) : (
        <group scale={isSelected ? 1.05 : 1}>
          {component.type === ComponentType.BATTERY && (
             <mesh castShadow>
               <boxGeometry args={[1, 0.6, 0.6]} />
               <meshStandardMaterial color={COMPONENT_COLORS.BATTERY} metalness={0.7} roughness={0.2} />
             </mesh>
          )}
          {component.type === ComponentType.RESISTOR && (
             <group rotation={[0, 0, Math.PI/2]}>
               <mesh castShadow><cylinderGeometry args={[0.2, 0.2, 1, 16]} /><meshStandardMaterial color="#94a3b8" /></mesh>
               <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.21, 0.21, 0.1, 16]} /><meshStandardMaterial color="#451a03" /></mesh>
               <mesh position={[0, -0.2, 0]}><cylinderGeometry args={[0.21, 0.21, 0.1, 16]} /><meshStandardMaterial color="#78350f" /></mesh>
             </group>
          )}
          {component.type === ComponentType.LED && (
             <group>
               <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[0.3, 0.3, 0.3]} /><meshStandardMaterial color="#1e293b" /></mesh>
               <mesh position={[0, 0.3, 0]}>
                 <sphereGeometry args={[0.25, 16, 16]} />
                 <meshStandardMaterial 
                   color={component.isBurnedOut ? "#111" : (component.isActive ? "#f87171" : "#450a0a")} 
                   emissive={component.isActive && !component.isBurnedOut ? "#ef4444" : "black"}
                   emissiveIntensity={component.isActive ? 4 : 0}
                 />
               </mesh>
               {component.isActive && !component.isBurnedOut && <pointLight color="#ef4444" intensity={3} distance={4} />}
             </group>
          )}
          {component.type === ComponentType.POTENTIOMETER && (
             <group>
                <mesh castShadow><cylinderGeometry args={[0.4, 0.4, 0.2, 32]} /><meshStandardMaterial color="#a855f7" /></mesh>
                <group position={[0, 0.2, 0]} rotation={[0, -((component.value / 1000) * Math.PI * 1.5 - 0.75 * Math.PI), 0]}>
                   <mesh castShadow><cylinderGeometry args={[0.2, 0.2, 0.3]} /><meshStandardMaterial color="#475569" /></mesh>
                   <mesh position={[0, 0.1, 0.15]}><boxGeometry args={[0.05, 0.05, 0.2]} /><meshStandardMaterial color="white" /></mesh>
                </group>
             </group>
          )}
          {component.type === ComponentType.SWITCH && (
             <group>
                <mesh castShadow><boxGeometry args={[0.6, 0.2, 0.4]} /><meshStandardMaterial color="#10b981" /></mesh>
                <group position={[0, 0.1, 0]} rotation={[0, 0, component.isOpen ? 0.6 : 0]}>
                   <mesh castShadow position={[0.2, 0.15, 0]}><boxGeometry args={[0.4, 0.05, 0.1]} /><meshStandardMaterial color="#94a3b8" /></mesh>
                </group>
             </group>
          )}
          {component.type === ComponentType.WIRE && (
             <mesh castShadow rotation={[0, 0, Math.PI/2]}>
               <cylinderGeometry args={[0.08, 0.08, 1.2]} />
               <meshStandardMaterial color="#3b82f6" />
             </mesh>
          )}
        </group>
      )}

      {(hovered || isSelected) && (
        <group position={[0, is2D ? 0.9 : 1.2, 0]}>
          <Text 
            fontSize={0.22} 
            color={theme === 'dark' ? "white" : "#334155"} 
            anchorX="center" 
            anchorY="middle"
            font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff"
          >
            {`${component.label}\n${component.value}${component.type === ComponentType.BATTERY ? 'V' : (component.type === ComponentType.LED ? ' (2V)' : 'Ω')}`}
          </Text>
        </group>
      )}

      {component.isActive && <ElectronFlow current={component.current} is2D={is2D} theme={theme} />}
    </group>
  );
};

const ElectronFlow: React.FC<{ current: number; is2D: boolean; theme: 'dark' | 'light' }> = ({ current, is2D, theme }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      const speed = Math.min(current * 15, 12);
      ref.current.children.forEach((p, i) => {
        p.position.x = ((state.clock.elapsedTime * speed + i * 0.4) % 2) - 1;
      });
    }
  });
  return (
    <group ref={ref} position={[0, is2D ? -0.45 : -0.15, 0]}>
      {[0, 1, 2, 3, 4].map(i => (
        <mesh key={i}><sphereGeometry args={[is2D ? 0.07 : 0.04]} /><meshBasicMaterial color={theme === 'dark' ? "#fbbf24" : "#2563eb"} /></mesh>
      ))}
    </group>
  );
};

const CircuitCanvas: React.FC<CircuitCanvasProps> = ({ components, selectedId, onSelect, onUpdatePos, viewMode, pendingType, onDrop, theme }) => {
  const [isDragging, setIsDragging] = useState(false);
  const is2D = viewMode === ViewMode.VIEW_2D;

  return (
    <div className="w-full h-full cursor-crosshair relative">
      <Canvas shadows>
        {is2D ? (
          <OrthographicCamera makeDefault position={[0, 25, 0]} zoom={35} near={0.1} far={1000} />
        ) : (
          <PerspectiveCamera makeDefault position={[10, 10, 10]} fov={35} />
        )}

        <color attach="background" args={[theme === 'dark' ? (is2D ? '#0f172a' : '#020617') : '#f8fafc']} />
        
        <OrbitControls 
          makeDefault 
          enabled={!isDragging && !pendingType}
          enableRotate={!is2D} 
          enablePan={true}
          maxPolarAngle={is2D ? 0 : Math.PI / 2.1}
          minPolarAngle={is2D ? 0 : 0}
        />
        
        {/* ENHANCED LOCAL LIGHTING to replace Environment HDR dependencies */}
        <ambientLight intensity={theme === 'dark' ? 0.4 : 0.8} />
        <pointLight position={[10, 10, 10]} intensity={theme === 'dark' ? 1.5 : 2} />
        {!is2D && (
          <spotLight 
            position={[-15, 20, 15]} 
            angle={0.15} 
            penumbra={1} 
            intensity={theme === 'dark' ? 4 : 2} 
            castShadow 
            shadow-mapSize={[1024, 1024]}
          />
        )}
        {!is2D && <directionalLight position={[0, 5, 5]} intensity={theme === 'dark' ? 0.5 : 1} />}

        <Grid 
          infiniteGrid 
          cellSize={1} 
          sectionSize={5} 
          fadeDistance={is2D ? 5000 : 50} 
          cellColor={theme === 'dark' ? (is2D ? "#1e293b" : "#334155") : "#e2e8f0"} 
          sectionColor={theme === 'dark' ? (is2D ? "#334155" : "#475569") : "#cbd5e1"} 
          position={[0, -0.01, 0]}
        />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
          <planeGeometry args={[100, 100]} />
          <meshBasicMaterial color={theme === 'dark' ? (is2D ? "#0f172a" : "#020617") : "#f1f5f9"} />
        </mesh>

        {components.map((comp) => (
          <ComponentItem 
            key={comp.id} 
            component={comp} 
            isSelected={comp.id === selectedId} 
            onSelect={onSelect}
            onDrag={(x, y) => onUpdatePos(comp.id, x, y)}
            setIsDragging={setIsDragging}
            viewMode={viewMode}
            theme={theme}
          />
        ))}

        {pendingType && (
          <PlacementGhost 
            type={pendingType} 
            viewMode={viewMode} 
            onDrop={(pos) => onDrop(pendingType, pos)} 
            theme={theme}
          />
        )}

        <ConnectionLines components={components} is2D={is2D} theme={theme} />
        {!is2D && <ContactShadows position={[0, 0, 0]} opacity={theme === 'dark' ? 0.6 : 0.2} scale={25} blur={2.5} far={8} />}
      </Canvas>

      {is2D && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none">
           <div className={`backdrop-blur-xl px-12 py-3 rounded-full border-2 text-[10px] font-black uppercase tracking-[0.5em] shadow-2xl ${theme === 'dark' ? 'bg-slate-900/95 border-slate-700/60 text-slate-300 shadow-black' : 'bg-white/95 border-slate-200 text-slate-500 shadow-blue-500/10'}`}>
             PLANE SCHEMATIC VIEW
           </div>
        </div>
      )}
      
      {pendingType && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 pointer-events-none animate-bounce">
           <div className="bg-blue-600/90 backdrop-blur-xl px-6 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-2xl border border-white/10">
             Release to Place Component
           </div>
        </div>
      )}
    </div>
  );
};

export default CircuitCanvas;
