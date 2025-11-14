import { useState } from "react"
import { Link } from "react-router"
import { NavbarItem } from "../../Constants/NavbarItem"
import type { NavbarItems } from "../../Types/Global"
import MyApplications from "../../Features/Components/MyApplications"
import { useAuth } from "../../Context/AuthContext"

const Header = () => {
    const [isMyApplicationsOpen, setIsMyApplicationsOpen] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { openLogin, isAuthenticated } = useAuth()

    return (
        <>
            <header className="sticky top-0 z-50 bg-white shadow-lg border-b border-gray-200 font-sans">
                <nav className="max-w-[1600px] mx-auto px-6 sm:px-8 lg:px-12 py-1">
                    <div className="flex items-center justify-between">

                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0">
                            <img
                                className="h-16 w-auto sm:h-20"
                                src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Upwork-logo.svg/2560px-Upwork-logo.svg.png"
                                alt="JobB Logo"
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-10">
                            {NavbarItem.map((item: NavbarItems) => (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    className="text-lg font-medium text-gray-700 hover:text-blue-600 transition-colors duration-200 px-3 py-2"
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Action Buttons & Mobile Menu */}
                        <div className="flex items-center space-x-5 sm:space-x-6">
                            {/* Desktop Buttons */}
                            <div className="hidden sm:flex items-center space-x-5">
                                <button onClick={() => openLogin()} className="px-6 py-3 text-gray-700 font-medium border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-lg">
                                    {isAuthenticated ? 'Account' : 'Login'}
                                </button>
                                <button
                                    onClick={() => setIsMyApplicationsOpen(true)}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 text-lg flex items-center gap-2"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    My Jobs
                                </button>
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden inline-flex items-center justify-center p-3 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden mt-4 pt-4 border-t border-gray-100 space-y-4">
                            {NavbarItem.map((item: NavbarItems) => (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="block px-4 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    {item.name}
                                </Link>
                            ))}
                            <div className="pt-3 flex flex-col space-y-3">
                                <button className="w-full px-6 py-3 text-gray-700 font-medium border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all text-lg" onClick={() => openLogin()}>
                                    {isAuthenticated ? 'Account' : 'Login'}
                                </button>
                                <button
                                    onClick={() => {
                                        setIsMyApplicationsOpen(true)
                                        setIsMobileMenuOpen(false)
                                    }}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-medium rounded-lg hover:shadow-lg transition-all text-lg flex items-center justify-center gap-2"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                    My Jobs
                                </button>
                            </div>
                        </div>
                    )}
                </nav>
            </header>

            <MyApplications
                isOpen={isMyApplicationsOpen}
                onClose={() => setIsMyApplicationsOpen(false)}
            />
        </>
    )
}

export default Header
