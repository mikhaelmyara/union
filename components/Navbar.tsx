export default function Navbar() {
  return (
    <header className="border-b bg-white px-4 py-4 md:px-8">
      <nav className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <a href="/" className="text-2xl font-bold">
          UNION
        </a>

        <div className="flex flex-wrap gap-4 text-sm md:text-base">
          <a href="/dashboard">Mon espace</a>
          <a href="/lead">Ajouter un lead</a>
          <a href="/login">Connexion</a>
        </div>
      </nav>
    </header>
  );
}