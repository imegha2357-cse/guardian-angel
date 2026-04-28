import { type ReactNode, useMemo, useState } from "react";
import {
  Activity,
  AlarmClock,
  BadgeCheck,
  BellRing,
  Bluetooth,
  BrainCircuit,
  Camera,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Flame,
  Gauge,
  type LucideIcon,
  MapPin,
  MessageSquareWarning,
  Mic,
  PhoneCall,
  RadioTower,
  RotateCcw,
  Satellite,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Smartphone,
  Users,
  Volume2,
  Waves,
  Wifi,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type Role = "Command" | "Security" | "Medical" | "Management";
type IncidentStatus = "Active" | "Verifying" | "Contained";

const incidents = [
  {
    id: "INC-4187",
    zone: "Lobby Atrium",
    type: "Violence risk",
    status: "Active" as IncidentStatus,
    confidence: 0.91,
    severity: "Critical",
    sensors: ["mic", "gyro", "camera", "gps"],
    instruction: "Security to entrance X. Guests reroute to stairwell B.",
  },
  {
    id: "INC-4191",
    zone: "Service Corridor",
    type: "Smoke / fire",
    status: "Verifying" as IncidentStatus,
    confidence: 0.74,
    severity: "High",
    sensors: ["camera", "mic", "gps"],
    instruction: "Dispatch fire marshal. Hold elevator routing.",
  },
  {
    id: "INC-4193",
    zone: "Parking Deck B2",
    type: "Medical fall",
    status: "Contained" as IncidentStatus,
    confidence: 0.67,
    severity: "Medium",
    sensors: ["accelerometer", "gyro"],
    instruction: "Medical team notified. Keep route clear.",
  },
];

const sensorWeights = [
  { label: "Accelerometer", value: 86, icon: Activity },
  { label: "Gyroscope", value: 72, icon: RotateCcw },
  { label: "Microphone", value: 93, icon: Mic },
  { label: "GPS Movement", value: 64, icon: Satellite },
  { label: "Camera AI", value: 78, icon: Camera },
];

const comms = [
  { label: "Internet", icon: Wifi, status: "Primary online", value: 98 },
  { label: "SMS", icon: Smartphone, status: "Fallback armed", value: 91 },
  { label: "Bluetooth Mesh", icon: Bluetooth, status: "32 relays", value: 76 },
  { label: "WiFi Direct", icon: RadioTower, status: "Offline relay ready", value: 82 },
];

const zones = [
  { name: "Atrium", x: "18%", y: "23%", state: "danger" },
  { name: "Stair B", x: "68%", y: "18%", state: "safe" },
  { name: "Cafe", x: "44%", y: "48%", state: "watch" },
  { name: "Deck B2", x: "76%", y: "70%", state: "medical" },
];

const architecture = [
  ["MVP Live", "Sensor confidence scoring", "Working"],
  ["MVP Live", "Multi-channel verification", "Working"],
  ["MVP Live", "Role-based response views", "Working"],
  ["MVP Live", "Comms fallback simulation", "Working"],
  ["Designed", "Bluetooth / WiFi mesh relay", "Scalable"],
  ["Designed", "Adaptive venue learning", "Scalable"],
  ["Designed", "First responder portal", "Scalable"],
];

const roleInstructions: Record<Role, string[]> = {
  Command: ["Maintain geo-broadcast to affected zones only", "Escalate if no acknowledgment within 45 seconds"],
  Security: ["Block entrance X", "Approach silently; distress mode may be active"],
  Medical: ["Proceed to Parking Deck B2", "Bring trauma kit and wheelchair route card"],
  Management: ["Monitor SLA response benchmarks", "Prepare incident report and consent audit"],
};

const Index = () => {
  const [selectedIncident, setSelectedIncident] = useState(incidents[0]);
  const [role, setRole] = useState<Role>("Command");
  const [silentMode, setSilentMode] = useState(true);
  const [simulation, setSimulation] = useState(false);
  const [acked, setAcked] = useState<string[]>(["Security-02", "Medic-01"]);
  const [systemMessage, setSystemMessage] = useState("Hybrid communications stable. AI rules fallback armed.");

  const confidence = useMemo(() => Math.round(selectedIncident.confidence * 100), [selectedIncident]);

  const triggerDrill = () => {
    setSimulation(true);
    setSystemMessage("Simulation drill started: alarms muted for guests, staff routing enabled.");
  };

  const escalate = () => {
    setSystemMessage("Escalation sent via app alert, SMS fallback, repeated call attempts, and geo-broadcast.");
    setAcked((current) => Array.from(new Set([...current, "Emergency-Dispatch", "Manager-01"])));
  };

  const cancelAlert = () => {
    setSystemMessage("Smart cancellation verified by tap pattern + voice check. Incident moved to review.");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-command text-foreground">
      <section className="relative min-h-screen command-grid">
        <div className="scanline pointer-events-none absolute inset-x-0 top-0 h-48" />
        <div className="command-radials absolute inset-0" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-[1500px] flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
          <header className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-primary">
                  <CircleDot className="h-3.5 w-3.5 animate-pulse" /> Live command model
                </span>
                <span>Production deployment architecture • MVP separated from scalable systems</span>
              </div>
              <h1 className="font-display text-4xl font-bold tracking-normal sm:text-5xl lg:text-6xl">CrisisNet</h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="console" onClick={triggerDrill}><AlarmClock /> Drill</Button>
              <Button variant="command" onClick={escalate}><BellRing /> Escalate</Button>
              <Button variant="alert" onClick={cancelAlert}><ShieldAlert /> Cancel / Verify</Button>
            </div>
          </header>

          <div className="grid flex-1 gap-5 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
            <aside className="space-y-4">
              <Panel title="Incident Queue" icon={Siren}>
                <div className="space-y-3">
                  {incidents.map((incident) => (
                    <button
                      key={incident.id}
                      onClick={() => setSelectedIncident(incident)}
                      className={cn(
                        "w-full rounded-lg border p-3 text-left transition hover:-translate-y-0.5 hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring",
                        selectedIncident.id === incident.id ? "border-primary bg-primary/10" : "border-border bg-surface/70",
                      )}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-display text-lg font-semibold">{incident.zone}</span>
                        <StatusPill status={incident.status} />
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{incident.type} • {incident.id}</p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Gauge className="h-4 w-4 text-primary" /> Fusion confidence {Math.round(incident.confidence * 100)}%
                      </div>
                    </button>
                  ))}
                </div>
              </Panel>

              <Panel title="Role View" icon={Users}>
                <div className="grid grid-cols-2 gap-2">
                  {(["Command", "Security", "Medical", "Management"] as Role[]).map((item) => (
                    <Button key={item} variant={role === item ? "command" : "console"} size="sm" onClick={() => setRole(item)}>
                      {item}
                    </Button>
                  ))}
                </div>
                <div className="mt-4 space-y-2">
                  {roleInstructions[role].map((item) => (
                    <div key={item} className="flex gap-2 rounded-md bg-surface-strong/70 p-2 text-sm">
                      <ChevronRight className="mt-0.5 h-4 w-4 text-accent" /> {item}
                    </div>
                  ))}
                </div>
              </Panel>
            </aside>

            <section className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                <Panel title="Live Indoor Evacuation Map" icon={MapPin} className="min-h-[430px]">
                  <div className="relative h-[360px] overflow-hidden rounded-lg border border-border bg-surface shadow-command">
                    <div className="absolute inset-6 rounded-md border border-border bg-background/40" />
                    <div className="absolute left-[8%] top-[34%] h-20 w-[76%] rounded-md border border-border bg-surface-strong/70" />
                    <div className="absolute left-[58%] top-[12%] h-[76%] w-16 rounded-md border border-border bg-surface-strong/60" />
                    <div className="absolute bottom-7 left-8 right-8 h-2 rounded-full bg-map-safe" />
                    <div className="absolute bottom-10 right-10 rounded-full bg-map-safe px-3 py-1 text-xs font-semibold text-primary-foreground">Exit B</div>
                    {zones.map((zone) => (
                      <button
                        key={zone.name}
                        className={cn(
                          "absolute rounded-full border px-3 py-1 text-xs font-semibold shadow-command transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring",
                          zone.state === "danger" && "border-danger bg-danger text-destructive-foreground",
                          zone.state === "safe" && "border-success bg-success text-primary-foreground",
                          zone.state === "watch" && "border-warning bg-warning text-accent-foreground",
                          zone.state === "medical" && "border-info bg-info text-primary-foreground",
                        )}
                        style={{ left: zone.x, top: zone.y }}
                        onClick={() => setSystemMessage(`${zone.name} selected: routing and geo-broadcast zone updated.`)}
                      >
                        <span className="absolute inset-0 -z-10 rounded-full bg-current opacity-30 animate-pulse-signal" />
                        {zone.name}
                      </button>
                    ))}
                    <div className="absolute left-8 top-8 rounded-lg border border-border bg-background/85 p-3 backdrop-blur">
                      <p className="text-xs uppercase text-muted-foreground">Dynamic route</p>
                      <p className="font-display text-xl font-semibold">Avoid Atrium → Stairwell B</p>
                    </div>
                  </div>
                </Panel>

                <Panel title="Multi-Sensor Fusion" icon={BrainCircuit}>
                  <div className="rounded-lg border border-border bg-surface-strong/70 p-4">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Agreement threshold</p>
                        <p className="font-display text-5xl font-bold text-primary">{confidence}%</p>
                      </div>
                      <StatusPill status={selectedIncident.status} />
                    </div>
                    <Progress value={confidence} className="mt-4 h-3" />
                    <p className="mt-3 text-sm text-muted-foreground">{selectedIncident.instruction}</p>
                  </div>
                  <div className="mt-4 space-y-3">
                    {sensorWeights.map((sensor) => (
                      <div key={sensor.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2"><sensor.icon className="h-4 w-4 text-primary" /> {sensor.label}</span>
                          <span>{sensor.value}%</span>
                        </div>
                        <Progress value={sensor.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>

              <Panel title="Verification + Emergency Execution" icon={ShieldCheck}>
                <div className="grid gap-3 md:grid-cols-4">
                  <ActionTile icon={Volume2} title="Loud alarm" onClick={() => setSystemMessage("Audible alarm triggered for affected zones only.")} />
                  <ActionTile icon={Waves} title="Vibration" onClick={() => setSystemMessage("Emergency haptic pattern sent to guests and staff.")} />
                  <ActionTile icon={MessageSquareWarning} title="Voice check" onClick={() => setSystemMessage("Voice assistant asking: Are you safe? Offline keyword detection active.")} />
                  <ActionTile icon={PhoneCall} title="Call loop" onClick={() => setSystemMessage("Repeated call attempts started with SMS and app alert backup.")} />
                </div>
                <div className="mt-4 flex flex-col gap-3 rounded-lg border border-border bg-surface/70 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-display text-lg font-semibold">Silent distress mode</p>
                    <p className="text-sm text-muted-foreground">Confirms distress without visible alarm for harassment or violence scenarios.</p>
                  </div>
                  <Switch checked={silentMode} onCheckedChange={setSilentMode} />
                </div>
              </Panel>
            </section>

            <aside className="space-y-4">
              <Panel title="Hybrid Communications" icon={RadioTower}>
                <div className="space-y-3">
                  {comms.map((item) => (
                    <div key={item.label} className="rounded-lg border border-border bg-surface/70 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 font-semibold"><item.icon className="h-4 w-4 text-primary" /> {item.label}</span>
                        <span className="text-muted-foreground">{item.value}%</span>
                      </div>
                      <Progress value={item.value} className="mt-2 h-2" />
                      <p className="mt-2 text-xs text-muted-foreground">{item.status}</p>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Acknowledgments" icon={BadgeCheck}>
                <div className="space-y-2">
                  {acked.map((person) => (
                    <div key={person} className="flex items-center justify-between rounded-md bg-surface-strong/70 p-2 text-sm">
                      <span>{person}</span><CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Architecture Reality Check" icon={Zap}>
                <Tabs defaultValue="mvp">
                  <TabsList className="grid w-full grid-cols-2 bg-surface-strong">
                    <TabsTrigger value="mvp">MVP</TabsTrigger>
                    <TabsTrigger value="scale">Scalable</TabsTrigger>
                  </TabsList>
                  <TabsContent value="mvp" className="space-y-2 pt-3">
                    {architecture.filter((item) => item[0] === "MVP Live").map((item) => <ArchRow key={item[1]} item={item} />)}
                  </TabsContent>
                  <TabsContent value="scale" className="space-y-2 pt-3">
                    {architecture.filter((item) => item[0] === "Designed").map((item) => <ArchRow key={item[1]} item={item} />)}
                  </TabsContent>
                </Tabs>
              </Panel>
            </aside>
          </div>

          <footer className="rounded-lg border border-border bg-surface/80 p-3 text-sm text-muted-foreground shadow-command">
            <span className="text-primary">System:</span> {systemMessage} {simulation && "Training mode active."} {silentMode && " Silent distress enabled."}
          </footer>
        </div>
      </section>
    </main>
  );
};

const Panel = ({ title, icon: Icon, className, children }: { title: string; icon: LucideIcon; className?: string; children: ReactNode }) => (
  <section className={cn("rounded-xl border border-border bg-card/78 p-4 shadow-command backdrop-blur-xl", className)}>
    <div className="mb-4 flex items-center gap-2">
      <span className="rounded-md bg-primary/10 p-2 text-primary"><Icon className="h-4 w-4" /></span>
      <h2 className="font-display text-lg font-semibold">{title}</h2>
    </div>
    {children}
  </section>
);

const StatusPill = ({ status }: { status: IncidentStatus }) => (
  <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", status === "Active" && "bg-danger text-destructive-foreground", status === "Verifying" && "bg-warning text-accent-foreground", status === "Contained" && "bg-success text-primary-foreground")}>{status}</span>
);

const ActionTile = ({ icon: Icon, title, onClick }: { icon: LucideIcon; title: string; onClick: () => void }) => (
  <button onClick={onClick} className="rounded-lg border border-border bg-surface/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/60 hover:bg-surface-strong focus:outline-none focus:ring-2 focus:ring-ring">
    <Icon className="mb-3 h-5 w-5 text-accent" />
    <p className="font-display font-semibold">{title}</p>
  </button>
);

const ArchRow = ({ item }: { item: string[] }) => (
  <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface/70 p-2 text-sm">
    <span>{item[1]}</span>
    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">{item[2]}</span>
  </div>
);

export default Index;