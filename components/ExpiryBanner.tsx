type Props = { isPro: boolean; daysLeft: number; expired: boolean };

export default function ExpiryBanner({ isPro, daysLeft, expired }: Props) {
  if (!isPro && !expired) return null;
  if (expired) {
    return (
      <div className="mb-4 p-3 rounded-xl border bg-red-50 text-red-700">
        Előfizetésed lejárt. Kérjük, <a className="underline" href="/pricing">újítsd meg</a>, 
        amíg inaktív, a PRO funkciók nem érhetők el.
      </div>
    );
  }
  // még aktív, de közeleg a lejárat (pl. <= 5 nap)
  if (daysLeft <= 5) {
    return (
      <div className="mb-4 p-3 rounded-xl border bg-amber-50 text-amber-800">
        {daysLeft} nap van hátra az előfizetésedből. 
        <a className="underline ml-1" href="/pricing">Megújítás</a>
      </div>
    );
  }
  return null;
}