import packageJson from "../../../package.json";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-500">
      <p>
        Gallardo Camp 2026
        <span aria-hidden="true" className="mx-2 text-[var(--accent)]">
          ·
        </span>
        <span>v{packageJson.version}</span>
      </p>
    </footer>
  );
}
