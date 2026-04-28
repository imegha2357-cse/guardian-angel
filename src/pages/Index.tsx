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
  Clock3,
  CloudOff,
  FileDown,
  Filter,
  Flame,
  Gauge,
  LocateFixed,
  MessageCircle,
  type LucideIcon,
  MapPin,
  MessageSquareWarning,
  Mic,
  Route,
  PhoneCall,
  RadioTower,
  RotateCcw,
  Satellite,
  Send,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Smartphone,
  UserCheck,
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
type AckStatus = "confirmed" | "failed" | "pending";
type Channel = "App" | "SMS" | "Call" | "Mesh";
type StaffRole = Role | "Warden" | "External" | "Facilities" | "Fire";
type RoleFilter = StaffRole | "All";

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
  { name: "Atrium", x: "18%", y: "23%", state: "danger", coverage: 96, devices: 42 },
  { name: "Stair B", x: "68%", y: "18%", state: "safe", coverage: 88, devices: 21 },
  { name: "Cafe", x: "44%", y: "48%", state: "watch", coverage: 72, devices: 18 },
  { name: "Deck B2", x: "76%", y: "70%", state: "medical", coverage: 61, devices: 14 },
];

const recipients = [
  { name: "Security-02", role: "Security" as StaffRole, zone: "Lobby Atrium", channel: "App" as Channel, status: "confirmed" as AckStatus },
  { name: "Medic-01", role: "Medical" as StaffRole, zone: "Parking Deck B2", channel: "SMS" as Channel, status: "confirmed" as AckStatus },
  { name: "Floor Lead-3", role: "Warden" as StaffRole, zone: "Cafe", channel: "App" as Channel, status: "pending" as AckStatus },
  { name: "Manager-01", role: "Management" as StaffRole, zone: "Command", channel: "Call" as Channel, status: "failed" as AckStatus },
  { name: "Emergency-Dispatch", role: "External" as StaffRole, zone: "City relay", channel: "Mesh" as Channel, status: "pending" as AckStatus },
];

const geozones = [
  { name: "Lobby Atrium", audience: "Guests + Security", route: "Exit B via Stairwell B", blocked: "Entrance X" },
  { name: "Service Corridor", audience: "Facilities + Fire Marshal", route: "Loading Bay C", blocked: "Elevators" },
  { name: "Parking Deck B2", audience: "Medical + Security", route: "Ramp East", blocked: "North lift" },
];

const staffRoster = [
  { name: "Security-02", role: "Security" as StaffRole },
  { name: "Medic-01", role: "Medical" as StaffRole },
  { name: "Floor Lead-3", role: "Warden" as StaffRole },
  { name: "Manager-01", role: "Management" as StaffRole },
  { name: "Fire Marshal-04", role: "Fire" as StaffRole },
  { name: "Facilities-07", role: "Facilities" as StaffRole },
];

