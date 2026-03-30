import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminPlaceholderPageProps = {
  title: string;
  description: string;
};

export function AdminPlaceholderPage({
  title,
  description,
}: AdminPlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="text-sm text-zinc-500">{description}</p>
        </div>

        <Link href="/admin">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lai dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trang dang duoc hoan thien</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-zinc-600">
          <p>
            Route nay da co san de demo khong bi 404. Phan nghiep vu chi tiet se
            duoc bo sung tiep o buoc sau.
          </p>
          <p>
            Trong luc cho doi, ban van co the thao tac voi cac module da hoan
            thien hon nhu brands, categories, products va auth.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
