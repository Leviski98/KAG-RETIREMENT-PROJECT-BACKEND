export default function SectionDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Section Detail</h1>
      <p>Section ID: {params.id}</p>
    </div>
  );
}
