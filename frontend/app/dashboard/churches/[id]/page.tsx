// The `params` prop from Next.js's dynamic-route contract isn't read yet — this
// page is a "coming soon" placeholder. Once the detail view is built, accept
// `{ params }: { params: Promise<{ id: string }> }`.
export default function ChurchDetailPage() {
  return (
    <div className="py-12 text-center text-sm text-muted-foreground">
      Church detail — coming soon
    </div>
  );
}
