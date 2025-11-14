import { createBrowserRouter } from "react-router";
import Layout from "./Layout";
import Home from "./Features/Pages/Home";
import Shop from "./Features/Pages/Shop";
import JobDetail from "./Features/Pages/JobDetail";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "/",
                element: < Home />,
            },
            {
                path: "/shop",
                element: <Shop />,
            }
            ,
            {
                path: "/jobs/:id",
                element: <JobDetail />,
            }

        ]
    }
])