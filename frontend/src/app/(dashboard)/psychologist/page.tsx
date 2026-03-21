export default function PsychologistDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Дашборд психолога</h1>
      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Мои опросники</h3>
            <p className="mt-2 text-gray-500">Создавайте и управляйте тестами</p>
            <button className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm">
              Создать тест
            </button>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Результаты</h3>
            <p className="mt-2 text-gray-500">Просмотр прохождений и отчёты</p>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900">Отчёты</h3>
            <p className="mt-2 text-gray-500">Формирование DOCX/HTML</p>
          </div>
        </div>
      </div>
    </div>
  );
}
