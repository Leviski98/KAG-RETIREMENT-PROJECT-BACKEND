export default function Stats() {
  const stats = [
    { number: "47", label: "Districts" },
    { number: "186", label: "Sections" },
    { number: "1,540", label: "Pastors" },
    { number: "3,890", label: "Beneficiaries" },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="bg-gray-100 rounded-lg p-8 mb-4">
                <p className="text-4xl lg:text-5xl font-bold text-gray-800">
                  {stat.number}
                </p>
              </div>
              <p className="text-gray-600 font-medium text-sm lg:text-base">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
