import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-linear-to-r from-blue-500 to-blue-600 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Manage Your Church Retirement?
          </h2>
          <p className="text-lg opacity-95 mb-8">
            Join organizations already using KAG Retirement to streamline their pastor retirement management.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Get Started Now
          </Link>
        </div>
      </div>
    </section>
  );
}