const roleFilters: RoleFilter[] = ["All", "Security", "Medical", "Warden", "Management", "Facilities", "Fire"];

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
  const [ackRound, setAckRound] = useState(1);
  const [offlineDrill, setOfflineDrill] = useState(false);
  const [activeGeozone, setActiveGeozone] = useState(geozones[0]);
  const [assignedStaff, setAssignedStaff] = useState<string[]>(["Security-02", "Medic-01"]);
  const [timeline, setTimeline] = useState([
    "00:00 Impact + microphone anomaly detected",
    "00:08 Fusion confidence crossed response threshold",
    "00:15 Geo-broadcast limited to Lobby Atrium",
  ]);
  const [timelineIndex, setTimelineIndex] = useState(3);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("All");
  const [systemMessage, setSystemMessage] = useState("Hybrid communications stable. AI rules fallback armed.");

  const confidence = useMemo(() => Math.round(selectedIncident.confidence * 100), [selectedIncident]);
  const visibleTimeline = useMemo(() => timeline.slice(0, timelineIndex), [timeline, timelineIndex]);
  const filteredStaff = useMemo(() => staffRoster.filter((person) => roleFilter === "All" || person.role === roleFilter), [roleFilter]);
  const drillResults = useMemo(() => {
    const confirmed = recipients.filter((person) => acked.includes(person.name)).length;
    const failed = recipients.filter((person) => person.status === "failed" && !acked.includes(person.name)).length;
    const pending = recipients.length - confirmed - failed;
    return [
      { label: "Recipients confirmed", value: `${confirmed}/${recipients.length}`, state: confirmed >= 4 ? "success" : "warning" },
      { label: "Fallback channels reached", value: `${Math.min(ackRound, 4)}/4`, state: ackRound >= 3 ? "success" : "warning" },
      { label: "Offline routing", value: offlineDrill ? "Passed" : "Standby", state: offlineDrill ? "success" : "warning" },
      { label: "Unresolved failures", value: `${failed + pending}`, state: failed + pending === 0 ? "success" : "danger" },
    ];
  }, [ackRound, acked, offlineDrill]);

  const triggerDrill = () => {
    setSimulation(true);
    setTimeline((current) => ["DRILL Offline failure drill armed", ...current].slice(0, 6));
    setSystemMessage("Simulation drill started: alarms muted for guests, staff routing enabled.");
  };

  const escalate = () => {
    setAckRound((current) => Math.min(current + 1, 4));
    setTimeline((current) => [`${new Date().toLocaleTimeString([], { minute: "2-digit", second: "2-digit" })} Priority retry escalated`, ...current].slice(0, 6));
    setSystemMessage("Escalation sent via app alert, SMS fallback, repeated call attempts, and geo-broadcast.");
    setAcked((current) => Array.from(new Set([...current, "Emergency-Dispatch", "Manager-01"])));
  };

  const acknowledgeAll = () => {
    setAcked(recipients.map((person) => person.name));
    setTimeline((current) => ["ACK All recipients confirmed or supervisor-overridden", ...current].slice(0, 6));
    setSystemMessage("Acknowledgment simulator completed: unresolved recipients escalated to supervisor override.");
  };

  const toggleStaff = (person: string) => {
    setAssignedStaff((current) => current.includes(person) ? current.filter((item) => item !== person) : [...current, person]);
    setSystemMessage(`${person} assignment updated for ${selectedIncident.id}.`);
  };

  const acknowledgeRecipient = (person: string) => {
    setAcked((current) => current.includes(person) ? current.filter((item) => item !== person) : [...current, person]);
    setTimeline((current) => [`ACK ${person} status updated`, ...current].slice(0, 8));
    setTimelineIndex((current) => Math.min(current + 1, 8));
  };

  const exportDrillReport = () => {
    const rows = recipients.map((person) => `${person.name} — ${person.role} — ${acked.includes(person.name) ? "confirmed" : person.status === "failed" ? "failed" : "pending"} via ${person.channel}`).join("<br />");
    const report = window.open("", "_blank", "width=760,height=900");
    if (!report) return;
    report.document.write(`<html><head><title>CrisisNet Drill Report</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#111827}h1{margin:0 0 8px}.meta{color:#4b5563;margin-bottom:24px}.card{border:1px solid #d1d5db;border-radius:8px;padding:14px;margin:12px 0}.ok{color:#047857}.warn{color:#b45309}.bad{color:#b91c1c}@media print{button{display:none}}</style></head><body><h1>CrisisNet Offline Drill Report</h1><div class="meta">${selectedIncident.id} • ${selectedIncident.zone} • ${new Date().toLocaleString()}</div><h2>Results</h2>${drillResults.map((item) => `<div class="card"><strong>${item.label}</strong><br/><span class="${item.state === "success" ? "ok" : item.state === "danger" ? "bad" : "warn"}">${item.value}</span></div>`).join("")}<h2>Recipient acknowledgments</h2><div class="card">${rows}</div><h2>Timeline</h2><div class="card">${timeline.join("<br />")}</div><button onclick="window.print()">Export as PDF</button><script>setTimeout(() => window.print(), 300)</script></body></html>`);
    report.document.close();
    setSystemMessage("Drill report prepared in a print-ready PDF export window.");
  };

  const runOfflineDrill = () => {
    setOfflineDrill((current) => !current);
    setAckRound(3);
    setTimeline((current) => ["FAILOVER Internet offline → SMS → call loop → mesh relay", ...current].slice(0, 6));
    setSystemMessage("Offline failure drill running: primary internet blocked, fallback retries escalated by priority.");
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

              <Panel title="Staff Assignment" icon={UserCheck}>
                <div className="mb-3 flex items-center gap-2 overflow-x-auto pb-1">
                  <Filter className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {roleFilters.map((item) => (
                    <Button key={item} variant={roleFilter === item ? "command" : "console"} size="sm" onClick={() => setRoleFilter(item)} className="h-8 shrink-0 px-2 text-xs">
                      {item}
                    </Button>
                  ))}
                </div>
                <div className="space-y-2">
                  {filteredStaff.map((person) => (
                    <button key={person.name} onClick={() => toggleStaff(person.name)} className={cn("flex w-full items-center justify-between rounded-md border p-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-ring", assignedStaff.includes(person.name) ? "border-primary bg-primary/10 text-primary" : "border-border bg-surface/70 hover:border-primary/60")}>
                      <span>{person.name}</span>
                      <span className="text-xs text-muted-foreground">{person.role} • {assignedStaff.includes(person.name) ? "Assigned" : "Standby"}</span>
                    </button>
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
                    <div className="absolute left-8 top-8 rounded-lg border border-border bg-background/90 p-3 backdrop-blur">
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
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface/70 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-display text-lg font-semibold">Silent distress mode</p>
                      <p className="text-sm text-muted-foreground">Confirms distress without visible alarm for harassment or violence scenarios.</p>
                    </div>
                    <Switch checked={silentMode} onCheckedChange={setSilentMode} />
                  </div>
                  <button onClick={runOfflineDrill} className={cn("rounded-lg border p-4 text-left transition hover:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring", offlineDrill ? "border-warning bg-warning/10" : "border-border bg-surface/70")}>
                    <CloudOff className="mb-2 h-5 w-5 text-warning" />
                    <p className="font-display text-lg font-semibold">Offline failure drills</p>
                    <p className="text-sm text-muted-foreground">Simulates internet loss and verifies SMS, call loop, and mesh fallback escalation.</p>
                  </button>
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

              <Panel title="Acknowledgment Simulator" icon={BadgeCheck}>
                <div className="mb-3 grid grid-cols-4 gap-1 rounded-lg border border-border bg-surface/70 p-1 text-xs">
                  {(["App", "SMS", "Call", "Mesh"] as Channel[]).map((channel, index) => (
                    <div key={channel} className={cn("rounded-md px-2 py-1 text-center", ackRound > index ? "bg-primary text-primary-foreground" : "bg-surface-strong text-muted-foreground")}>{channel}</div>
                  ))}
                </div>
                <div className="space-y-2">
                  {recipients.map((person) => {
                    const confirmed = acked.includes(person.name);
                    const failed = person.status === "failed" && !confirmed;
                    return (
                      <div key={person.name} className="rounded-md border border-border bg-surface-strong/70 p-2 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span>{person.name}</span>
                          {confirmed ? <CheckCircle2 className="h-4 w-4 text-success" /> : failed ? <CloudOff className="h-4 w-4 text-danger" /> : <Clock3 className="h-4 w-4 text-warning" />}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{person.role} • {confirmed ? "Confirmed" : failed ? "Failed" : "Retry pending"} via {person.channel}</p>
                      </div>
                    );
                  })}
                </div>
                <Button variant="console" size="sm" className="mt-3 w-full" onClick={acknowledgeAll}><Send /> Run acknowledge simulator</Button>
              </Panel>

              <Panel title="Incident Timeline" icon={Clock3}>
                <div className="space-y-2">
                  {timeline.map((event) => (
                    <div key={event} className="flex gap-2 rounded-md bg-surface/70 p-2 text-sm">
                      <CircleDot className="mt-1 h-3 w-3 shrink-0 text-primary" />
                      <span>{event}</span>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Geozone Routing" icon={Route}>
                <div className="space-y-2">
                  {geozones.map((zone) => (
                    <button key={zone.name} onClick={() => { setActiveGeozone(zone); setSystemMessage(`${zone.name} routing enabled: ${zone.route}.`); }} className={cn("w-full rounded-md border p-2 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-ring", activeGeozone.name === zone.name ? "border-primary bg-primary/10" : "border-border bg-surface/70 hover:border-primary/60")}>
                      <span className="flex items-center gap-2 font-semibold"><LocateFixed className="h-4 w-4 text-accent" /> {zone.name}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{zone.audience}</span>
                    </button>
                  ))}
                </div>
                <div className="mt-3 rounded-md bg-surface-strong/70 p-3 text-sm">
                  Route: {activeGeozone.route}<br />Blocked: {activeGeozone.blocked}
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
  <section className={cn("rounded-xl border border-border bg-card/80 p-4 shadow-command backdrop-blur-xl", className)}>
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