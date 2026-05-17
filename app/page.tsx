export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto flex max-w-6xl flex-col items-center justify-center px-8 py-24 text-center">
        <p className="mb-4 rounded-full border bg-white px-4 py-2 text-sm font-medium">
          Plateforme leads & partenaires
        </p>

        <h1 className="max-w-3xl text-5xl font-bold tracking-tight">
          UNION connecte les campagnes, les clients et les partenaires.
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          Gérez vos campagnes, vos leads, vos codes partenaires et vos récompenses depuis une seule plateforme simple et sécurisée.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <a href="/signup" className="rounded bg-black px-6 py-3 text-white">
            Créer un compte
          </a>

          <a href="/login" className="rounded border bg-white px-6 py-3">
            Se connecter
          </a>
        </div>
      </section>
      <section className="mx-auto grid max-w-6xl gap-6 px-8 pb-24 md:grid-cols-3">
  <div className="rounded bg-white p-6 shadow-sm">
    <h2 className="mb-2 text-xl font-bold">Campagnes</h2>
    <p className="text-gray-600">
      Créez et gérez vos campagnes depuis un dashboard fondateur.
    </p>
  </div>

  <div className="rounded bg-white p-6 shadow-sm">
    <h2 className="mb-2 text-xl font-bold">Partenaires</h2>
    <p className="text-gray-600">
      Chaque partenaire possède un code unique pour suivre ses leads.
    </p>
  </div>

  <div className="rounded bg-white p-6 shadow-sm">
    <h2 className="mb-2 text-xl font-bold">Récompenses</h2>
    <p className="text-gray-600">
      Les gains sont calculés automatiquement après validation.
    </p>
  </div>
</section>
    </main>
  );
}