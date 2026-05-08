export default function PastorDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Pastor Profile</h1>
      <p>Pastor ID: {params.id}</p>
    </div>
  );
}
