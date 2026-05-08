export default function DistrictDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">District Detail</h1>
      <p>District ID: {params.id}</p>
    </div>
  );
}
