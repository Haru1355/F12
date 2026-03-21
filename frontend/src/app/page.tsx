import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      {/* Hero секция */}
      <section className="w-full bg-gradient-to-br from-indigo-50 to-white py-20">
        <div className="container mx-auto px-4 text-center ">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Проф<span className="text-indigo-600">ДНК</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Онлайн-платформа для профориентологов. Создавайте тесты, проводите диагностику,
            получайте детальные отчёты — всё в одном контуре.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/register"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Начать работу
            </Link>
            <Link
              href="/login"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Войти
            </Link>
          </div>
        </div>
      </section>

      {/* Блок с преимуществами */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Почему ПрофДНК?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">Конструктор методик</h3>
              <p className="text-gray-600">Собирайте тесты из любых типов вопросов, настраивайте логику и формулы.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">Проход по ссылке</h3>
              <p className="text-gray-600">Клиенты проходят тестирование без регистрации по уникальной ссылке.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Два вида отчётов</h3>
              <p className="text-gray-600">Профессиональный отчёт для психолога и клиентский — в формате DOCX/HTML.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-gray-50 py-8 border-t">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          © 2026 ПрофДНК. Платформа для профориентации и психодиагностики.
        </div>
      </footer>
    </main>
  );
}
