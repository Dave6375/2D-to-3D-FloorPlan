import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("sign-in/*", "(auth)/sign-in/[[...sign-in]]/page.tsx"),
    route("sign-up/*", "(auth)/sign-up/[[...sign-up]]/page.tsx"),
    route('visualizer/:id', "./routes/visualizer.$id.tsx")
] satisfies RouteConfig;
