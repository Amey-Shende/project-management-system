import Link from "next/link"

function NotFoundPage({ navigateLink }: { navigateLink: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-(--spacing(24)))]">
            <h1 className="text-8xl font-extrabold text-transparent bg-clip-text bg-linear-to-r from-purple-400 to-blue-600 mb-4 drop-shadow-lg">
                404
            </h1>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Page Not Found</h2>
            <p className="text-lg text-gray-600 mb-8">
                The page you are looking for does not exist or has been moved.
            </p>
            <Link
                href={navigateLink}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
                Go Home
            </Link>
        </div>
    )
}

export default NotFoundPage
