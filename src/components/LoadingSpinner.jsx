export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="w-10 h-10 rounded-full border-2 border-zinc-700 border-t-green-500 animate-spin" />
      <p className="text-sm text-zinc-400">Chargement des événements...</p>
    </div>
  );
}