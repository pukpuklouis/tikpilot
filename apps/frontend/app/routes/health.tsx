import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";

/**
 * Health check endpoint for Docker container health checks
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
 * Handle POST requests for health checks
 */
export async function action({ request }: ActionFunctionArgs) {
  return new Response("OK", {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
