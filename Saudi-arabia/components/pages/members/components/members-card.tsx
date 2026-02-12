import Image from "next/image";
import Link from "next/link";


export default function MembersCard() {
    return (
        <div className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700">
            {/* Background gradient overlay */}
            <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 opacity-50"></div>
            
            {/* Content */}
            <div className="relative p-6 flex flex-col items-center">
                {/* Avatar */}
                <div className="relative mb-4">
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-white dark:ring-gray-700 shadow-lg group-hover:ring-blue-400 transition-all duration-300">
                        <Image 
                            src="/members.jpg" 
                            alt="Members"
                            width={96}
                            height={96}
                            className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-300"
                        />
                    </div>
                  
                </div>

                {/* User Info */}
                <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                       Login
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID:1
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                        Type
                    </span>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 w-full">
                    <Link 
                        href="https://github.com/login"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors text-center"
                    >
                        View Profile
                    </Link>
                </div>

                {/* Stats Section */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 w-full">
                    <div className="flex justify-around text-center">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Repos</span>
                            <div className="w-8 h-8 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v2a1 1 0 102 0V9z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Followers</span>
                            <div className="w-8 h-8 mx-auto bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">Following</span>
                            <div className="w-8 h-8 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}