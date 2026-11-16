import { Outlet, useParams } from 'react-router';

// public page to book appointments with business
export default function PublicLayout() {
  const { slug } = useParams();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-3xl items-center px-4">
          <span className="text-lg font-semibold">{slug}</span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
