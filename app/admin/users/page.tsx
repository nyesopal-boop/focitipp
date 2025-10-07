"use client";
import { useEffect, useState } from "react";

type Row = { id: string; email: string; role: string; createdAt: string; status?: string; currentPeriodEnd?: string | null };

export default function AdminUsers() {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/admin/users");
      const j = await r.json();
      setRows(j.users || []);
    })();
  }, []);

  return (
    <main className="max-w-4xl mx-auto my-8 p-6">
      <h1 className="text-2xl font-bold mb-4">Felhasználók</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Szerep</th>
              <th className="p-2 border">Regisztrált</th>
              <th className="p-2 border">Előfizetés</th>
              <th className="p-2 border">Lejár</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="odd:bg-gray-50">
                <td className="p-2 border">{r.email}</td>
                <td className="p-2 border">{r.role}</td>
                <td className="p-2 border">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="p-2 border">{r.status || "inactive"}</td>
                <td className="p-2 border">{r.currentPeriodEnd ? new Date(r.currentPeriodEnd).toLocaleString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}