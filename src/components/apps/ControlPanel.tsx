import skills from "@/data/skills.json";

export default function ControlPanel() {
  return (
    <div>
      <p className="mb-2 text-dim">installed programs</p>
      <ul>
        {skills.map((s) => (
          <li key={s.name} className="flex justify-between gap-4" aria-label={`${s.name}: level ${s.level} of 5`}>
            <span>{s.name}</span>
            <span aria-hidden>
              [{"█".repeat(s.level * 2)}
              <span className="text-dim">{"░".repeat(10 - s.level * 2)}</span>]
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
