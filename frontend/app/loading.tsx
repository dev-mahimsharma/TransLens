export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-4.5rem)] items-center justify-center bg-void">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-2 border-graphite-dim" />
        <div className="absolute inset-0 rounded-full border-2 border-signal-cyan border-t-transparent animate-spin" />
        <div className="absolute inset-3 rounded-full bg-signal-cyan/10 animate-pulse" />
      </div>
    </div>
  );
}
