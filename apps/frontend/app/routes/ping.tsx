import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";

/**
 * Ping endpoint for Remix development server health checks
 */
export async function loader({ request }: LoaderFunctionArgs) {
  return new Response("OK", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}

/**
 * Handle POST requests for ping checks
 */
export async function action({ request }: ActionFunctionArgs) {
  return new Response("OK", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
