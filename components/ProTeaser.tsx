export default function ProTeaser() {
  return (
    <div className="mt-6 p-4 rounded-2xl border bg-yellow-50">
      <div className="font-semibold">Váltson PRO felhasználóvá és tudjon meg többet a mérkőzésről!</div>
      <ul className="list-disc pl-5 text-sm mt-2">
        <li>Gólok száma (2,5 felett/alatt)</li>
        <li>Várható végeredmény</li>
        <li>Szögletek tartománya</li>
        <li>Sárgalapok tartománya</li>
      </ul>
      <a href="/pricing" className="inline-block mt-3 px-4 py-2 rounded-xl bg-black text-white">
        Előfizetek
      </a>
    </div>
  );
}