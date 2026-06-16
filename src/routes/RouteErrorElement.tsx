import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";
import Button from "../components/ui/Button";

function getErrorMessage(error: unknown) {
  if (isRouteErrorResponse(error)) {
    return `${error.status} ${error.statusText}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong while loading this page.";
}

export default function RouteErrorElement() {
  const error = useRouteError();

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-start justify-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">
          Page error
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">
          This page could not be loaded.
        </h1>
        <p className="mt-4 text-sm leading-6 text-gray-600">
          {getErrorMessage(error)}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => window.location.reload()}>
            Try again
          </Button>
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
