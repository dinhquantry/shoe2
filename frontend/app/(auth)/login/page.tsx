import { LoginForm } from "@/app/(auth)/_components/login-form";

type LoginPageProps = {
  searchParams:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

function getSingleValue(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const defaultEmail = getSingleValue(resolvedSearchParams.email);
  const registered = getSingleValue(resolvedSearchParams.registered) === "1";

  return <LoginForm defaultEmail={defaultEmail} registered={registered} />;
}
