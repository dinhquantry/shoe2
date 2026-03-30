import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CustomerPlaceholderPageProps = {
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
};

export function CustomerPlaceholderPage({
  title,
  description,
  primaryHref,
  primaryLabel,
}: CustomerPlaceholderPageProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6">
      <div className="space-y-3">
        <span className="inline-flex w-fit rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
          Customer route scaffold
        </span>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
        <p className="max-w-2xl text-base leading-7 text-slate-600">{description}</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg text-slate-900">San sang de phat trien tiep</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm leading-6 text-slate-600">
          <p>
            Thu muc va route da duoc tao theo cau truc moi de team co the bo sung UI,
            query va state management ma khong can doi lai layout lan nua.
          </p>
          <Link href={primaryHref}>
            <Button className="bg-slate-950 text-white hover:bg-slate-800">
              {primaryLabel}
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
