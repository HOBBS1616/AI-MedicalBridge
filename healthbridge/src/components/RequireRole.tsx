import { NavLink } from "react-router-dom";
import { getCurrentUser, type Role } from "../lib/auth";

type Props = {
    roles?: Role[];
    children: React.ReactNode;
};

export default function RequireRole({ roles, children }: Props) {
    const user = getCurrentUser();

    if (!user) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold">Sign in required</h1>
                <p className="mt-2 text-textSecondary">
                    Please sign in to access this section.
                </p>
                <NavLink to="/login" className="mt-4 inline-flex virtua-button bg-faith text-black">
                    Go to sign in
                </NavLink>
            </div>
        );
    }

    if (roles && !roles.includes(user.role)) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12">
                <h1 className="text-3xl font-bold">Access restricted</h1>
                <p className="mt-2 text-textSecondary">
                    Your role does not have access to this area. Contact an admin if you need access.
                </p>
                <NavLink to="/dashboard" className="mt-4 inline-flex virtua-button">
                    Back to dashboard
                </NavLink>
            </div>
        );
    }

    return <>{children}</>;
}
